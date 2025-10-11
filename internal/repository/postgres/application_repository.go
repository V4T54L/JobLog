package postgres

import (
	"database/sql"
	"job-app-tracker/internal/domain"
	"strings"

	"github.com/jmoiron/sqlx"
)

type postgresApplicationRepository struct {
	db *sqlx.DB
}

func NewPostgresApplicationRepository(db *sqlx.DB) *postgresApplicationRepository {
	return &postgresApplicationRepository{db: db}
}

func (r *postgresApplicationRepository) FindOrCreate(company *domain.Company) error {
	company.NormalizedName = strings.ToLower(strings.TrimSpace(company.Name))
	query := `
        INSERT INTO companies (name, normalized_name, metadata)
        VALUES ($1, $2, $3)
        ON CONFLICT (normalized_name) DO UPDATE SET name = companies.name
        RETURNING id`
	return r.db.QueryRow(query, company.Name, company.NormalizedName, company.Metadata).Scan(&company.ID)
}

type postgresRoleRepository struct {
	db *sqlx.DB
}

func NewPostgresRoleRepository(db *sqlx.DB) *postgresRoleRepository {
	return &postgresRoleRepository{db: db}
}

func (r *postgresRoleRepository) FindOrCreate(role *domain.Role) error {
	query := `
        INSERT INTO roles (company_id, title, metadata)
        VALUES ($1, $2, $3)
        ON CONFLICT (company_id, title) DO UPDATE SET title = roles.title
        RETURNING id`
	return r.db.QueryRow(query, role.CompanyID, role.Title, role.Metadata).Scan(&role.ID)
}

type postgresAppRepo struct {
	db *sqlx.DB
}

func NewPostgresAppRepository(db *sqlx.DB) *postgresAppRepo {
	return &postgresAppRepo{db: db}
}

func (r *postgresAppRepo) Create(app *domain.Application) error {
	query := `
        INSERT INTO applications (user_id, company_id, role_id, date_applied, status, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at, updated_at`
	return r.db.QueryRow(query, app.UserID, app.CompanyID, app.RoleID, app.DateApplied, app.Status, app.Metadata).Scan(&app.ID, &app.CreatedAt, &app.UpdatedAt)
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

func (r *postgresAppRepo) GetAllForUser(userID int64) ([]domain.Application, error) {
	var apps []domain.Application
	query := `SELECT * FROM applications WHERE user_id = $1 ORDER BY date_applied DESC`
	err := r.db.Select(&apps, query, userID)
	return apps, err
}

func (r *postgresAppRepo) Update(app *domain.Application) error {
	query := `
        UPDATE applications
        SET company_id = $1, role_id = $2, date_applied = $3, status = $4, metadata = $5, updated_at = NOW()
        WHERE id = $6 AND user_id = $7
        RETURNING updated_at`
	return r.db.QueryRow(query, app.CompanyID, app.RoleID, app.DateApplied, app.Status, app.Metadata, app.ID, app.UserID).Scan(&app.UpdatedAt)
}

func (r *postgresAppRepo) Delete(id int64, userID int64) error {
	query := `DELETE FROM applications WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(query, id, userID)
	return err
}

type postgresAppNoteRepository struct {
	db *sqlx.DB
}

func NewPostgresAppNoteRepository(db *sqlx.DB) *postgresAppNoteRepository {
	return &postgresAppNoteRepository{db: db}
}

func (r *postgresAppNoteRepository) Create(note *domain.ApplicationNote) error {
	query := `
        INSERT INTO application_notes (application_id, user_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, created_at`
	return r.db.QueryRow(query, note.ApplicationID, note.UserID, note.Content).Scan(&note.ID, &note.CreatedAt)
}

func (r *postgresAppNoteRepository) GetAllForApplication(appID int64, userID int64) ([]domain.ApplicationNote, error) {
	var notes []domain.ApplicationNote
	// Ensure user owns the application for which notes are being fetched
	query := `
        SELECT an.* FROM application_notes an
        JOIN applications a ON an.application_id = a.id
        WHERE an.application_id = $1 AND a.user_id = $2
        ORDER BY an.created_at DESC`
	err := r.db.Select(&notes, query, appID, userID)
	return notes, err
}

