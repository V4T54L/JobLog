
package memory

import (
	"log"
	"time"

	"joblog/internal/core/domain"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	mockUsers        = make(map[string]*domain.User)
	mockApplications = make(map[string]*domain.Application)
	mockBlogPosts    = make(map[string]*domain.BlogPost)
)

func init() {
	log.Println("Seeding in-memory database with mock data...")

	// |--- Users ---
	password, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	user1ID := "a1b2c3d4-e5f6-7777-8888-999aaabbbccc"
	user1 := &domain.User{
		ID:           user1ID,
		Username:     "johndoe",
		Email:        "john.doe@example.com",
		PasswordHash: string(password),
	}
	mockUsers[user1.ID] = user1
	mockUsers[user1.Username] = user1
	mockUsers[user1.Email] = user1

	// |--- Applications ---
	app1ID := "app-1111-2222-3333"
	mockApplications[app1ID] = &domain.Application{
		ID:        app1ID,
		UserID:    user1ID,
		Company:   "Google",
		Role:      "Senior Software Engineer",
		Date:      "2025-09-01",
		UpdatedAt: "2025-09-20",
		Status:    domain.StatusInterviewing,
		Notes: []domain.Note{
			{ID: uuid.NewString(), Content: "First interview with HR was great.", CreatedAt: time.Now().Add(-20 * 24 * time.Hour)},
			{ID: uuid.NewString(), Content: "Technical screen scheduled for next week.", CreatedAt: time.Now().Add(-15 * 24 * time.Hour)},
		},
		History: []domain.HistoryEvent{
			{Date: time.Now().Add(-30 * 24 * time.Hour), Event: "Application created with status: Applied"},
			{Date: time.Now().Add(-20 * 24 * time.Hour), Event: "Status updated to: Interviewing"},
		},
	}

	app2ID := "app-4444-5555-6666"
	mockApplications[app2ID] = &domain.Application{
		ID:        app2ID,
		UserID:    user1ID,
		Company:   "Meta",
		Role:      "Product Manager",
		Date:      "2025-08-15",
		UpdatedAt: "2025-09-05",
		Status:    domain.StatusRejected,
		Notes:     []domain.Note{},
		History: []domain.HistoryEvent{
			{Date: time.Now().Add(-45 * 24 * time.Hour), Event: "Application created with status: Applied"},
			{Date: time.Now().Add(-25 * 24 * time.Hour), Event: "Status updated to: Rejected"},
		},
	}

	// |--- Blog Posts ---
	post1ID := "post-aaaa-bbbb-cccc"
	mockBlogPosts[post1ID] = &domain.BlogPost{
		ID:           post1ID,
		Slug:         "mastering-go-a-beginners-guide-x1y2z3",
		Title:        "Mastering Go: A Beginner's Guide",
		Content:      "## Welcome to Go!\n\nGo is an open-source programming language...",
		Author:       "Jane Smith",
		AuthorAvatar: "https://i.pravatar.cc/150?u=jane",
		CreatedAt:    time.Now().Add(-10 * 24 * time.Hour),
		Likes:        128,
		CoverImage:   "https://picsum.photos/seed/golang/800/400",
		IsPublic:     true,
		Comments: []domain.Comment{
			{
				ID:        uuid.NewString(),
				Author:    "John Doe",
				Avatar:    "https://i.pravatar.cc/150?u=johndoe",
				Content:   "Great article! Really helpful for getting started.",
				CreatedAt: time.Now().Add(-9 * 24 * time.Hour),
				Likes:     15,
				Replies:   []domain.Comment{},
			},
		},
	}
	post2ID := "post-dddd-eeee-ffff"
	mockBlogPosts[post2ID] = &domain.BlogPost{
		ID:           post2ID,
		Slug:         "the-art-of-api-design-a1b2c3",
		Title:        "The Art of API Design",
		Content:      "## Principles of Good API Design\n\n1. **Simplicity is key.**...",
		Author:       "Jane Smith",
		AuthorAvatar: "https://i.pravatar.cc/150?u=jane",
		CreatedAt:    time.Now().Add(-5 * 24 * time.Hour),
		Likes:        256,
		CoverImage:   "https://picsum.photos/seed/api/800/400",
		IsPublic:     true,
		Comments:     []domain.Comment{},
	}

	log.Println("Mock data loaded successfully.")
}
