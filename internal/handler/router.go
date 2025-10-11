package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"
	"strings" // Added from attempted

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewRouter(userUC usecase.UserUseCase, appUC usecase.ApplicationUseCase, blogUC usecase.BlogUseCase) *echo.Echo {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Serve static files for the frontend
	e.Static("/", "client")

	// API routes
	api := e.Group("/api") // Changed variable name to api

	// Handlers
	authHandler := NewAuthHandler(userUC)
	appHandler := NewApplicationHandler(appUC)
	blogHandler := NewBlogHandler(blogUC)
	userHandler := NewUserHandler(userUC) // Added from attempted

	// Auth routes
	authGroup := api.Group("/auth")
	authGroup.POST("/register", authHandler.Register)
	authGroup.POST("/login", authHandler.Login)

	// User routes (Added from attempted)
	userGroup := api.Group("/users")
	userGroup.GET("/:username/profile", userHandler.GetProfile, AuthMiddleware) // Auth is optional here, handled in handler
	userGroup.POST("/:username/follow", userHandler.FollowUser, AuthMiddleware)
	userGroup.DELETE("/:username/follow", userHandler.UnfollowUser, AuthMiddleware)

	// Application routes (protected)
	appGroup := api.Group("/applications", AuthMiddleware)
	appGroup.POST("", appHandler.CreateApplication)
	appGroup.GET("", appHandler.GetApplications)
	appGroup.GET("/:id", appHandler.GetApplicationByID)
	appGroup.PUT("/:id", appHandler.UpdateApplication)
	appGroup.DELETE("/:id", appHandler.DeleteApplication)

	// Blog routes
	blogGroup := api.Group("/blog")
	blogPostsGroup := blogGroup.Group("/posts") // Refactored blog routes

	// Public blog routes
	blogPostsGroup.GET("", blogHandler.GetPublicPosts)
	blogPostsGroup.GET("/:username/:slug", blogHandler.GetPublicPost)
	blogPostsGroup.GET("/:postID/comments", blogHandler.GetCommentsForPost)

	// Authenticated blog routes
	blogPostsGroup.POST("", blogHandler.CreatePost, AuthMiddleware)           // Added AuthMiddleware
	blogPostsGroup.POST("/:postID/comments", blogHandler.AddComment, AuthMiddleware) // Added AuthMiddleware
	blogGroup.POST("/like", blogHandler.ToggleLike, AuthMiddleware)           // Added AuthMiddleware

	// SPA Fallback - This should be the last route (Adopted attempted's cleaner approach)
	e.GET("/*", func(c echo.Context) error {
		// Don't fallback for API routes
		if strings.HasPrefix(c.Request().URL.Path, "/api/") {
			return echo.NewHTTPError(http.StatusNotFound, "API route not found")
		}
		return c.File("client/index.html")
	})

	return e
}

