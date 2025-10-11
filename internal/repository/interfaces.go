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
	GetAllForUser(userID int64) ([]domain.Application, error)
	Update(app *domain.Application) error
	Delete(id int64, userID int64) error
}

type ApplicationNoteRepository interface {
	Create(note *domain.ApplicationNote) error
	GetAllForApplication(appID int64, userID int64) ([]domain.ApplicationNote, error)
}

