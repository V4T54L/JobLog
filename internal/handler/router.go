package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewRouter(userUC usecase.UserUseCase, appUC usecase.ApplicationUseCase, blogUC usecase.BlogUseCase, analyticsUC usecase.AnalyticsUseCase) *echo.Echo {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Serve static files for the frontend
	e.Static("/", "client")

	// Handlers
	authHandler := NewAuthHandler(userUC)
	appHandler := NewApplicationHandler(appUC)
	blogHandler := NewBlogHandler(blogUC)
	userHandler := NewUserHandler(userUC)
	analyticsHandler := NewAnalyticsHandler(analyticsUC)

	// API Routes
	api := e.Group("/api")

	// Auth routes
	authAPI := api.Group("/auth")
	authAPI.POST("/register", authHandler.Register)
authAPI.POST("/login", authHandler.Login)

	// Application routes (protected)
	appAPI := api.Group("/applications", AuthMiddleware)
	appAPI.POST("", appHandler.CreateApplication)
	appAPI.GET("", appHandler.GetApplications)
	appAPI.GET("/:id", appHandler.GetApplicationByID)
	appAPI.PUT("/:id", appHandler.UpdateApplication)
	appAPI.DELETE("/:id", appHandler.DeleteApplication)

	// Blog routes
	blogAPI := api.Group("/blog")
	blogAPI.GET("", blogHandler.GetPublicPosts) // Public list of posts
	blogAPI.GET("/:username/:slug", blogHandler.GetPublicPost)
	blogAPI.GET("/:postID/comments", blogHandler.GetCommentsForPost)
	// Protected blog routes
	blogAPI.POST("", blogHandler.CreatePost, AuthMiddleware)
	blogAPI.POST("/:postID/comments", blogHandler.AddComment, AuthMiddleware)
	blogAPI.POST("/toggle-like", blogHandler.ToggleLike, AuthMiddleware)

	// User/Profile routes
	userAPI := api.Group("/users")
	userAPI.GET("/:username/profile", userHandler.GetProfile)
	// Protected user routes
	userAPI.POST("/:username/follow", userHandler.FollowUser, AuthMiddleware)
	userAPI.DELETE("/:username/follow", userHandler.UnfollowUser, AuthMiddleware)

	// Dashboard Routes (Protected)
	dashboardAPI := api.Group("/dashboard", AuthMiddleware)
	dashboardAPI.GET("/analytics", analyticsHandler.GetDashboardAnalytics)

	// This is a more robust way to handle SPA fallback.
	// It ensures that if a file exists (like main.js), it's served.
	// If not, it serves index.html.
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:   "client",
		HTML5:  true,
		Browse: false,
		// Ignore API routes from being handled by static middleware
		Skipper: func(c echo.Context) bool {
			return len(c.Path()) > 4 && c.Path()[:4] == "/api"
		},
	}))

	// Final fallback for any route that didn't match static files or API
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		if he, ok := err.(*echo.HTTPError); ok {
			if he.Code == http.StatusNotFound {
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

