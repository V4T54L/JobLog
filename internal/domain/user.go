package domain

import (
	"database/sql"
	"encoding/json"
	"time"
)

type User struct {
	ID             int64           `db:"id"`
	Username       string          `db:"username"`
	Email          string          `db:"email"`
	HashedPassword string          `db:"hashed_password"`
	Bio            sql.NullString  `db:"bio"`
	AvatarURL      sql.NullString  `db:"avatar_url"`
	Settings       json.RawMessage `db:"settings"`
	CreatedAt      time.Time       `db:"created_at"`
	UpdatedAt      time.Time       `db:"updated_at"`
}

