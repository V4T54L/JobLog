package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
)

// spaHandler serves the single page application.
// It serves static files from the 'client' directory, and for any path that
// doesn't match a file, it serves the 'index.html' file. This is necessary
// for client-side routing to work correctly.
func spaHandler(staticPath, indexPath string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get the absolute path to the file
		path := filepath.Join(staticPath, r.URL.Path)

		// Check if the file exists
		_, err := os.Stat(path)
		if os.IsNotExist(err) {
			// File does not exist, serve index.html
			http.ServeFile(w, r, filepath.Join(staticPath, indexPath))
			return
		} else if err != nil {
			// If there was another error, return an internal server error
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Otherwise, serve the static file
		http.FileServer(http.Dir(staticPath)).ServeHTTP(w, r)
	}
}

func main() {
	// For now, we just serve the frontend SPA.
	// API routes will be added later.
	mux := http.NewServeMux()

	// Serve static files and handle SPA routing
	spa := spaHandler("client", "index.html")
	mux.Handle("/", spa)

	log.Println("Server starting on :8080...")
	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}

