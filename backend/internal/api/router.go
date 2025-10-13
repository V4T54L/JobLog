package api

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"

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

	r.Use(chi_middleware.Logger)
	r.Use(chi_middleware.Recoverer)
	r.Use(chi_middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
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

		r.Group(func(r chi.Router) {
			r.Use(middleware.Authenticator(jwtManager))

			r.Get("/auth/me", authHandler.GetMyProfile)

			r.Route("/applications", func(r chi.Router) {
				r.Get("/", appHandler.GetAllApplications)
				r.Post("/", appHandler.CreateApplication)
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", appHandler.GetApplicationByID)
					r.Put("/", appHandler.UpdateApplication)
					r.Delete("/", appHandler.ArchiveApplication)

					r.Route("/notes", func(r chi.Router) {
						r.Post("/", appHandler.AddNote)
						r.Route("/{noteId}", func(r chi.Router) {
							r.Put("/", appHandler.UpdateNote)
							r.Delete("/", appHandler.DeleteNote)
						})
					})
				})
			})

			r.Post("/blog", blogHandler.CreateBlogPost)
		})
	})

	// |--- SPA / static file serving ---|
	// Directory where your built frontend lives
	webDir := "./web" // or absolute path if needed

	// First, serve static files (css/js) etc under / (but NOT /api)
	// Using http.FileServer with StripPrefix
	fs := http.FileServer(http.Dir(webDir))
	r.Handle("/*", spaHandler(webDir, fs))

	return r
}

// spaHandler returns an http.Handler that serves static files and
// falls back to index.html for non-file paths (so that client-side routes work).
func spaHandler(webDir string, staticHandler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// If path starts with /api, delegate (should not come here ideally)
		if strings.HasPrefix(r.URL.Path, "/api") {
			http.NotFound(w, r)
			return
		}

		// Compute the absolute path of the requested resource in webDir
		requestedPath := filepath.Join(webDir, filepath.Clean(r.URL.Path))
		// Check if that file exists and is not a directory
		fi, err := os.Stat(requestedPath)
		if err == nil && !fi.IsDir() {
			// Found a real file → serve it
			staticHandler.ServeHTTP(w, r)
			return
		}

		// Otherwise (no such file), serve index.html (so SPA router handles it)
		http.ServeFile(w, r, filepath.Join(webDir, "index.html"))
	})
}
