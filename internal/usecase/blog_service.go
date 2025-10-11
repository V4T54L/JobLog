package usecase

import (
	"database/sql"
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"job-app-tracker/pkg/util"

	"github.com/lib/pq"
)

type blogService struct {
	blogRepo repository.BlogPostRepository
}

func NewBlogService(blogRepo repository.BlogPostRepository) BlogUseCase {
	return &blogService{blogRepo: blogRepo}
}

func (s *blogService) CreatePost(userID int64, title, contentMd, contentHtml string, isPublic bool) (*domain.BlogPost, error) {
	// Generate initial slug
	slug := util.Slugify(title)

	// Check for slug uniqueness and append suffix if needed
	originalSlug := slug
	counter := 1
	for {
		isTaken, err := s.blogRepo.IsSlugTaken(slug, userID)
		if err != nil {
			return nil, err
		}
		if !isTaken {
			break
		}
		slug = fmt.Sprintf("%s-%d", originalSlug, counter)
		counter++
	}

	excerpt := contentMd
	if len(excerpt) > 150 {
		excerpt = excerpt[:150] + "..."
	}

	post := &domain.BlogPost{
		UserID:      userID,
		Title:       title,
		Slug:        slug,
		ContentMD:   contentMd,
		ContentHTML: contentHtml, // Assuming sanitized HTML is passed in
		Excerpt:     sql.NullString{String: excerpt, Valid: true},
		IsPublic:    isPublic,
		Tags:        pq.StringArray{}, // Tags not implemented yet
	}

	if err := s.blogRepo.Create(post); err != nil {
		return nil, err
	}

	return post, nil
}

func (s *blogService) GetPublicPost(username, slug string) (*domain.BlogPost, error) {
	post, err := s.blogRepo.GetBySlugAndUser(slug, username)
	if err != nil {
		return nil, err
	}
	if post == nil || !post.IsPublic {
		return nil, nil // Not found or not public
	}
	return post, nil
}

func (s *blogService) GetPublicPosts() ([]domain.BlogPost, error) {
	posts, err := s.blogRepo.GetAllPublic()
	if err != nil {
		return nil, err
	}
	return posts, nil
}

