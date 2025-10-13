
package domain

import "time"

// |--- User & Auth Models ---

type User struct {
	ID           string `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	PasswordHash string `json:"-"` // Not exposed in API
}

type UserRegistration struct {
	Username string `json:"username" required:"true"`
	Email    string `json:"email" required:"true"`
	Password string `json:"password" required:"true"`
}

type UserLogin struct {
	Username string `json:"username" required:"true"`
	Password string `json:"password" required:"true"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  *User  `json:"user"`
}

// |--- Application Models ---

type ApplicationStatus string

const (
	StatusApplied     ApplicationStatus = "Applied"
	StatusInterviewing ApplicationStatus = "Interviewing"
	StatusOffer       ApplicationStatus = "Offer"
	StatusRejected    ApplicationStatus = "Rejected"
	StatusArchived    ApplicationStatus = "Archived"
)

type HistoryEvent struct {
	Date  time.Time `json:"date"`
	Event string    `json:"event"`
}

type Note struct {
	ID        string    `json:"id"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type Application struct {
	ID        string            `json:"id"`
	UserID    string            `json:"-"` // Internal use
	Company   string            `json:"company"`
	Role      string            `json:"role"`
	Date      string            `json:"date"` // Format: YYYY-MM-DD
	UpdatedAt string            `json:"updatedAt"`
	Status    ApplicationStatus `json:"status"`
	Notes     []Note            `json:"notes"`
	History   []HistoryEvent    `json:"history"`
}

type NewApplication struct {
	Company string            `json:"company" required:"true"`
	Role    string            `json:"role" required:"true"`
	Date    string            `json:"date" required:"true"`
	Status  ApplicationStatus `json:"status" required:"true"`
}

type ApplicationUpdate struct {
	Company *string            `json:"company,omitempty"`
	Role    *string            `json:"role,omitempty"`
	Date    *string            `json:"date,omitempty"`
	Status  *ApplicationStatus `json:"status,omitempty"`
}

// |--- Blog Models ---

type Comment struct {
	ID        string    `json:"id"`
	Author    string    `json:"author"`
	Avatar    string    `json:"avatar"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	Likes     int       `json:"likes"`
	Replies   []Comment `json:"replies"`
}

type BlogPost struct {
	ID           string    `json:"id"`
	Slug         string    `json:"slug"`
	Title        string    `json:"title"`
	Content      string    `json:"content"`
	Author       string    `json:"author"`
	AuthorAvatar string    `json:"authorAvatar"`
	CreatedAt    time.Time `json:"createdAt"`
	Likes        int       `json:"likes"`
	CoverImage   string    `json:"coverImage"`
	IsPublic     bool      `json:"isPublic"`
	Comments     []Comment `json:"comments"`
}

type NewBlogPost struct {
	Title    string `json:"title" required:"true"`
	Content  string `json:"content" required:"true"`
	IsPublic *bool  `json:"isPublic,omitempty"`
}
