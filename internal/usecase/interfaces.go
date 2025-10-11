package usecase

import "job-app-tracker/internal/domain"

type UserUseCase interface {
	Register(username, email, password string) (*domain.User, error)
	Login(email, password string) (string, error) // Returns token
}

