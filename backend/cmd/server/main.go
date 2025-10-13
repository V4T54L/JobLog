package main

import (
	"log"
	"net/http"
	"time"

	"joblog/internal/api"
	"joblog/internal/api/handler"
	"joblog/internal/core/service"
	"joblog/internal/repository/postgres"
	"joblog/pkg/auth"
	"joblog/pkg/database"

	"github.com/joho/godotenv"
)

func main() {
	log.Println("Starting JobLog API server...")
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// |--- Dependency Injection ---

	dbpool, err := database.ConnectDB()
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
	}
	defer dbpool.Close()

	jwtSecret := "my-super-secret-and-long-key-for-hs256"
	jwtManager := auth.NewJWTManager(jwtSecret, 24*time.Hour)

	userRepo := postgres.NewUserRepository(dbpool)
	appRepo := postgres.NewApplicationRepository(dbpool)
	blogRepo := postgres.NewBlogRepository(dbpool)

	// userRepo := memory.NewUserRepository()
	// appRepo := memory.NewApplicationRepository()
	// blogRepo := memory.NewBlogRepository()

	authService := service.NewAuthService(userRepo, jwtManager)
	appService := service.NewApplicationService(appRepo)
	blogService := service.NewBlogService(blogRepo)

	authHandler := handler.NewAuthHandler(authService)
	appHandler := handler.NewApplicationHandler(appService)
	blogHandler := handler.NewBlogHandler(blogService)

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
