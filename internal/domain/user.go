package domain

import (
	"database/sql"
	"time"

	"github.com/jmoiron/sqlx/types"
)

type User struct {
	ID             int64          `db:"id"`
	Username       string         `db:"username"`
	Email          string         `db:"email"`
	HashedPassword string         `db:"hashed_password"`
	Bio            sql.NullString `db:"bio"`
	AvatarURL      sql.NullString `db:"avatar_url"`
	Settings       types.JSONText `db:"settings"`
	CreatedAt      time.Time      `db:"created_at"`
	UpdatedAt      time.Time      `db:"updated_at"`
}
