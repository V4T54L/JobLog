package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

// NewRouter initializes and configures the main application router.
func NewRouter(userUC usecase.UserUseCase, appUC usecase.ApplicationUseCase, blogUC usecase.BlogUseCase, analyticsUC usecase.AnalyticsUseCase) *echo.Echo {
	e := echo.New()

	// Global Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(RateLimiterMiddleware) // Apply rate limiting to all requests

	// Serve static files for the frontend
	e.Static("/", "client")

	// API Handlers
	authHandler := NewAuthHandler(userUC)
	appHandler := NewApplicationHandler(appUC)
	blogHandler := NewBlogHandler(blogUC)
	userHandler := NewUserHandler(userUC)
	analyticsHandler := NewAnalyticsHandler(analyticsUC)

	// API Routes
	api := e.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
		}

		// Application routes (protected)
		apps := api.Group("/applications", AuthMiddleware)
		{
			apps.POST("", appHandler.CreateApplication)
			apps.GET("", appHandler.GetApplications)
			apps.GET("/:id", appHandler.GetApplicationByID)
			apps.PUT("/:id", appHandler.UpdateApplication)
			apps.DELETE("/:id", appHandler.DeleteApplication)
		}

		// Blog routes
		blog := api.Group("/blog")
		{
			blog.GET("/public", blogHandler.GetPublicPosts)
			blog.GET("/:username/:slug", blogHandler.GetPublicPost)
			blog.GET("/:postID/comments", blogHandler.GetCommentsForPost)

			// Protected blog routes
			blog.POST("", blogHandler.CreatePost, AuthMiddleware)
			blog.POST("/:postID/comments", blogHandler.AddComment, AuthMiddleware)
			blog.POST("/like", blogHandler.ToggleLike, AuthMiddleware)
		}

		// User routes
		users := api.Group("/users")
		{
			users.GET("/:username/profile", userHandler.GetProfile)
			users.POST("/:username/follow", userHandler.FollowUser, AuthMiddleware)
			users.DELETE("/:username/follow", userHandler.UnfollowUser, AuthMiddleware)
		}

		// Dashboard routes (protected)
		dashboard := api.Group("/dashboard", AuthMiddleware)
		{
			dashboard.GET("/analytics", analyticsHandler.GetDashboardAnalytics)
		}
	}

	// SPA Fallback: all other routes should serve the index.html
	e.GET("/*", func(c echo.Context) error {
		return c.File("client/index.html")
	})

	// Handle 404 for API routes specifically
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if he, ok := err.(*echo.HTTPError); ok {
			if he.Code == http.StatusNotFound {
				// If the path starts with /api, it's an API 404
				if len(c.Request().URL.Path) >= 4 && c.Request().URL.Path[:4] == "/api" {
					c.JSON(http.StatusNotFound, map[string]string{"message": "API endpoint not found"})
					return
				}
				// Otherwise, it's a frontend route, serve index.html
				c.File("client/index.html")
				return
			}
		}
		e.DefaultHTTPErrorHandler(err, c)
	}

	return e
}

