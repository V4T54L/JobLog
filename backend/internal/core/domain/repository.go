
package domain

import "context"

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByUsername(ctx context.Context, username string) (*User, error)
	GetByID(ctx context.Context, id string) (*User, error)
}

type ApplicationRepository interface {
	Create(ctx context.Context, app *Application) error
	GetAllByUserID(ctx context.Context, userID string) ([]*Application, error)
	GetByID(ctx context.Context, id string) (*Application, error)
	Update(ctx context.Context, app *Application) error
	Delete(ctx context.Context, id string) error // In this case, we know it's a soft delete (archive)
}

type BlogRepository interface {
	Create(ctx context.Context, post *BlogPost) error
	GetAll(ctx context.Context) ([]*BlogPost, error)
	GetBySlug(ctx context.Context, slug string) (*BlogPost, error)
}
