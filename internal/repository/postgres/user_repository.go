package postgres

import (
	"database/sql"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"

	"github.com/jmoiron/sqlx"
)

type postgresUserRepository struct {
	db *sqlx.DB
}

func NewPostgresUserRepository(db *sqlx.DB) repository.UserRepository {
	return &postgresUserRepository{db: db}
}

func (r *postgresUserRepository) Create(user *domain.User) error {
	query := `INSERT INTO users (username, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, created_at, updated_at`
	return r.db.QueryRow(query, user.Username, user.Email, user.HashedPassword).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *postgresUserRepository) GetByEmail(email string) (*domain.User, error) {
	var user domain.User
	query := `SELECT id, username, email, hashed_password, bio, avatar_url, settings, created_at, updated_at FROM users WHERE email = $1`
	err := r.db.Get(&user, query, email)
	if err!=nil && err == sql.ErrNoRows {
		return nil, nil // Not an error, just no user found
	}
	return &user, err
}

func (r *postgresUserRepository) GetByUsername(username string) (*domain.User, error) {
	var user domain.User
	query := `SELECT id, username, email, hashed_password, bio, avatar_url, settings, created_at, updated_at FROM users WHERE username = $1`
	err := r.db.Get(&user, query, username)
	if err == sql.ErrNoRows {
		return nil, nil // Not an error, just no user found
	}
	return &user, err
}

func (r *postgresUserRepository) GetByID(id int64) (*domain.User, error) {
	var user domain.User
	query := `SELECT id, username, email, hashed_password, bio, avatar_url, settings, created_at, updated_at FROM users WHERE id = $1`
	err := r.db.Get(&user, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &user, err
}

