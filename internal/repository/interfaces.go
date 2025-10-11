package repository

import "job-app-tracker/internal/domain"

type UserRepository interface {
	Create(user *domain.User) error
	GetByEmail(email string) (*domain.User, error)
	GetByUsername(username string) (*domain.User, error)
	GetByID(id int64) (*domain.User, error)
}

type CompanyRepository interface {
	FindOrCreate(company *domain.Company) error
}

type RoleRepository interface {
	FindOrCreate(role *domain.Role) error
}

type ApplicationRepository interface {
	Create(app *domain.Application) error
	GetByID(id int64, userID int64) (*domain.Application, error)
	GetApplications(userID int64, params domain.ListParams) (*domain.PaginatedApplications, error)
	Update(app *domain.Application) error
	Delete(id int64, userID int64) error
}

type ApplicationNoteRepository interface {
	Create(note *domain.ApplicationNote) error
	GetAllForApplication(appID int64, userID int64) ([]domain.ApplicationNote, error)
}

type BlogPostRepository interface {
	Create(post *domain.BlogPost) error
	GetBySlugAndUser(slug string, username string) (*domain.BlogPost, error)
	GetPublicPosts(params domain.ListParams) (*domain.PaginatedBlogPosts, error)
	GetPublicPostsByUserID(userID int64) ([]domain.BlogPost, error)
	IsSlugTaken(slug string, userID int64) (bool, error)
}

type CommentRepository interface {
	Create(comment *domain.Comment) error
	GetByID(id int64) (*domain.Comment, error)
	GetForPost(postID int64) ([]domain.Comment, error)
}

type LikeRepository interface {
	Create(like *domain.Like) error
	Delete(userID int64, contentType domain.ContentType, contentID int64) error
	Get(userID int64, contentType domain.ContentType, contentID int64) (*domain.Like, error)
}

type FollowRepository interface {
	Create(follow *domain.Follow) error
	Delete(followerID, followeeID int64) error
	Exists(followerID, followeeID int64) (bool, error)
	GetFollowerCount(userID int64) (int, error)
	GetFollowingCount(userID int64) (int, error)
}

type AnalyticsRepository interface {
	GetApplicationCountsByStatus(userID int64) ([]domain.StatusCount, error)
	GetApplicationCountsOverTime(userID int64) ([]domain.ApplicationsOverTime, error)
}

