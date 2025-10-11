package main

import (
	"database/sql"
	"errors"
	"fmt"
	"job-app-tracker/internal/handler"
	"job-app-tracker/internal/repository/postgres"
	"job-app-tracker/internal/usecase"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq" // Changed from pgx/v5/stdlib to lib/pq
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, using environment variables")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	runMigrations(databaseURL)

	db, err := sqlx.Connect("postgres", databaseURL) // Changed from "pgx" to "postgres"
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer db.Close()

	// Repositories
	userRepo := postgres.NewPostgresUserRepository(db)
	companyRepo := postgres.NewPostgresCompanyRepository(db)
	roleRepo := postgres.NewPostgresRoleRepository(db)
	appRepo := postgres.NewPostgresApplicationRepository(db) // Kept original name for ApplicationRepository
	blogRepo := postgres.NewPostgresBlogPostRepository(db)
	commentRepo := postgres.NewPostgresCommentRepository(db)
	likeRepo := postgres.NewPostgresLikeRepository(db)
	followRepo := postgres.NewPostgresFollowRepository(db) // Added from attempted

	// Use Cases
	userUC := usecase.NewUserService(userRepo, blogRepo, followRepo) // Updated dependencies
	appUC := usecase.NewApplicationService(appRepo, companyRepo, roleRepo)
	blogUC := usecase.NewBlogService(blogRepo, commentRepo, likeRepo)

	// Router
	router := handler.NewRouter(userUC, appUC, blogUC) // Changed variable name to router

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := router.Start(":" + port); err != nil { // Changed variable name to router
		log.Fatalf("Failed to start server: %v", err)
	}
}

func runMigrations(databaseURL string) {
	if databaseURL == "" {
		log.Fatal("Cannot run migrations: DATABASE_URL is not set")
	}

	// The pgx driver used by sqlx uses a different DSN format than what migrate expects.
	// We need to ensure the DSN is in the format: postgresql://user:password@host:port/dbname?sslmode=disable
	// The connection string for pgx is usually in this format already.
	m, err := migrate.New("file://migrations", databaseURL)
	if err != nil {
		log.Fatalf("Could not create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil {
		if errors.Is(err, migrate.ErrNoChange) { // Kept errors.Is for robustness
			log.Println("No new migrations to apply.")
		} else {
			log.Fatalf("Could not run migrations: %v", err)
		}
	} else {
		log.Println("Migrations applied successfully.")
	}
}

