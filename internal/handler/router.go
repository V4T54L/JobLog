package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http" // Keep http import as it might be used elsewhere or for status codes
	"os"
	"path/filepath"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewRouter(userUC usecase.UserUseCase, appUC usecase.ApplicationUseCase) *echo.Echo {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	authHandler := NewAuthHandler(userUC)
	appHandler := NewApplicationHandler(appUC)

	apiGroup := e.Group("/api")
	{
		authGroup := apiGroup.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
		}

		appGroup := apiGroup.Group("/applications")
		appGroup.Use(AuthMiddleware)
		{
			appGroup.POST("", appHandler.CreateApplication)
			appGroup.GET("", appHandler.GetApplications)
			appGroup.GET("/:id", appHandler.GetApplicationByID)
			appGroup.PUT("/:id", appHandler.UpdateApplication)
			appGroup.DELETE("/:id", appHandler.DeleteApplication)
		}
	}

	// Serve SPA
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:   "client",
		HTML5:  true,
		Browse: false,
	}))

	return e
}

