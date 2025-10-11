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
		comment.PostID,
		comment.UserID,
		comment.ParentCommentID,
		comment.ContentMD,
		comment.ContentHTML,
		comment.DepthLevel,
	).Scan(&comment.ID, &comment.CreatedAt, &comment.UpdatedAt)
	return err
}

func (r *postgresCommentRepository) GetByID(id int64) (*domain.Comment, error) {
	var comment domain.Comment
	query := `SELECT id, post_id, user_id, parent_comment_id, content_md, content_html, depth_level, created_at, updated_at FROM comments WHERE id = $1`
	err := r.db.Get(&comment, query, id)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &comment, err
}

func (r *postgresCommentRepository) GetForPost(postID int64) ([]*domain.Comment, error) {
	var comments []*domain.Comment
	query := `SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = $1 ORDER BY c.created_at ASC`
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
	query := `INSERT INTO likes (user_id, content_type, content_id) VALUES ($1, $2, $3) RETURNING id, created_at`
	return r.db.QueryRow(query, like.UserID, like.ContentType, like.ContentID).Scan(&like.ID, &like.CreatedAt)
}

func (r *postgresLikeRepository) Delete(userID int64, contentType domain.ContentType, contentID int64) error {
	query := `DELETE FROM likes WHERE user_id = $1 AND content_type = $2 AND content_id = $3`
	_, err := r.db.Exec(query, userID, contentType, contentID)
	return err
}

func (r *postgresLikeRepository) Get(userID int64, contentType domain.ContentType, contentID int64) (*domain.Like, error) {
	var like domain.Like
	query := `SELECT id, user_id, content_type, content_id, created_at FROM likes WHERE user_id = $1 AND content_type = $2 AND content_id = $3`
	err := r.db.Get(&like, query, userID, contentType, contentID)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &like, err
}

