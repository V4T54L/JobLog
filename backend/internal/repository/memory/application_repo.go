
package memory

import (
	"context"
	"fmt"
	"sort"
	"sync"

	"joblog/internal/core/domain"
)

type ApplicationRepository struct {
	apps map[string]*domain.Application
	mu   sync.RWMutex
}

func NewApplicationRepository() *ApplicationRepository {
	return &ApplicationRepository{apps: mockApplications}
}

func (r *ApplicationRepository) Create(ctx context.Context, app *domain.Application) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.apps[app.ID] = app
	return nil
}

func (r *ApplicationRepository) GetAllByUserID(ctx context.Context, userID string) ([]*domain.Application, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var userApps []*domain.Application
	for _, app := range r.apps {
		if app.UserID == userID && app.Status != domain.StatusArchived {
			userApps = append(userApps, app)
		}
	}
	// Sort by date descending
	sort.Slice(userApps, func(i, j int) bool {
		return userApps[i].Date > userApps[j].Date
	})
	return userApps, nil
}

func (r *ApplicationRepository) GetByID(ctx context.Context, id string) (*domain.Application, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	app, ok := r.apps[id]
	if !ok {
		return nil, fmt.Errorf("application with ID %s not found", id)
	}
	return app, nil
}

func (r *ApplicationRepository) Update(ctx context.Context, app *domain.Application) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.apps[app.ID]; !ok {
		return fmt.Errorf("application with ID %s not found", app.ID)
	}
	r.apps[app.ID] = app
	return nil
}

// Delete is a soft delete (archive) which is handled by the service setting the status.
// The update method persists this change. This method is here to satisfy the interface.
func (r *ApplicationRepository) Delete(ctx context.Context, id string) error {
	r.mu.Lock()
	defer r.mu.Unlock()
	if _, ok := r.apps[id]; !ok {
		return fmt.Errorf("application with ID %s not found", id)
	}
	// The service layer handles setting the 'Archived' status.
	// This method could be a hard delete if needed, e.g., delete(r.apps, id)
	// But based on the OpenAPI spec, we just update the status.
	return nil
}
