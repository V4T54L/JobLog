package postgres

import (
	"database/sql"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"

	"github.com/jmoiron/sqlx"
)

type postgresBlogPostRepository struct {
	db *sqlx.DB
}

func NewPostgresBlogPostRepository(db *sqlx.DB) repository.BlogPostRepository {
	return &postgresBlogPostRepository{db: db}
}

func (r *postgresBlogPostRepository) Create(post *domain.BlogPost) error {
	query := `INSERT INTO blog_posts (user_id, title, slug, content_md, content_html, excerpt, is_public, tags)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, created_at, updated_at`
	return r.db.QueryRow(query, post.UserID, post.Title, post.Slug, post.ContentMD, post.ContentHTML, post.Excerpt, post.IsPublic, post.Tags).Scan(&post.ID, &post.CreatedAt, &post.UpdatedAt)
}

func (r *postgresBlogPostRepository) GetBySlugAndUser(slug string, username string) (*domain.BlogPost, error) {
	var post domain.BlogPost
	query := `SELECT p.*, u.username FROM blog_posts p JOIN users u ON p.user_id = u.id WHERE p.slug = $1 AND u.username = $2`
	err := r.db.Get(&post, query, slug, username)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &post, err
}

func (r *postgresBlogPostRepository) GetAllPublic() ([]domain.BlogPost, error) {
	var posts []domain.BlogPost
	query := `SELECT p.*, u.username FROM blog_posts p JOIN users u ON p.user_id = u.id WHERE p.is_public = TRUE ORDER BY p.created_at DESC`
	err := r.db.Select(&posts, query)
	return posts, err
}

func (r *postgresBlogPostRepository) IsSlugTaken(slug string, userID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM blog_posts WHERE slug = $1 AND user_id = $2)`
	err := r.db.Get(&exists, query, slug, userID)
	return exists, err
}

