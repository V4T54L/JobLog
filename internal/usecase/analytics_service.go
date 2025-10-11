package usecase

import (
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/repository"
)

type analyticsService struct {
	repo repository.AnalyticsRepository
}

func NewAnalyticsService(repo repository.AnalyticsRepository) AnalyticsUseCase {
	return &analyticsService{repo: repo}
}

func (s *analyticsService) GetDashboardAnalytics(userID int64) (*domain.DashboardAnalytics, error) {
	statusCounts, err := s.repo.GetApplicationCountsByStatus(userID)
	if err != nil {
		return nil, err
	}

	timeCounts, err := s.repo.GetApplicationCountsOverTime(userID)
	if err != nil {
		return nil, err
	}

	analytics := &domain.DashboardAnalytics{
		ApplicationsByStatus: statusCounts,
		ApplicationsOverTime: timeCounts,
	}

	return analytics, nil
}

