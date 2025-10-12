package main

import (
	"log"
	"os"

	"job-app-tracker/internal/handler"
	"job-app-tracker/internal/repository/postgres"
	"job-app-tracker/internal/usecase"

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

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL is not set")
	}

	// Run migrations
	// runMigrations(dbURL)

	// Database connection
	db, err := sqlx.Connect("postgres", dbURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v\n", err)
	}
	defer db.Close()

	// Repositories
	userRepo := postgres.NewPostgresUserRepository(db)
	companyRepo := postgres.NewPostgresCompanyRepository(db)
	roleRepo := postgres.NewPostgresRoleRepository(db)
	appRepo := postgres.NewPostgresAppRepository(db)
	blogRepo := postgres.NewPostgresBlogPostRepository(db)
	commentRepo := postgres.NewPostgresCommentRepository(db)
	likeRepo := postgres.NewPostgresLikeRepository(db)
	followRepo := postgres.NewPostgresFollowRepository(db)
	analyticsRepo := postgres.NewPostgresAnalyticsRepository(db)

	// Use Cases
	userUC := usecase.NewUserService(userRepo, blogRepo, followRepo)
	appUC := usecase.NewApplicationService(appRepo, companyRepo, roleRepo)
	blogUC := usecase.NewBlogService(blogRepo, commentRepo, likeRepo)
	analyticsUC := usecase.NewAnalyticsService(analyticsRepo)

	// Router
	e := handler.NewRouter(userUC, appUC, blogUC, analyticsUC)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	e.Logger.Fatal(e.Start(":" + port))
}

// func runMigrations(databaseURL string) {
// 	if databaseURL == "" {
// 		log.Fatal("Cannot run migrations: DATABASE_URL is not set")
// 	}

// 	sourceURL := "file://migrations"
// 	m, err := migrate.New(sourceURL, databaseURL)
// 	if err != nil {
// 		log.Fatalf("Migration initialization failed: %v", err)
// 	}

// 	if err := m.Up(); err != nil {
// 		if errors.Is(err, migrate.ErrNoChange) {
// 			log.Println("No new migrations to apply.")
// 		} else {
// 			log.Fatalf("Could not run migrations: %v", err)
// 		}
// 	} else {
// 		log.Println("Database migrated successfully.")
// 	}

// 	srcErr, dbErr := m.Close()
// 	if srcErr != nil {
// 		log.Printf("Error closing migration source: %v", srcErr)
// 	}
// 	if dbErr != nil {
// 		if dbErr != sql.ErrConnDone {
// 			log.Printf("Error closing migration database connection: %v", dbErr)
// 		}
// 	}
// }
