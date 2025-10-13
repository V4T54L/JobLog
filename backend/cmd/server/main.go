
package main

import (
	"log"
	"net/http"
	"time"

	"joblog/internal/api"
	"joblog/internal/api/handler"
	"joblog/internal/core/service"
	"joblog/internal/repository/memory"
	"joblog/pkg/auth"
)

func main() {
	log.Println("Starting JobLog API server...")

	// |--- Dependency Injection ---

	// 1. JWT Helper
	// In production, this secret should be loaded from a secure source (e.g., environment variables).
	jwtSecret := "my-super-secret-and-long-key-for-hs256"
	jwtManager := auth.NewJWTManager(jwtSecret, 24*time.Hour)

	// 2. Repositories (In-Memory)
	userRepo := memory.NewUserRepository()
	appRepo := memory.NewApplicationRepository()
	blogRepo := memory.NewBlogRepository()

	// 3. Services
	authService := service.NewAuthService(userRepo, jwtManager)
	appService := service.NewApplicationService(appRepo)
	blogService := service.NewBlogService(blogRepo)

	// 4. Handlers
	authHandler := handler.NewAuthHandler(authService)
	appHandler := handler.NewApplicationHandler(appService)
	blogHandler := handler.NewBlogHandler(blogService)

	// 5. Router
	router := api.NewRouter(authHandler, appHandler, blogHandler, jwtManager)

	// |--- Server Configuration ---
	server := &http.Server{
		Addr:         ":8080",
		Handler:      router,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	log.Println("Server listening on http://localhost:8080")
	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Could not start server: %v\n", err)
	}
}
