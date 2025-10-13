
package service

import (
	"context"
	"fmt"
	"time"

	"joblog/internal/core/domain"

	"github.com/google/uuid"
)

type ApplicationService struct {
	repo domain.ApplicationRepository
}

func NewApplicationService(repo domain.ApplicationRepository) *ApplicationService {
	return &ApplicationService{repo: repo}
}

func (s *ApplicationService) Create(ctx context.Context, userID string, newApp domain.NewApplication) (*domain.Application, error) {
	now := time.Now().Format("2006-01-02")
	app := &domain.Application{
		ID:        uuid.NewString(),
		UserID:    userID,
		Company:   newApp.Company,
		Role:      newApp.Role,
		Date:      newApp.Date,
		UpdatedAt: now,
		Status:    newApp.Status,
		Notes:     []domain.Note{},
		History: []domain.HistoryEvent{
			{Date: time.Now(), Event: fmt.Sprintf("Application created with status: %s", newApp.Status)},
		},
	}

	if err := s.repo.Create(ctx, app); err != nil {
		return nil, err
	}
	return app, nil
}

func (s *ApplicationService) GetAllByUserID(ctx context.Context, userID string) ([]*domain.Application, error) {
	return s.repo.GetAllByUserID(ctx, userID)
}

func (s *ApplicationService) GetByID(ctx context.Context, userID, appID string) (*domain.Application, error) {
	app, err := s.repo.GetByID(ctx, appID)
	if err != nil {
		return nil, fmt.Errorf("application not found")
	}
	if app.UserID != userID {
		return nil, fmt.Errorf("access denied")
	}
	return app, nil
}

func (s *ApplicationService) Update(ctx context.Context, userID, appID string, updateData domain.ApplicationUpdate) (*domain.Application, error) {
	app, err := s.GetByID(ctx, userID, appID)
	if err != nil {
		return nil, err
	}

	// Apply updates
	if updateData.Company != nil {
		app.Company = *updateData.Company
	}
	if updateData.Role != nil {
		app.Role = *updateData.Role
	}
	if updateData.Date != nil {
		app.Date = *updateData.Date
	}
	if updateData.Status != nil && app.Status != *updateData.Status {
		app.Status = *updateData.Status
		app.History = append(app.History, domain.HistoryEvent{
			Date:  time.Now(),
			Event: fmt.Sprintf("Status updated to: %s", *updateData.Status),
		})
	}

	app.UpdatedAt = time.Now().Format("2006-01-02")

	if err := s.repo.Update(ctx, app); err != nil {
		return nil, err
	}
	return app, nil
}

func (s *ApplicationService) Archive(ctx context.Context, userID, appID string) error {
	app, err := s.GetByID(ctx, userID, appID)
	if err != nil {
		return err
	}

	app.Status = domain.StatusArchived
	app.UpdatedAt = time.Now().Format("2006-01-02")
	app.History = append(app.History, domain.HistoryEvent{
		Date:  time.Now(),
		Event: "Application archived",
	})

	return s.repo.Update(ctx, app)
}

func (s *ApplicationService) AddNote(ctx context.Context, userID, appID, content string) (*domain.Note, error) {
	app, err := s.GetByID(ctx, userID, appID)
	if err != nil {
		return nil, err
	}

	newNote := domain.Note{
		ID:        uuid.NewString(),
		Content:   content,
		CreatedAt: time.Now(),
	}
	app.Notes = append(app.Notes, newNote)
	app.UpdatedAt = time.Now().Format("2006-01-02")

	if err := s.repo.Update(ctx, app); err != nil {
		return nil, err
	}

	return &newNote, nil
}

func (s *ApplicationService) UpdateNote(ctx context.Context, userID, appID, noteID, content string) (*domain.Note, error) {
	app, err := s.GetByID(ctx, userID, appID)
	if err != nil {
		return nil, err
	}

	var targetNote *domain.Note
	for i, note := range app.Notes {
		if note.ID == noteID {
			app.Notes[i].Content = content
			targetNote = &app.Notes[i]
			break
		}
	}

	if targetNote == nil {
		return nil, fmt.Errorf("note not found")
	}

	app.UpdatedAt = time.Now().Format("2006-01-02")
	if err := s.repo.Update(ctx, app); err != nil {
		return nil, err
	}

	return targetNote, nil
}

func (s *ApplicationService) DeleteNote(ctx context.Context, userID, appID, noteID string) error {
	app, err := s.GetByID(ctx, userID, appID)
	if err != nil {
		return err
	}

	noteIndex := -1
	for i, note := range app.Notes {
		if note.ID == noteID {
			noteIndex = i
			break
		}
	}

	if noteIndex == -1 {
		return fmt.Errorf("note not found")
	}

	// Remove the note from the slice
	app.Notes = append(app.Notes[:noteIndex], app.Notes[noteIndex+1:]...)
	app.UpdatedAt = time.Now().Format("2006-01-02")

	return s.repo.Update(ctx, app)
}
