package usecase

import (
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
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
	company := &domain.Company{Name: companyName}
	if err := s.companyRepo.FindOrCreate(company); err != nil {
		return nil, err
	}

	role := &domain.Role{CompanyID: company.ID, Title: roleTitle}
	if err := s.roleRepo.FindOrCreate(role); err != nil {
		return nil, err
	}

	date, err := time.Parse("2006-01-02", dateAppliedStr)
	if err != nil {
		return nil, err
	}

	app := &domain.Application{
		UserID:      userID,
		CompanyID:   company.ID,
		RoleID:      role.ID,
		DateApplied: date,
		Status:      status,
	}

	if err := s.appRepo.Create(app); err != nil {
		return nil, err
	}

	return app, nil
}

func (s *applicationService) GetApplications(userID int64) ([]domain.Application, error) {
	return s.appRepo.GetAllForUser(userID)
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
		return nil, nil // Or return an error for not found
	}

	company := &domain.Company{Name: companyName}
	if err := s.companyRepo.FindOrCreate(company); err != nil {
		return nil, err
	}

	role := &domain.Role{CompanyID: company.ID, Title: roleTitle}
	if err := s.roleRepo.FindOrCreate(role); err != nil {
		return nil, err
	}

	date, err := time.Parse("2006-01-02", dateAppliedStr)
	if err != nil {
		return nil, err
	}

	app.CompanyID = company.ID
	app.RoleID = role.ID
	app.Status = status
	app.DateApplied = date

	if err := s.appRepo.Update(app); err != nil {
		return nil, err
	}

	return app, nil
}

func (s *applicationService) DeleteApplication(id, userID int64) error {
	return s.appRepo.Delete(id, userID)
}

