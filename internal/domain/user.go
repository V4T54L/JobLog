package domain

import (
	"database/sql"
	"encoding/json"
)

type User struct {
	ID             int64
	Username       string
	Email          string
	HashedPassword string
	Bio            sql.NullString
	AvatarURL      sql.NullString
	Settings       json.RawMessage // JSON or JSONB for theme, etc.
}

