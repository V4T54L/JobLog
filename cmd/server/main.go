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
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	runMigrations(databaseURL)

	db, err := sqlx.Connect("pgx", databaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer db.Close()

	// Repositories
	userRepo := postgres.NewPostgresUserRepository(db)
	companyRepo := postgres.NewPostgresCompanyRepository(db) // Kept original for CompanyRepository
	roleRepo := postgres.NewPostgresRoleRepository(db)
	appRepo := postgres.NewPostgresApplicationRepository(db) // Kept original for ApplicationRepository
	blogRepo := postgres.NewPostgresBlogPostRepository(db)
	commentRepo := postgres.NewPostgresCommentRepository(db)
	likeRepo := postgres.NewPostgresLikeRepository(db)

	// Use Cases
	userUC := usecase.NewUserService(userRepo)
	appUC := usecase.NewApplicationService(appRepo, companyRepo, roleRepo)
	blogUC := usecase.NewBlogService(blogRepo, commentRepo, likeRepo)

	// Router
	e := handler.NewRouter(userUC, appUC, blogUC)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := e.Start(":" + port); err != nil {
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
		if errors.Is(err, migrate.ErrNoChange) {
			log.Println("No new migrations to apply.")
		} else {
			log.Fatalf("Could not run migrations: %v", err)
		}
	} else {
		log.Println("Migrations applied successfully.")
	}
}
