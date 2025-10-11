package main

import (
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
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
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

	db, err := sqlx.Connect("postgres", databaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer db.Close()

	// Repositories
	userRepo := postgres.NewPostgresUserRepository(db)
	companyRepo := postgres.NewPostgresCompanyRepository(db) // Corrected from ApplicationRepository
	roleRepo := postgres.NewPostgresRoleRepository(db)
	appRepo := postgres.NewPostgresApplicationRepository(db) // Corrected from AppRepository

	// Use Cases
	userUseCase := usecase.NewUserService(userRepo)
	appUseCase := usecase.NewApplicationService(appRepo, companyRepo, roleRepo)

	// Router
	router := handler.NewRouter(userUseCase, appUseCase)

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
	migrationsPath := "file://migrations"
	m, err := migrate.New(migrationsPath, databaseURL)
	if err != nil {
		log.Fatalf("Failed to create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Failed to run migrations: %v", err)
	} else if err == migrate.ErrNoChange {
		log.Println("No new migrations to apply.")
	} else {
		log.Println("Migrations applied successfully.")
	}
}

