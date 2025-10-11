package domain

import (
	"time"
)

type ContentType string

const (
	ContentTypePost    ContentType = "post"
	ContentTypeComment ContentType = "comment"
)

type Comment struct {
	ID              int64
	PostID          int64
	UserID          int64
	ParentCommentID int64 // Use 0 or a specific value for top-level comments if nullable is complex
	ContentMD       string
	ContentHTML     string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DepthLevel      int
}

type Like struct {
	ID          int64
	UserID      int64
	ContentType ContentType
	ContentID   int64
}

type Follow struct {
	ID             int64
	FollowerUserID int64
	FolloweeUserID int64
}

