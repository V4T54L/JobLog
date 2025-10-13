
package api

import (
	"net/http"

	"joblog/internal/api/handler"
	"joblog/internal/api/middleware"
	"joblog/pkg/auth"

	"github.com/go-chi/chi/v5"
	chi_middleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func NewRouter(
	authHandler *handler.AuthHandler,
	appHandler *handler.ApplicationHandler,
	blogHandler *handler.BlogHandler,
	jwtManager *auth.JWTManager,
) http.Handler {
	r := chi.NewRouter()

	// |--- Global Middleware ---
	r.Use(chi_middleware.Logger)
	r.Use(chi_middleware.Recoverer)
	r.Use(chi_middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any browser
	}))

	// |--- Public Routes ---
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Welcome to JobLog API"))
	})

	r.Route("/auth", func(r chi.Router) {
		r.Post("/register", authHandler.Register)
		r.Post("/login", authHandler.Login)
	})

	r.Route("/blog", func(r chi.Router) {
		r.Get("/", blogHandler.GetAllBlogPosts)
		r.Get("/{slug}", blogHandler.GetBlogPostBySlug)
	})

	// |--- Protected Routes (Require Authentication) ---
	r.Group(func(r chi.Router) {
		r.Use(middleware.Authenticator(jwtManager))

		// Authenticated user profile
		r.Get("/auth/me", authHandler.GetMyProfile)

		// Job Applications
		r.Route("/applications", func(r chi.Router) {
			r.Get("/", appHandler.GetAllApplications)
			r.Post("/", appHandler.CreateApplication)
			r.Route("/{id}", func(r chi.Router) {
				r.Get("/", appHandler.GetApplicationByID)
				r.Put("/", appHandler.UpdateApplication)
				r.Delete("/", appHandler.ArchiveApplication) // Soft delete

				// Application Notes
				r.Route("/notes", func(r chi.Router) {
					r.Post("/", appHandler.AddNote)
					r.Route("/{noteId}", func(r chi.Router) {
						r.Put("/", appHandler.UpdateNote)
						r.Delete("/", appHandler.DeleteNote)
					})
				})
			})
		})

		// Blog post creation (assuming only authenticated users can post)
		r.Post("/blog", blogHandler.CreateBlogPost)
	})

	return r
}
