package usecase

import (
	"errors"
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"job-app-tracker/pkg/util"
	"strconv"
	"strings"
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
	if title == "" || len(title) > 255 {
		return nil, errors.New("title is required and must be less than 255 characters")
	}
	if contentMd == "" {
		return nil, errors.New("content cannot be empty")
	}

	baseSlug := util.Slugify(title)
	slug := baseSlug
	counter := 1
	for {
		isTaken, err := s.blogRepo.IsSlugTaken(slug, userID)
		if err != nil {
			return nil, err
		}
		if !isTaken {
			break
		}
		slug = fmt.Sprintf("%s-%d", baseSlug, counter)
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
		ContentHTML: contentHtml,
		Excerpt:     excerpt,
		IsPublic:    isPublic,
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
		return nil, nil // Not found
	}
	return post, nil
}

func (s *blogService) GetPublicPosts(params domain.ListParams) (*domain.PaginatedBlogPosts, error) {
	return s.blogRepo.GetPublicPosts(params)
}

func (s *blogService) AddComment(postID, userID int64, parentCommentID *int64, contentMd, contentHtml string) (*domain.Comment, error) {
	if contentMd == "" {
		return nil, errors.New("comment content cannot be empty")
	}

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
			return nil, err
		}
		if parent == nil {
			return nil, errors.New("parent comment not found")
		}
		if parent.DepthLevel >= MaxCommentDepth {
			return nil, errors.New("maximum comment depth reached")
		}
		comment.ParentCommentID.Int64 = *parentCommentID
		comment.ParentCommentID.Valid = true
		comment.DepthLevel = parent.DepthLevel + 1
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, err
	}
	return comment, nil
}

// GetCommentsForPost retrieves all comments for a post and organizes them into a nested structure.
func (s *blogService) GetCommentsForPost(postID int64) ([]*domain.Comment, error) {
	flatComments, err := s.commentRepo.GetForPost(postID)
	if err != nil {
		return nil, err
	}

	// Use a map to easily access comments by their ID for nesting
	commentMap := make(map[int64]*domain.Comment)
	for _, c := range flatComments {
		commentMap[c.ID] = c
	}

	var nestedComments []*domain.Comment
	for _, c := range flatComments {
		if c.ParentCommentID.Valid {
			parent, ok := commentMap[c.ParentCommentID.Int64]
			if ok {
				parent.Replies = append(parent.Replies, c)
			}
		} else {
			// This is a top-level comment
			nestedComments = append(nestedComments, c)
		}
	}

	return nestedComments, nil
}

func (s *blogService) ToggleLike(userID int64, contentType domain.ContentType, contentID int64) (bool, error) {
	existingLike, err := s.likeRepo.Get(userID, contentType, contentID)
	if err != nil {
		return false, err
	}

	if existingLike != nil {
		// Unlike
		err = s.likeRepo.Delete(userID, contentType, contentID)
		return false, err
	}

	// Like
	like := &domain.Like{
		UserID:      userID,
		ContentType: contentType,
		ContentID:   contentID,
	}
	err = s.likeRepo.Create(like)
	return true, err
}

