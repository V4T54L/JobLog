package usecase

import (
	"database/sql"
	"errors"
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"job-app-tracker/pkg/util"
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
	slugBase := util.Slugify(title)
	slug := slugBase
	counter := 1
	for {
		isTaken, err := s.blogRepo.IsSlugTaken(slug, userID)
		if err != nil {
			return nil, err
		}
		if !isTaken {
			break
		}
		slug = fmt.Sprintf("%s-%d", slugBase, counter)
		counter++
	}

	excerpt := contentMd
	if len(excerpt) > 150 {
		excerpt = excerpt[:150]
		if lastSpace := strings.LastIndex(excerpt, " "); lastSpace != -1 {
			excerpt = excerpt[:lastSpace]
		}
		excerpt += "..."
	}

	post := &domain.BlogPost{
		UserID:      userID,
		Title:       title,
		Slug:        slug,
		ContentMD:   contentMd,
		ContentHTML: contentHtml,
		Excerpt:     sql.NullString{String: excerpt, Valid: true},
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
		return nil, nil
	}
	return post, nil
}

func (s *blogService) GetPublicPosts() ([]*domain.BlogPost, error) {
	return s.blogRepo.GetAllPublic()
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
			return nil, errors.New("parent comment not found")
		}
		if parent.PostID != postID {
			return nil, errors.New("parent comment does not belong to this post")
		}
		if parent.DepthLevel >= MaxCommentDepth {
			return nil, errors.New("maximum comment depth reached")
		}
		comment.ParentCommentID = sql.NullInt64{Int64: *parentCommentID, Valid: true}
		comment.DepthLevel = parent.DepthLevel + 1
	}

	if err := s.commentRepo.Create(comment); err != nil {
		return nil, err
	}

	return comment, nil
}

func (s *blogService) GetCommentsForPost(postID int64) ([]*domain.Comment, error) {
	comments, err := s.commentRepo.GetForPost(postID)
	if err != nil {
		return nil, err
	}

	// Build nested structure
	commentMap := make(map[int64]*domain.Comment)
	for _, c := range comments {
		commentMap[c.ID] = c
	}

	var rootComments []*domain.Comment
	for _, c := range comments {
		if c.ParentCommentID.Valid {
			if parent, ok := commentMap[c.ParentCommentID.Int64]; ok {
				parent.Replies = append(parent.Replies, c)
			}
		} else {
			rootComments = append(rootComments, c)
		}
	}

	return rootComments, nil
}

func (s *blogService) ToggleLike(userID int64, contentType domain.ContentType, contentID int64) (bool, error) {
	existingLike, err := s.likeRepo.Get(userID, contentType, contentID)
	if err != nil {
		return false, err
	}

	if existingLike != nil {
		// Unlike
		if err := s.likeRepo.Delete(userID, contentType, contentID); err != nil {
			return false, err
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
		return false, err
	}
	return true, nil
}
