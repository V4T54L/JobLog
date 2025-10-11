package usecase

import "job-app-tracker/internal/domain"

type UserUseCase interface {
	Register(username, email, password string) (*domain.User, error)
	Login(email, password string) (string, error)
}

type ApplicationUseCase interface {
	CreateApplication(userID int64, companyName, roleTitle, status, dateAppliedStr string) (*domain.Application, error)
	GetApplications(userID int64) ([]*domain.Application, error)
	GetApplicationByID(id, userID int64) (*domain.Application, error)
	UpdateApplication(id, userID int64, companyName, roleTitle, status, dateAppliedStr string) (*domain.Application, error)
	DeleteApplication(id, userID int64) error
}

type BlogUseCase interface {
	CreatePost(userID int64, title, contentMd, contentHtml string, isPublic bool) (*domain.BlogPost, error)
	GetPublicPost(username, slug string) (*domain.BlogPost, error)
	GetPublicPosts() ([]*domain.BlogPost, error)
	AddComment(postID, userID int64, parentCommentID *int64, contentMd, contentHtml string) (*domain.Comment, error)
	GetCommentsForPost(postID int64) ([]*domain.Comment, error)
	ToggleLike(userID int64, contentType domain.ContentType, contentID int64) (bool, error)
}
