package postgres

import (
	"database/sql"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"

	"github.com/jmoiron/sqlx"
)

// Comment Repository
type postgresCommentRepository struct {
	db *sqlx.DB
}

func NewPostgresCommentRepository(db *sqlx.DB) repository.CommentRepository {
	return &postgresCommentRepository{db: db}
}

func (r *postgresCommentRepository) Create(comment *domain.Comment) error {
	query := `INSERT INTO comments (post_id, user_id, parent_comment_id, content_md, content_html, depth_level)
              VALUES ($1, $2, $3, $4, $5, $6)
              RETURNING id, created_at, updated_at`
	err := r.db.QueryRow(
		query,
		comment.PostID, comment.UserID, comment.ParentCommentID, // Formatted arguments
		comment.ContentMD, comment.ContentHTML, comment.DepthLevel,
	).Scan(&comment.ID, &comment.CreatedAt, &comment.UpdatedAt)
	return err
}

func (r *postgresCommentRepository) GetByID(id int64) (*domain.Comment, error) {
	var comment domain.Comment
	query := `SELECT * FROM comments WHERE id = $1` // Changed to SELECT *
	err := r.db.Get(&comment, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &comment, err
}

func (r *postgresCommentRepository) GetForPost(postID int64) ([]*domain.Comment, error) {
	var comments []*domain.Comment
	query := `SELECT c.*, u.username FROM comments c
              JOIN users u ON c.user_id = u.id
              WHERE c.post_id = $1
              ORDER BY c.created_at ASC` // Formatted query
	err := r.db.Select(&comments, query, postID)
	return comments, err
}

// Like Repository
type postgresLikeRepository struct {
	db *sqlx.DB
}

func NewPostgresLikeRepository(db *sqlx.DB) repository.LikeRepository {
	return &postgresLikeRepository{db: db}
}

func (r *postgresLikeRepository) Create(like *domain.Like) error {
	query := `INSERT INTO likes (user_id, content_type, content_id)
              VALUES ($1, $2, $3)
              RETURNING id, created_at` // Formatted query
	return r.db.QueryRow(query, like.UserID, like.ContentType, like.ContentID).Scan(&like.ID, &like.CreatedAt)
}

func (r *postgresLikeRepository) Delete(userID int64, contentType domain.ContentType, contentID int64) error {
	query := `DELETE FROM likes WHERE user_id = $1 AND content_type = $2 AND content_id = $3`
	_, err := r.db.Exec(query, userID, contentType, contentID)
	return err
}

func (r *postgresLikeRepository) Get(userID int64, contentType domain.ContentType, contentID int64) (*domain.Like, error) {
	var like domain.Like
	query := `SELECT * FROM likes WHERE user_id = $1 AND content_type = $2 AND content_id = $3` // Changed to SELECT *
	err := r.db.Get(&like, query, userID, contentType, contentID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &like, err
}

// Follow Repository (Added from attempted)
type postgresFollowRepository struct {
	db *sqlx.DB
}

func NewPostgresFollowRepository(db *sqlx.DB) repository.FollowRepository {
	return &postgresFollowRepository{db: db}
}

func (r *postgresFollowRepository) Create(follow *domain.Follow) error {
	query := `INSERT INTO follows (follower_user_id, followee_user_id) VALUES ($1, $2) RETURNING id, created_at`
	return r.db.QueryRow(query, follow.FollowerUserID, follow.FolloweeUserID).Scan(&follow.ID, &follow.CreatedAt)
}

func (r *postgresFollowRepository) Delete(followerID, followeeID int64) error {
	query := `DELETE FROM follows WHERE follower_user_id = $1 AND followee_user_id = $2`
	_, err := r.db.Exec(query, followerID, followeeID)
	return err
}

func (r *postgresFollowRepository) Exists(followerID, followeeID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM follows WHERE follower_user_id = $1 AND followee_user_id = $2)`
	err := r.db.Get(&exists, query, followerID, followeeID)
	return exists, err
}

func (r *postgresFollowRepository) GetFollowerCount(userID int64) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM follows WHERE followee_user_id = $1`
	err := r.db.Get(&count, query, userID)
	return count, err
}

func (r *postgresFollowRepository) GetFollowingCount(userID int64) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM follows WHERE follower_user_id = $1`
	err := r.db.Get(&count, query, userID)
	return count, err
}

