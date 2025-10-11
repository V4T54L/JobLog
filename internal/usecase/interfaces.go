package usecase

import "job-app-tracker/internal/domain"

type UserUseCase interface {
	Register(username, email, password string) (*domain.User, error)
	Login(email, password string) (string, error)
}

type ApplicationUseCase interface {
	CreateApplication(userID int64, companyName, roleTitle, status, dateApplied string) (*domain.Application, error)
	GetApplications(userID int64) ([]domain.Application, error)
	GetApplicationByID(id, userID int64) (*domain.Application, error)
	UpdateApplication(id, userID int64, companyName, roleTitle, status, dateApplied string) (*domain.Application, error)
	DeleteApplication(id, userID int64) error
}

