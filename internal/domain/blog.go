package domain

import (
	"database/sql"
	"time"

	"github.com/lib/pq"
)

// BlogPost represents a published blog post.
type BlogPost struct {
	ID                 int64          `db:"id" json:"id"`
	UserID             int64          `db:"user_id" json:"user_id"`
	Title              string         `db:"title" json:"title"`
	Slug               string         `db:"slug" json:"slug"`
	ContentMD          string         `db:"content_md" json:"content_md"`
	ContentHTML        string         `db:"content_html" json:"content_html"`
	Excerpt            sql.NullString `db:"excerpt" json:"excerpt"`
	IsPublic           bool           `db:"is_public" json:"is_public"`
	CreatedAt          time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt          time.Time      `db:"updated_at" json:"updated_at"`
	SEOMetaTitle       sql.NullString `db:"seo_meta_title" json:"seo_meta_title"`
	SEOMetaDescription sql.NullString `db:"seo_meta_description" json:"seo_meta_description"`
	Tags               pq.StringArray `db:"tags" json:"tags"`
	Username           string         `db:"username" json:"username"` // For joining user data
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

