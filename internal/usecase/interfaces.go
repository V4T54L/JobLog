package usecase

import "job-app-tracker/internal/domain"

type UserUseCase interface {
	Register(username, email, password string) (*domain.User, error)
	Login(email, password string) (*domain.User, string, error)
	GetProfile(username string, viewerID int64) (*UserProfile, error)
	FollowUser(followerID int64, followeeUsername string) error
	UnfollowUser(followerID int64, followeeUsername string) error
}

type ApplicationUseCase interface {
	CreateApplication(userID int64, companyName, roleTitle, status, dateAppliedStr string) (*domain.Application, error)
	GetApplications(userID int64, params domain.ListParams) (*domain.PaginatedApplications, error)
	GetApplicationByID(id, userID int64) (*domain.Application, error)
	UpdateApplication(id, userID int64, companyName, roleTitle, status, dateAppliedStr string) (*domain.Application, error)
	DeleteApplication(id, userID int64) error
}

type BlogUseCase interface {
	CreatePost(userID int64, title, contentMd, contentHtml string, isPublic bool) (*domain.BlogPost, error)
	GetPublicPost(username, slug string) (*domain.BlogPost, error)
	GetPublicPosts(params domain.ListParams) (*domain.PaginatedBlogPosts, error)
	AddComment(postID, userID int64, parentCommentID *int64, contentMd, contentHtml string) (*domain.Comment, error)
	GetCommentsForPost(postID int64) ([]*domain.Comment, error)
	ToggleLike(userID int64, contentType domain.ContentType, contentID int64) (bool, error)
}

// UserProfile is a DTO for the user profile view
type UserProfile struct {
	User           *domain.User         `json:"user"`
	Posts          []domain.BlogPost    `json:"posts"`
	IsFollowing    bool                 `json:"isFollowing"`
	FollowerCount  int                  `json:"followerCount"`
	FollowingCount int                  `json:"followingCount"`
}
