package domain

import (
	"database/sql"
	"encoding/json"
	"time"
)

type Company struct {
	ID             int64
	Name           string
	NormalizedName string
	Metadata       json.RawMessage // JSON or JSONB
}

type Role struct {
	ID        int64
	CompanyID int64
	Title     string
	Metadata  json.RawMessage // JSON or JSONB
}

type Application struct {
	ID            int64
	UserID        int64
	CompanyID     int64
	RoleID        int64
	DateApplied   time.Time
	Status        string
	Metadata      json.RawMessage // JSON or JSONB
	CurrentNoteID sql.NullInt64
}

type ApplicationNote struct {
	ID            int64
	ApplicationID int64
	UserID        int64
	Timestamp     time.Time
	Content       string
}

