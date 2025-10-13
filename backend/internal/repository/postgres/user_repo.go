
package postgres

import (
	"context"
	"errors"
	"fmt"

	"joblog/internal/core/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user *domain.User) error {
	query := `INSERT INTO users (id, username, email, password_hash) VALUES ($1, $2, $3, $4)`
	_, err := r.db.Exec(ctx, query, user.ID, user.Username, user.Email, user.PasswordHash)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

func (r *UserRepository) GetByID(ctx context.Context, id string) (*domain.User, error) {
	return r.getUserByField(ctx, "id", id)
}

func (r *UserRepository) GetByUsername(ctx context.Context, username string) (*domain.User, error) {
	return r.getUserByField(ctx, "username", username)
}

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	return r.getUserByField(ctx, "email", email)
}

// Helper function to reduce repetition
func (r *UserRepository) getUserByField(ctx context.Context, field string, value any) (*domain.User, error) {
	var user domain.User
	query := fmt.Sprintf(`SELECT id, username, email, password_hash FROM users WHERE %s = $1`, field)
	err := r.db.QueryRow(ctx, query, value).Scan(&user.ID, &user.Username, &user.Email, &user.PasswordHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return &user, nil
}
