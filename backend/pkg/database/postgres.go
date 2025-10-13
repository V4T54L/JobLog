
package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ConnectDB creates and returns a new database connection pool.
// It reads the database connection string from the DATABASE_URL environment variable.
func ConnectDB() (*pgxpool.Pool, error) {
	connString := os.Getenv("DATABASE_URL")
	if connString == "" {
		return nil, fmt.Errorf("DATABASE_URL environment variable not set")
	}

	config, err := pgxpool.ParseConfig(connString)
	if err != nil {
		return nil, fmt.Errorf("failed to parse database config: %w", err)
	}

	// Configure the connection pool for production
	config.MaxConns = 10 // Max number of connections in the pool
	config.MinConns = 2  // Min number of connections to keep open
	config.MaxConnLifetime = time.Hour
	config.MaxConnIdleTime = 30 * time.Minute

	dbpool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Verify the connection
	if err = dbpool.Ping(context.Background()); err != nil {
		dbpool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connection pool established successfully.")
	return dbpool, nil
}
