package postgres

import (
	"database/sql"
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"math"
	"strings"

	"github.com/jmoiron/sqlx"
	"github.com/lib/pq"
)

type postgresBlogPostRepository struct {
	db *sqlx.DB
}

func NewPostgresBlogPostRepository(db *sqlx.DB) repository.BlogPostRepository {
	return &postgresBlogPostRepository{db: db}
}

func (r *postgresBlogPostRepository) Create(post *domain.BlogPost) error {
	query := `
        INSERT INTO blog_posts (user_id, title, slug, content_md, content_html, excerpt, is_public, seo_meta_title, seo_meta_description, tags)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, created_at, updated_at
    `
	return r.db.QueryRow(
		query,
		post.UserID, post.Title, post.Slug, post.ContentMD, post.ContentHTML, post.Excerpt, post.IsPublic,
		post.SEOMetaTitle, post.SEOMetaDescription, pq.Array(post.Tags),
	).Scan(&post.ID, &post.CreatedAt, &post.UpdatedAt)
}

func (r *postgresBlogPostRepository) GetBySlugAndUser(slug string, username string) (*domain.BlogPost, error) {
	var post domain.BlogPost
	query := `SELECT p.*, u.username FROM blog_posts p
              JOIN users u ON p.user_id = u.id
              WHERE p.slug = $1 AND u.username = $2`
	err := r.db.Get(&post, query, slug, username)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return &post, err
}

func (r *postgresBlogPostRepository) GetPublicPosts(params domain.ListParams) (*domain.PaginatedBlogPosts, error) {
	var args []interface{}
	var whereClauses []string

	baseQuery := `
		SELECT p.id, p.user_id, p.title, p.slug, p.content_md, p.content_html, p.excerpt,
		p.is_public, p.created_at, p.updated_at, p.seo_meta_title, p.seo_meta_description, p.tags, u.username
		FROM blog_posts p
		JOIN users u ON p.user_id = u.id
	`
	countBaseQuery := `SELECT COUNT(p.id) FROM blog_posts p`

	whereClauses = append(whereClauses, "p.is_public = TRUE")

	if params.Search != "" {
		args = append(args, "%"+strings.ToLower(params.Search)+"%")
		searchClause := fmt.Sprintf("LOWER(p.title) LIKE $%d", len(args))
		whereClauses = append(whereClauses, searchClause)
	}

	whereClauseStr := ""
	if len(whereClauses) > 0 {
		whereClauseStr = " WHERE " + strings.Join(whereClauses, " AND ")
	}

	countQuery := countBaseQuery + whereClauseStr
	var totalItems int64
	err := r.db.Get(&totalItems, countQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to count blog posts: %w", err)
	}

	sortBy := "p.created_at"
	if params.SortBy == "title" {
		sortBy = "p.title"
	}
	sortOrder := "DESC"
	if strings.ToUpper(params.SortOrder) == "ASC" {
		sortOrder = "ASC"
	}
	orderByClause := fmt.Sprintf(" ORDER BY %s %s", sortBy, sortOrder)

	limit := params.Limit
	if limit <= 0 {
		limit = 10
	}
	page := params.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit
	paginationClause := fmt.Sprintf(" LIMIT %d OFFSET %d", limit, offset)

	finalQuery := baseQuery + whereClauseStr + orderByClause + paginationClause

	var posts []domain.BlogPost
	err = r.db.Select(&posts, finalQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get blog posts: %w", err)
	}

	paginatedResult := &domain.PaginatedBlogPosts{
		BlogPosts: posts,
		Pagination: domain.Pagination{
			TotalItems:  totalItems,
			TotalPages:  int(math.Ceil(float64(totalItems) / float64(limit))),
			CurrentPage: page,
			PageSize:    limit,
		},
	}

	return paginatedResult, nil
}

func (r *postgresBlogPostRepository) GetPublicPostsByUserID(userID int64) ([]domain.BlogPost, error) {
	var posts []domain.BlogPost
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
		return false, fmt.Errorf("failed to check if slug is taken: %w", err)
	}
	return exists, nil
}

