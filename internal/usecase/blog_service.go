package usecase

import (
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"job-app-tracker/pkg/util"
	"strconv"
)

const MaxCommentDepth = 5

type blogService struct {
	blogRepo    repository.BlogPostRepository
	commentRepo repository.CommentRepository
	likeRepo    repository.LikeRepository
}

func NewBlogService(blogRepo repository.BlogPostRepository, commentRepo repository.CommentRepository, likeRepo repository.LikeRepository) BlogUseCase {
	return &blogService{
		blogRepo:    blogRepo,
		commentRepo: commentRepo,
		likeRepo:    likeRepo,
	}
}

func (s *blogService) CreatePost(userID int64, title, contentMd, contentHtml string, isPublic bool) (*domain.BlogPost, error) {
	slug := util.Slugify(title)

	// Ensure slug is unique for the user
	isTaken, err := s.blogRepo.IsSlugTaken(slug, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to check slug uniqueness: %w", err)
	}
	if isTaken {
		// Append a suffix to make it unique
		i := 1
		for {
			newSlug := fmt.Sprintf("%s-%d", slug, i)
			isTaken, err = s.blogRepo.IsSlugTaken(newSlug, userID)
			if err != nil {
				return nil, fmt.Errorf("failed to check slug uniqueness: %w", err)
			}
			if !isTaken {
				slug = newSlug
				break
			}
			i++
		}
	}

	// Create an excerpt
	excerpt := contentMd
	if len(excerpt) > 150 {
		excerpt = excerpt[:150] + "..."
	}

	post := &domain.BlogPost{
		UserID:      userID,
		Title:       title,
		Slug:        slug,
		ContentMD:   contentMd,
		ContentHTML: contentHtml,
		Excerpt:     excerpt,
		IsPublic:    isPublic,
	}

	if err := s.blogRepo.Create(post); err != nil {
		return nil, fmt.Errorf("failed to create post: %w", err)
	}

	return post, nil
}

func (s *blogService) GetPublicPost(username, slug string) (*domain.BlogPost, error) {
	post, err := s.blogRepo.GetBySlugAndUser(slug, username)
	if err != nil {
		return nil, err
	}
	if post != nil && !post.IsPublic {
		return nil, nil // Not found if not public
	}
	return post, nil
}

func (s *blogService) GetPublicPosts(params domain.ListParams) (*domain.PaginatedBlogPosts, error) {
	return s.blogRepo.GetPublicPosts(params)
}

func (s *blogService) AddComment(postID, userID int64, parentCommentID *int64, contentMd, contentHtml string) (*domain.Comment, error) {
	comment := &domain.Comment{
		PostID:      postID,
		UserID:      userID,
		ContentMD:   contentMd,
		ContentHTML: contentHtml,
		DepthLevel:  0,
	}

	if parentCommentID != nil {
		parent, err := s.commentRepo.GetByID(*parentCommentID)
		if err != nil {
			return nil, fmt.Errorf("failed to get parent comment: %w", err)
		}
		if parent == nil {
			return nil, fmt.Errorf("parent comment not found")
		}
		if parent.DepthLevel >= MaxCommentDepth {
			return nil, fmt.Errorf("maximum comment depth reached")
		}
		comment.ParentCommentID.Int64 = *parentCommentID
		comment.ParentCommentID.Valid = true
		comment.DepthLevel = parent.DepthLevel + 1
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, fmt.Errorf("failed to create comment: %w", err)
	}

	return comment, nil
}

func (s *blogService) GetCommentsForPost(postID int64) ([]*domain.Comment, error) {
	flatComments, err := s.commentRepo.GetForPost(postID)
	if err != nil {
		return nil, err
	}

	commentMap := make(map[int64]*domain.Comment)
	var rootComments []*domain.Comment

	for i := range flatComments {
		c := flatComments[i]
		commentMap[c.ID] = &c
	}

	for _, c := range flatComments {
		comment := c
		if comment.ParentCommentID.Valid {
			parent, ok := commentMap[comment.ParentCommentID.Int64]
			if ok {
				parent.Replies = append(parent.Replies, &comment)
			}
		} else {
			rootComments = append(rootComments, &comment)
		}
	}

	return rootComments, nil
}

func (s *blogService) ToggleLike(userID int64, contentType domain.ContentType, contentID int64) (bool, error) {
	existingLike, err := s.likeRepo.Get(userID, contentType, contentID)
	if err != nil {
		return false, fmt.Errorf("failed to check for existing like: %w", err)
	}

	if existingLike != nil {
		// Unlike
		if err := s.likeRepo.Delete(userID, contentType, contentID); err != nil {
			return false, fmt.Errorf("failed to delete like: %w", err)
		}
		return false, nil
	}

	// Like
	like := &domain.Like{
		UserID:      userID,
		ContentType: contentType,
		ContentID:   contentID,
	}
	if err := s.likeRepo.Create(like); err != nil {
		return false, fmt.Errorf("failed to create like: %w", err)
	}
	return true, nil
}

