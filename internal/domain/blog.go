package domain

import (
	"database/sql"
	"time"
)

type BlogPost struct {
	ID                 int64
	UserID             int64
	Title              string
	Slug               string
	ContentMD          string
	ContentHTML        string
	Excerpt            string
	IsPublic           bool
	CreatedAt          time.Time
	UpdatedAt          time.Time
	SEOMetaTitle       sql.NullString
	SEOMetaDescription sql.NullString
	Tags               []string // Assuming tags are stored in a way that can be scanned into a slice, e.g., text[] in PostgreSQL
}

type DraftVersion struct {
	ID                 int64
	PostID             sql.NullInt64 // Null for brand new drafts
	UserID             int64
	ContentMD          string
	ContentHTML        string
	LastSavedAt        time.Time
	IsPublishedVersion bool
}

