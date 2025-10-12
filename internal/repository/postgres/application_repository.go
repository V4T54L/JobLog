package postgres

import (
	"database/sql"
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"math"
	"strings"

	"github.com/jmoiron/sqlx"
)

// type postgresApplicationRepository struct {
// 	db *sqlx.DB
// }

// func NewPostgresApplicationRepository(db *sqlx.DB) repository.CompanyRepository {
// 	return &postgresApplicationRepository{db: db}
// }

// func (r *postgresApplicationRepository) FindOrCreate(company *domain.Company) error {
// 	query := `
//         WITH s AS (
//             SELECT id FROM companies WHERE normalized_name = $1
//         ), i AS (
//             INSERT INTO companies (name, normalized_name)
//             SELECT $2, $1
//             WHERE NOT EXISTS (SELECT 1 FROM s)
//             RETURNING id
//         )
//         SELECT id FROM i
//         UNION ALL
//         SELECT id FROM s
//     `
// 	return r.db.QueryRow(query, company.NormalizedName, company.Name).Scan(&company.ID)
// }

type postgresRoleRepository struct {
	db *sqlx.DB
}

func NewPostgresRoleRepository(db *sqlx.DB) repository.RoleRepository {
	return &postgresRoleRepository{db: db}
}

func (r *postgresRoleRepository) FindOrCreate(role *domain.Role) error {
	query := `
        WITH s AS (
            SELECT id FROM roles WHERE company_id = $1 AND title = $2
        ), i AS (
            INSERT INTO roles (company_id, title)
            SELECT $1, $2
            WHERE NOT EXISTS (SELECT 1 FROM s)
            RETURNING id
        )
        SELECT id FROM i
        UNION ALL
        SELECT id FROM s
    `
	return r.db.QueryRow(query, role.CompanyID, role.Title).Scan(&role.ID)
}

type postgresAppRepo struct {
	db *sqlx.DB
}

func NewPostgresAppRepository(db *sqlx.DB) repository.ApplicationRepository {
	return &postgresAppRepo{db: db}
}

func (r *postgresAppRepo) Create(app *domain.Application) error {
	query := `
        INSERT INTO applications (user_id, company_id, role_id, date_applied, status, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at`
	return r.db.QueryRow(query, app.UserID, app.CompanyID, app.RoleID, app.DateApplied, app.Status, app.Metadata).Scan(&app.ID, &app.DateApplied)
}

func (r *postgresAppRepo) GetByID(id int64, userID int64) (*domain.Application, error) {
	var app domain.Application
	query := `SELECT * FROM applications WHERE id = $1 AND user_id = $2`
	err := r.db.Get(&app, query, id, userID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &app, err
}

func (r *postgresAppRepo) GetApplications(userID int64, params domain.ListParams) (*domain.PaginatedApplications, error) {
	var args []interface{}
	var whereClauses []string

	baseQuery := `
		SELECT a.id, a.user_id, a.company_id, a.role_id, a.date_applied, a.status, a.metadata, a.created_at, a.updated_at
		FROM applications a
	`
	countBaseQuery := `SELECT COUNT(a.id) FROM applications a`

	joinClause := ""
	needsJoin := params.Search != "" || params.SortBy == "company" || params.SortBy == "role"
	if needsJoin {
		joinClause = `
			JOIN companies c ON a.company_id = c.id
			JOIN roles r ON a.role_id = r.id
		`
	}

	args = append(args, userID)
	whereClauses = append(whereClauses, fmt.Sprintf("a.user_id = $%d", len(args)))

	if params.Search != "" {
		args = append(args, "%"+strings.ToLower(params.Search)+"%")
		searchClause := fmt.Sprintf("(LOWER(c.name) LIKE $%d OR LOWER(r.title) LIKE $%d)", len(args), len(args))
		whereClauses = append(whereClauses, searchClause)
	}

	if status, ok := params.Filters["status"]; ok && status != "" {
		args = append(args, status)
		whereClauses = append(whereClauses, fmt.Sprintf("a.status = $%d", len(args)))
	}

	whereClauseStr := ""
	if len(whereClauses) > 0 {
		whereClauseStr = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countQuery := countBaseQuery + joinClause + whereClauseStr
	var totalItems int64
	err := r.db.Get(&totalItems, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count applications: %w", err)
	}

	sortBy := "a.date_applied"
	switch params.SortBy {
	case "company":
		sortBy = "c.name"
	case "role":
		sortBy = "r.title"
	case "status":
		sortBy = "a.status"
	}
	sortOrder := "DESC"
	if strings.ToUpper(params.SortOrder) == "ASC" {
		sortOrder = "ASC"
	}
	orderByClause := fmt.Sprintf(" ORDER BY %s %s", sortBy, sortOrder)

	limit := params.Limit
	if limit <= 0 {
		limit = 10
	}
	page := params.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit
	paginationClause := fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	finalQuery := baseQuery + joinClause + whereClauseStr + orderByClause + paginationClause

	var apps []domain.Application
	err = r.db.Select(&apps, finalQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get applications: %w", err)
	}

	paginatedResult := &domain.PaginatedApplications{
		Applications: apps,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(limit))),
			CurrentPage: page,
			PageSize:    limit,
		},
	}

	return paginatedResult, nil
}

func (r *postgresAppRepo) Update(app *domain.Application) error {
	query := `
        UPDATE applications
        SET company_id = $1, role_id = $2, date_applied = $3, status = $4, metadata = $5, updated_at = NOW()
        WHERE id = $6 AND user_id = $7
    `
	_, err := r.db.Exec(query, app.CompanyID, app.RoleID, app.DateApplied, app.Status, app.Metadata, app.ID, app.UserID)
	return err
}

func (r *postgresAppRepo) Delete(id int64, userID int64) error {
	query := `DELETE FROM applications WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(query, id, userID)
	return err
}

type postgresAppNoteRepository struct {
	db *sqlx.DB
}

func NewPostgresAppNoteRepository(db *sqlx.DB) repository.ApplicationNoteRepository {
	return &postgresAppNoteRepository{db: db}
}

func (r *postgresAppNoteRepository) Create(note *domain.ApplicationNote) error {
	query := `
        INSERT INTO application_notes (application_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, created_at
    `
	return r.db.QueryRow(query, note.ApplicationID, note.UserID, note.Content).Scan(&note.ID, &note.Timestamp)
}

func (r *postgresAppNoteRepository) GetAllForApplication(appID int64, userID int64) ([]domain.ApplicationNote, error) {
	var notes []domain.ApplicationNote
	query := `
        SELECT an.* FROM application_notes an
        JOIN applications a ON an.application_id = a.id
        WHERE an.application_id = $1 AND a.user_id = $2
        ORDER BY an.created_at DESC
    `
	err := r.db.Select(&notes, query, appID, userID)
	return notes, err
}
