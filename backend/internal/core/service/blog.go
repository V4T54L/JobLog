
package service

import (
	"context"
	"regexp"
	"strings"
	"time"

	"joblog/internal/core/domain"

	"github.com/google/uuid"
)

type BlogService struct {
	blogRepo domain.BlogRepository
	userRepo domain.UserRepository
}

func NewBlogService(blogRepo domain.BlogRepository) *BlogService {
	return &BlogService{blogRepo: blogRepo}
}

func (s *BlogService) Create(ctx context.Context, userID string, newPost domain.NewBlogPost) (*domain.BlogPost, error) {
	// In a real app, you would fetch the user's details to get their name and avatar
	// For this mock, we'll use a placeholder
	authorName := "Mock User"
	authorAvatar := "https://i.pravatar.cc/150"

	isPublic := true
	if newPost.IsPublic != nil {
		isPublic = *newPost.IsPublic
	}

	post := &domain.BlogPost{
		ID:           uuid.NewString(),
		Slug:         generateSlug(newPost.Title),
		Title:        newPost.Title,
		Content:      newPost.Content,
		Author:       authorName,
		AuthorAvatar: authorAvatar,
		CreatedAt:    time.Now(),
		Likes:        0,
		CoverImage:   "https://picsum.photos/seed/" + uuid.NewString() + "/800/400",
		IsPublic:     isPublic,
		Comments:     []domain.Comment{},
	}

	err := s.blogRepo.Create(ctx, post)
	if err != nil {
		return nil, err
	}
	return post, nil
}

func (s *BlogService) GetAll(ctx context.Context) ([]*domain.BlogPost, error) {
	return s.blogRepo.GetAll(ctx)
}

func (s *BlogService) GetBySlug(ctx context.Context, slug string) (*domain.BlogPost, error) {
	return s.blogRepo.GetBySlug(ctx, slug)
}

// generateSlug creates a URL-friendly slug from a title.
func generateSlug(title string) string {
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slug := strings.ToLower(title)
	slug = re.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	return slug + "-" + uuid.NewString()[:6]
}
