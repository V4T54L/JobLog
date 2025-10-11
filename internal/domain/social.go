package domain

import (
	"database/sql"
	"time"
)

type ContentType string

const (
	ContentTypePost    ContentType = "post"
	ContentTypeComment ContentType = "comment"
)

type Comment struct {
	ID              int64          `db:"id" json:"id"`
	PostID          int64          `db:"post_id" json:"post_id"`
	UserID          int64          `db:"user_id" json:"user_id"`
	ParentCommentID sql.NullInt64  `db:"parent_comment_id" json:"parent_comment_id"`
	ContentMD       string         `db:"content_md" json:"content_md"`
	ContentHTML     string         `db:"content_html" json:"content_html"`
	CreatedAt       time.Time      `db:"created_at" json:"created_at"`
	UpdatedAt       time.Time      `db:"updated_at" json:"updated_at"`
	DepthLevel      int            `db:"depth_level" json:"depth_level"`
	Username        sql.NullString `db:"username" json:"username,omitempty"` // From JOIN
	Replies         []*Comment     `db:"-" json:"replies,omitempty"`         // For nesting in response
}

type Like struct {
	ID          int64       `db:"id" json:"id"`
	UserID      int64       `db:"user_id" json:"user_id"`
	ContentType ContentType `db:"content_type" json:"content_type"`
	ContentID   int64       `db:"content_id" json:"content_id"`
	CreatedAt   time.Time   `db:"created_at" json:"created_at"`
}

type Follow struct {
	ID             int64     `db:"id" json:"id"`
	FollowerUserID int64     `db:"follower_user_id" json:"follower_user_id"`
	FolloweeUserID int64     `db:"followee_user_id" json:"followee_user_id"`
	CreatedAt      time.Time `db:"created_at" json:"created_at"`
}
