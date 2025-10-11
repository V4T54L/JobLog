package usecase

import (
	"fmt"
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
	"strings"
	"time"
)

type applicationService struct {
	appRepo     repository.ApplicationRepository
	companyRepo repository.CompanyRepository
	roleRepo    repository.RoleRepository
}

func NewApplicationService(appRepo repository.ApplicationRepository, companyRepo repository.CompanyRepository, roleRepo repository.RoleRepository) ApplicationUseCase {
	return &applicationService{
		appRepo:     appRepo,
		companyRepo: companyRepo,
		roleRepo:    roleRepo,
	}
}

func (s *applicationService) CreateApplication(userID int64, companyName, roleTitle, status, dateAppliedStr string) (*domain.Application, error) {
	company := &domain.Company{
		Name:           companyName,
		NormalizedName: strings.ToLower(companyName),
	}
	if err := s.companyRepo.FindOrCreate(company); err != nil {
		return nil, fmt.Errorf("failed to find or create company: %w", err)
	}

	role := &domain.Role{
		CompanyID: company.ID,
		Title:     roleTitle,
	}
	if err := s.roleRepo.FindOrCreate(role); err != nil {
		return nil, fmt.Errorf("failed to find or create role: %w", err)
	}

	dateApplied, err := time.Parse("2006-01-02", dateAppliedStr)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %w", err)
	}

	app := &domain.Application{
		UserID:      userID,
		CompanyID:   company.ID,
		RoleID:      role.ID,
		DateApplied: dateApplied,
		Status:      status,
	}

	if err := s.appRepo.Create(app); err != nil {
		return nil, fmt.Errorf("failed to create application: %w", err)
	}

	return app, nil
}

func (s *applicationService) GetApplications(userID int64, params domain.ListParams) (*domain.PaginatedApplications, error) {
	return s.appRepo.GetApplications(userID, params)
}

func (s *applicationService) GetApplicationByID(id, userID int64) (*domain.Application, error) {
	return s.appRepo.GetByID(id, userID)
}

func (s *applicationService) UpdateApplication(id, userID int64, companyName, roleTitle, status, dateAppliedStr string) (*domain.Application, error) {
	app, err := s.appRepo.GetByID(id, userID)
	if err != nil {
		return nil, err
	}
	if app == nil {
		return nil, fmt.Errorf("application not found")
	}

	company := &domain.Company{
		Name:           companyName,
		NormalizedName: strings.ToLower(companyName),
	}
	if err := s.companyRepo.FindOrCreate(company); err != nil {
		return nil, fmt.Errorf("failed to find or create company: %w", err)
	}

	role := &domain.Role{
		CompanyID: company.ID,
		Title:     roleTitle,
	}
	if err := s.roleRepo.FindOrCreate(role); err != nil {
		return nil, fmt.Errorf("failed to find or create role: %w", err)
	}

	dateApplied, err := time.Parse("2006-01-02", dateAppliedStr)
	if err != nil {
		return nil, fmt.Errorf("invalid date format: %w", err)
	}

	app.CompanyID = company.ID
	app.RoleID = role.ID
	app.Status = status
	app.DateApplied = dateApplied

	if err := s.appRepo.Update(app); err != nil {
		return nil, fmt.Errorf("failed to update application: %w", err)
	}

	return app, nil
}

func (s *applicationService) DeleteApplication(id, userID int64) error {
	return s.appRepo.Delete(id, userID)
}

