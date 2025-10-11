package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewRouter(userUC usecase.UserUseCase, appUC usecase.ApplicationUseCase, blogUC usecase.BlogUseCase) *echo.Echo {
	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	authHandler := NewAuthHandler(userUC)
	appHandler := NewApplicationHandler(appUC)
	blogHandler := NewBlogHandler(blogUC)

	// API routes
	apiGroup := e.Group("/api")
	{
		// Auth routes
		authGroup := apiGroup.Group("/auth")
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
		}

		// Application routes (protected)
		appGroup := apiGroup.Group("/applications")
		appGroup.Use(AuthMiddleware)
		{
			appGroup.POST("", appHandler.CreateApplication)
			appGroup.GET("", appHandler.GetApplications)
			appGroup.GET("/:id", appHandler.GetApplicationByID)
			appGroup.PUT("/:id", appHandler.UpdateApplication)
			appGroup.DELETE("/:id", appHandler.DeleteApplication)
		}

		// Blog Routes
		blogGroup := apiGroup.Group("/blog")
		{
			blogGroup.GET("", blogHandler.GetPublicPosts)
			blogGroup.GET("/:username/:slug", blogHandler.GetPublicPost)
			blogGroup.POST("", blogHandler.CreatePost, AuthMiddleware)
		}
	}

	// Serve static files for the frontend
	e.Static("/", "client")
	// For SPA, serve index.html for any route not handled by API or static files
	e.GET("/*", func(c echo.Context) error {
		return c.File("client/index.html")
	}, middleware.Rewrite(map[string]string{
		"/api/*": "$1", // Don't rewrite API calls
	}))
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if he, ok := err.(*echo.HTTPError); ok {
			if he.Code == http.StatusNotFound && he.Message == "Not Found" {
				if err := c.File("client/index.html"); err != nil {
					c.Logger().Error(err)
				}
				return
			}
		}
		e.DefaultHTTPErrorHandler(err, c)
	}

	return e
}

