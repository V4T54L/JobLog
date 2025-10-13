
package memory

import (
	"context"
	"fmt"
	"sort"
	"sync"

	"joblog/internal/core/domain"
)

type BlogRepository struct {
	posts map[string]*domain.BlogPost
	mu    sync.RWMutex
}

func NewBlogRepository() *BlogRepository {
	return &BlogRepository{posts: mockBlogPosts}
}

func (r *BlogRepository) Create(ctx context.Context, post *domain.BlogPost) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.posts[post.ID] = post
	return nil
}

func (r *BlogRepository) GetAll(ctx context.Context) ([]*domain.BlogPost, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var allPosts []*domain.BlogPost
	for _, post := range r.posts {
		if post.IsPublic {
			allPosts = append(allPosts, post)
		}
	}
	// Sort by creation date descending
	sort.Slice(allPosts, func(i, j int) bool {
		return allPosts[i].CreatedAt.After(allPosts[j].CreatedAt)
	})
	return allPosts, nil
}

func (r *BlogRepository) GetBySlug(ctx context.Context, slug string) (*domain.BlogPost, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	for _, post := range r.posts {
		if post.Slug == slug {
			return post, nil
		}
	}
	return nil, fmt.Errorf("blog post with slug %s not found", slug)
}
