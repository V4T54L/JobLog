package postgres

import (
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"

	"github.com/jmoiron/sqlx"
)

type postgresAnalyticsRepository struct {
	db *sqlx.DB
}

func NewPostgresAnalyticsRepository(db *sqlx.DB) repository.AnalyticsRepository {
	return &postgresAnalyticsRepository{db: db}
}

func (r *postgresAnalyticsRepository) GetApplicationCountsByStatus(userID int64) ([]domain.StatusCount, error) {
	var counts []domain.StatusCount
	query := `
		SELECT status, COUNT(*) as count
		FROM applications
		WHERE user_id = $1
		GROUP BY status
		ORDER BY count DESC
	`
	err := r.db.Select(&counts, query, userID)
	if err != nil {
		return nil, err
	}
	return counts, nil
}

func (r *postgresAnalyticsRepository) GetApplicationCountsOverTime(userID int64) ([]domain.ApplicationsOverTime, error) {
	var counts []domain.ApplicationsOverTime
	query := `
		SELECT to_char(date_applied, 'YYYY-MM') as date, COUNT(*) as count
		FROM applications
		WHERE user_id = $1
		GROUP BY date
		ORDER BY date ASC
	`
	err := r.db.Select(&counts, query, userID)
	if err != nil {
		return nil, err
	}
	return counts, nil
}

