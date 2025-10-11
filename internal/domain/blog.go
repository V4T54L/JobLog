package domain

import (
	"database/sql"
	"time"

	"github.com/lib/pq"
)

// BlogPost represents a published blog post.
type BlogPost struct {
	ID                 int64          `db:"id" json:"id"`
	UserID             int64          `db:"user_id" json:"userId"`
	Title              string         `db:"title" json:"title"`
	Slug               string         `db:"slug" json:"slug"`
	ContentMD          string         `db:"content_md" json:"contentMd"`
	ContentHTML        string         `db:"content_html" json:"contentHtml"`
	Excerpt            sql.NullString `db:"excerpt" json:"excerpt"`
	IsPublic           bool           `db:"is_public" json:"isPublic"`
	CreatedAt          time.Time      `db:"created_at" json:"createdAt"`
	UpdatedAt          time.Time      `db:"updated_at" json:"updatedAt"`
	SEOMetaTitle       sql.NullString `db:"seo_meta_title" json:"seoMetaTitle"`
	SEOMetaDescription sql.NullString `db:"seo_meta_description" json:"seoMetaDescription"`
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

