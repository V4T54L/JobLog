package repository

import "job-app-tracker/internal/domain"

type UserRepository interface {
	Create(user *domain.User) error
	GetByEmail(email string) (*domain.User, error)
	GetByUsername(username string) (*domain.User, error)
	GetByID(id int64) (*domain.User, error)
}

