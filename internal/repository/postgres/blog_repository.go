package postgres

import (
	"database/sql"
	"fmt" // Added from attempted
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
	query := `INSERT INTO blog_posts (user_id, title, slug, content_md, content_html, excerpt, is_public, seo_meta_title, seo_meta_description, tags)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              RETURNING id, created_at, updated_at` // Updated query with SEO fields
	err := r.db.QueryRow(
		query,
		post.UserID, post.Title, post.Slug, post.ContentMD, post.ContentHTML,
		post.Excerpt, post.IsPublic, post.SEOMetaTitle, post.SEOMetaDescription, post.Tags, // Updated parameters
	).Scan(&post.ID, &post.CreatedAt, &post.UpdatedAt)
	return err
}

func (r *postgresBlogPostRepository) GetBySlugAndUser(slug string, username string) (*domain.BlogPost, error) {
	var post domain.BlogPost
	query := `SELECT p.*, u.username FROM blog_posts p
              JOIN users u ON p.user_id = u.id
              WHERE p.slug = $1 AND u.username = $2` // Formatted query
	err := r.db.Get(&post, query, slug, username)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &post, err
}

func (r *postgresBlogPostRepository) GetAllPublic() ([]*domain.BlogPost, error) { // Changed return type to []*domain.BlogPost
	var posts []*domain.BlogPost // Changed type to []*domain.BlogPost
	query := `SELECT p.*, u.username FROM blog_posts p
              JOIN users u ON p.user_id = u.id
              WHERE p.is_public = true
              ORDER BY p.created_at DESC` // Formatted query
	err := r.db.Select(&posts, query)
	return posts, err
}

func (r *postgresBlogPostRepository) GetPublicPostsByUserID(userID int64) ([]*domain.BlogPost, error) { // Added from attempted
	var posts []*domain.BlogPost
	query := `SELECT p.*, u.username FROM blog_posts p
			  JOIN users u ON p.user_id = u.id
			  WHERE p.is_public = true AND p.user_id = $1
			  ORDER BY p.created_at DESC`
	err := r.db.Select(&posts, query, userID)
	return posts, err
}

func (r *postgresBlogPostRepository) IsSlugTaken(slug string, userID int64) (bool, error) {
	var exists bool
	query := `SELECT EXISTS(SELECT 1 FROM blog_posts WHERE slug = $1 AND user_id = $2)`
	err := r.db.Get(&exists, query, slug, userID)
	if err != nil {
		return false, fmt.Errorf("failed to check if slug is taken: %w", err) // Added error wrapping
	}
	return exists, nil
}

