package postgres

import (
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"

	"github.com/jmoiron/sqlx"
)

// type postgresCompanyRepository struct {
// 	db *sqlx.DB
// }

// func NewPostgresCompanyRepository(db *sqlx.DB) repository.CompanyRepository {
// 	return &postgresCompanyRepository{db: db}
// }

// func (r *postgresCompanyRepository) FindOrCreate(company *domain.Company) error {
// 	// We use a CTE pattern: try to find by normalized_name; else insert and return id, metadata
// 	// If metadata is provided on `company`, use it only when inserting.
// 	// If row already exists, we may need to fetch metadata.

// 	// Build query
// 	query := `
//     WITH existing AS (
//         SELECT id, metadata
//         FROM companies
//         WHERE normalized_name = $1
//     ), inserted AS (
//         INSERT INTO companies (name, normalized_name, metadata)
//         SELECT $2, $1, $3
//         WHERE NOT EXISTS (SELECT 1 FROM existing)
//         RETURNING id, metadata
//     )
//     SELECT id, metadata FROM inserted
//     UNION ALL
//     SELECT id, metadata FROM existing
//     LIMIT 1;
//     `

// 	// Prepare the metadata argument: if nil or empty, use null
// 	var metaArg interface{}
// 	if len(company.Metadata) > 0 {
// 		// validate JSON?
// 		metaArg = company.Metadata
// 	} else {
// 		metaArg = nil
// 	}

// 	var metaBytes []byte
// 	err := r.db.QueryRow(query,
// 		company.NormalizedName,
// 		company.Name,
// 		metaArg,
// 	).Scan(&company.ID, &metaBytes)

// 	if err != nil {
// 		return fmt.Errorf("FindOrCreate company failed: %w", err)
// 	}

// 	// If we fetched metadata, set it back on the domain struct
// 	if len(metaBytes) > 0 {
// 		company.Metadata = json.RawMessage(metaBytes)
// 	} else {
// 		company.Metadata = nil
// 	}

// 	return nil
// }

type postgresCompanyRepository struct {
	db *sqlx.DB
}

func NewPostgresCompanyRepository(db *sqlx.DB) repository.CompanyRepository {
	return &postgresCompanyRepository{db: db}
}

func (r *postgresCompanyRepository) FindOrCreate(company *domain.Company) error {
	query := `
        WITH s AS (
            SELECT id FROM companies WHERE normalized_name = $1
        ), i AS (
            INSERT INTO companies (name, normalized_name)
            SELECT $2, $1
            WHERE NOT EXISTS (SELECT 1 FROM s)
            RETURNING id
        )
        SELECT id FROM i
        UNION ALL
        SELECT id FROM s
    `
	return r.db.QueryRow(query, company.NormalizedName, company.Name).Scan(&company.ID)
}
