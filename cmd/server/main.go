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
		log.Fatalf("Could not connect to the database: %v", err)
	}
	defer db.Close()

	// Repositories
	userRepo := postgres.NewPostgresUserRepository(db)
	companyRepo := postgres.NewPostgresCompanyRepository(db)
	roleRepo := postgres.NewPostgresRoleRepository(db)
	appRepo := postgres.NewPostgresApplicationRepository(db)
	blogRepo := postgres.NewPostgresBlogPostRepository(db)

	// Use Cases
	userUseCase := usecase.NewUserService(userRepo)
	appUseCase := usecase.NewApplicationService(appRepo, companyRepo, roleRepo)
	blogUseCase := usecase.NewBlogService(blogRepo)

	// Router
	e := handler.NewRouter(userUseCase, appUseCase, blogUseCase)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := e.Start(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func runMigrations(databaseURL string) {
	migrationsPath := "file://migrations"
	m, err := migrate.New(migrationsPath, databaseURL)
	if err != nil {
		log.Fatalf("Could not create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil {
		if err == migrate.ErrNoChange {
			log.Println("Database schema is up to date.")
		} else {
			log.Fatalf("Could not apply migrations: %v", err)
		}
	} else {
		log.Println("Database migrations applied successfully.")
	}

	// Check for migration errors that might not be caught by m.Up()
	srcErr, dbErr := m.Close()
	if srcErr != nil {
		log.Printf("Migration source error: %v", srcErr)
	}
	if dbErr != nil {
		log.Printf("Migration database error: %v", dbErr)
	}
}

