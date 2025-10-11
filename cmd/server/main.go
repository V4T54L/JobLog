package main

import (
	"database/sql"
	"fmt"
	"job-app-tracker/internal/handler"
	"job-app-tracker/internal/repository/postgres"
	"job-app-tracker/internal/usecase"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jmoiron/sqlx"
	_ "github.com/joho/godotenv/autoload" // Load .env file automatically
	_ "github.com/lib/pq"
)

func main() {
	// --- Database Connection ---
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://user:password@localhost:5432/job_tracker_db?sslmode=disable"
	}

	// Run Migrations
	runMigrations(dbURL)

	// Connect to DB with sqlx
	db, err := sqlx.Connect("postgres", dbURL)
	if err != nil {
		log.Fatalf("Could not connect to the database: %v", err)
	}
	defer db.Close()

	// --- Dependency Injection ---
	userRepo := postgres.NewPostgresUserRepository(db)
	userUseCase := usecase.NewUserService(userRepo)

	// --- Router Setup ---
	router := handler.NewRouter(userUseCase)

	// --- Start Server ---
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s", port)
	if err := router.Start(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func runMigrations(databaseURL string) {
	migrationPath := "file://migrations"
	m, err := migrate.New(migrationPath, databaseURL)
	if err != nil {
		log.Fatalf("Could not create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Could not apply migrations: %v", err)
	}

	fmt.Println("Migrations applied successfully")
}

