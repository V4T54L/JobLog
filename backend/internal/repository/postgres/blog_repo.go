package postgres

import (
	"context"
	"errors"
	"fmt"

	"joblog/internal/core/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// BlogRepository implements the domain.BlogRepository interface using PostgreSQL.
type BlogRepository struct {
	db *pgxpool.Pool
}

// NewBlogRepository creates a new instance of BlogRepository.
func NewBlogRepository(db *pgxpool.Pool) *BlogRepository {
	return &BlogRepository{db: db}
}

// Create inserts a new blog post into the database.
func (r *BlogRepository) Create(ctx context.Context, post *domain.BlogPost) error {
	query := `
        INSERT INTO blog_posts (
            id, slug, title, content, author_name, author_avatar_url, 
            cover_image_url, is_public, likes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`

	_, err := r.db.Exec(ctx, query,
		post.ID,
		post.Slug,
		post.Title,
		post.Content,
		post.Author,
		post.AuthorAvatar,
		post.CoverImage,
		post.IsPublic,
		post.Likes,
		post.CreatedAt,
	)

	if err != nil {
		// Specific error handling for duplicate slug can be added here if needed
		return fmt.Errorf("failed to create blog post: %w", err)
	}

	return nil
}

// GetAll retrieves all public blog posts, ordered by creation date.
func (r *BlogRepository) GetAll(ctx context.Context) ([]*domain.BlogPost, error) {
	query := `
        SELECT 
            id, slug, title, content, author_name, author_avatar_url, 
            cover_image_url, is_public, likes, created_at 
        FROM blog_posts 
        WHERE is_public = TRUE 
        ORDER BY created_at DESC`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to query blog posts: %w", err)
	}
	defer rows.Close()

	var posts []*domain.BlogPost
	for rows.Next() {
		var post domain.BlogPost
		err := rows.Scan(
			&post.ID,
			&post.Slug,
			&post.Title,
			&post.Content,
			&post.Author,
			&post.AuthorAvatar,
			&post.CoverImage,
			&post.IsPublic,
			&post.Likes,
			&post.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan blog post row: %w", err)
		}
		posts = append(posts, &post)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating blog post rows: %w", err)
	}

	return posts, nil
}

// GetBySlug retrieves a single blog post and its comments by its unique slug.
// It uses a transaction to ensure data consistency.
func (r *BlogRepository) GetBySlug(ctx context.Context, slug string) (*domain.BlogPost, error) {
	var post domain.BlogPost

	// Use a transaction to ensure we get a consistent snapshot of the post and its comments
	tx, err := r.db.BeginTx(ctx, pgx.TxOptions{IsoLevel: pgx.ReadCommitted})
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx) // No-op if committed

	// 1. Fetch the main blog post
	postQuery := `
        SELECT 
            id, slug, title, content, author_name, author_avatar_url, 
            cover_image_url, is_public, likes, created_at 
        FROM blog_posts 
        WHERE slug = $1`

	err = tx.QueryRow(ctx, postQuery, slug).Scan(
		&post.ID,
		&post.Slug,
		&post.Title,
		&post.Content,
		&post.Author,
		&post.AuthorAvatar,
		&post.CoverImage,
		&post.IsPublic,
		&post.Likes,
		&post.CreatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("blog post with slug '%s' not found", slug)
		}
		return nil, fmt.Errorf("failed to get blog post: %w", err)
	}

	// 2. Fetch the associated comments
	commentsQuery := `
        SELECT 
            id, author_name, author_avatar_url, content, likes, created_at
        FROM comments 
        WHERE post_id = $1 AND parent_comment_id IS NULL -- Fetch only top-level comments
        ORDER BY created_at ASC`

	rows, err := tx.Query(ctx, commentsQuery, post.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to query comments: %w", err)
	}
	defer rows.Close()

	var comments []domain.Comment
	for rows.Next() {
		var comment domain.Comment
		err := rows.Scan(
			&comment.ID,
			&comment.Author,
			&comment.Avatar,
			&comment.Content,
			&comment.Likes,
			&comment.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan comment row: %w", err)
		}
		// In a more complex system, you would recursively fetch replies here.
		comment.Replies = []domain.Comment{}
		comments = append(comments, comment)
	}

	post.Comments = comments

	// 3. Commit the transaction
	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &post, nil
}
