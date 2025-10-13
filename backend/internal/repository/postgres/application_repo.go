
package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"joblog/internal/core/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ApplicationRepository struct {
	db *pgxpool.Pool
}

func NewApplicationRepository(db *pgxpool.Pool) *ApplicationRepository {
	return &ApplicationRepository{db: db}
}

// Create uses a transaction to ensure atomicity.
func (r *ApplicationRepository) Create(ctx context.Context, app *domain.Application) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) // Rollback is a no-op if tx is already committed

	appQuery := `INSERT INTO applications (id, user_id, company, role, date, status) 
                 VALUES ($1, $2, $3, $4, $5, $6)`
	_, err = tx.Exec(ctx, appQuery, app.ID, app.UserID, app.Company, app.Role, app.Date, app.Status)
	if err != nil {
		return fmt.Errorf("failed to insert application: %w", err)
	}

	if len(app.History) > 0 {
		historyQuery := `INSERT INTO history_events (application_id, event) VALUES ($1, $2)`
		_, err := tx.Exec(ctx, historyQuery, app.ID, app.History[0].Event)
		if err != nil {
			return fmt.Errorf("failed to insert initial history event: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *ApplicationRepository) GetAllByUserID(ctx context.Context, userID string) ([]*domain.Application, error) {
	query := `SELECT id, company, role, date, updated_at, status 
              FROM applications 
              WHERE user_id = $1 AND status != 'Archived' 
              ORDER BY date DESC`
	rows, err := r.db.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query applications: %w", err)
	}
	defer rows.Close()

	var apps []*domain.Application
	for rows.Next() {
		var app domain.Application
		var updatedAt time.Time
		if err := rows.Scan(&app.ID, &app.Company, &app.Role, &app.Date, &updatedAt, &app.Status); err != nil {
			return nil, fmt.Errorf("failed to scan application row: %w", err)
		}
		app.UpdatedAt = updatedAt.Format("2006-01-02")
		apps = append(apps, &app)
	}

	return apps, nil
}

func (r *ApplicationRepository) GetByID(ctx context.Context, id string) (*domain.Application, error) {
	var app domain.Application
	var updatedAt time.Time

	// 1. Fetch main application
	queryApp := `SELECT id, user_id, company, role, date, updated_at, status FROM applications WHERE id = $1`
	err := r.db.QueryRow(ctx, queryApp, id).Scan(&app.ID, &app.UserID, &app.Company, &app.Role, &app.Date, &updatedAt, &app.Status)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("application not found")
		}
		return nil, fmt.Errorf("failed to get application: %w", err)
	}
	app.UpdatedAt = updatedAt.Format("2006-01-02")

	// 2. Fetch notes
	queryNotes := `SELECT id, content, created_at FROM notes WHERE application_id = $1 ORDER BY created_at ASC`
	rowsNotes, err := r.db.Query(ctx, queryNotes, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get notes: %w", err)
	}
	defer rowsNotes.Close()

	for rowsNotes.Next() {
		var note domain.Note
		if err := rowsNotes.Scan(&note.ID, &note.Content, &note.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		app.Notes = append(app.Notes, note)
	}

	// 3. Fetch history
	queryHistory := `SELECT event, created_at FROM history_events WHERE application_id = $1 ORDER BY created_at ASC`
	rowsHistory, err := r.db.Query(ctx, queryHistory, id)
	if err != nil {
		return nil, fmt.Errorf("failed to get history: %w", err)
	}
	defer rowsHistory.Close()

	for rowsHistory.Next() {
		var event domain.HistoryEvent
		if err := rowsHistory.Scan(&event.Event, &event.Date); err != nil {
			return nil, fmt.Errorf("failed to scan history event: %w", err)
		}
		app.History = append(app.History, event)
	}

	return &app, nil
}

// Update uses a transaction to update application and potentially add notes/history.
func (r *ApplicationRepository) Update(ctx context.Context, app *domain.Application) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Update main application record
	appQuery := `UPDATE applications SET company=$1, role=$2, date=$3, status=$4, updated_at=NOW() WHERE id=$5`
	_, err = tx.Exec(ctx, appQuery, app.Company, app.Role, app.Date, app.Status, app.ID)
	if err != nil {
		return fmt.Errorf("failed to update application: %w", err)
	}

	// Clear and re-insert notes and history (simplest approach for full updates)
	// A more optimized approach would be to diff the collections.
	if _, err := tx.Exec(ctx, "DELETE FROM notes WHERE application_id = $1", app.ID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, "DELETE FROM history_events WHERE application_id = $1", app.ID); err != nil {
		return err
	}

	for _, note := range app.Notes {
		noteQuery := `INSERT INTO notes (id, application_id, content, created_at) VALUES ($1, $2, $3, $4)`
		_, err := tx.Exec(ctx, noteQuery, note.ID, app.ID, note.Content, note.CreatedAt)
		if err != nil {
			return fmt.Errorf("failed to insert note: %w", err)
		}
	}
	for _, event := range app.History {
		histQuery := `INSERT INTO history_events (application_id, event, created_at) VALUES ($1, $2, $3)`
		_, err := tx.Exec(ctx, histQuery, app.ID, event.Event, event.Date)
		if err != nil {
			return fmt.Errorf("failed to insert history event: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *ApplicationRepository) Delete(ctx context.Context, id string) error {
	// The service layer handles this by calling Update with status="Archived"
	// This method is here to satisfy the interface but is not used directly.
	return nil
}
