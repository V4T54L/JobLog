package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func spaHandler(staticPath, indexPath string) echo.HandlerFunc {
	return func(c echo.Context) error {
		p := c.Request().URL.Path
		// Try to serve a static file
		fsPath := filepath.Join(staticPath, p)
		if _, err := os.Stat(fsPath); err == nil {
			return c.File(fsPath)
		}
		// Fallback to index.html for SPA routing
		return c.File(filepath.Join(staticPath, indexPath))
	}
}

func NewRouter(userUC usecase.UserUseCase) *echo.Echo {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// API routes
	apiGroup := e.Group("/api")
	{
		authHandler := NewAuthHandler(userUC)
		authGroup := apiGroup.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
		}

		// Example of a protected route
		apiGroup.GET("/protected", func(c echo.Context) error {
			userID := c.Get("userID").(int64)
			return c.JSON(http.StatusOK, map[string]interface{}{"message": "Welcome!", "user_id": userID})
		}, AuthMiddleware)
	}

	// Serve SPA
	e.GET("/*", spaHandler("client", "index.html"))

	return e
}

