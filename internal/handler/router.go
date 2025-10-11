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

	// Serve static files for the frontend
	e.Static("/", "client")

	// API routes
	apiGroup := e.Group("/api")

	// Handlers
	authHandler := NewAuthHandler(userUC)
	appHandler := NewApplicationHandler(appUC)
	blogHandler := NewBlogHandler(blogUC)

	// Auth routes
	authGroup := apiGroup.Group("/auth")
	authGroup.POST("/register", authHandler.Register)
	authGroup.POST("/login", authHandler.Login)

	// Application routes (protected)
	appGroup := apiGroup.Group("/applications", AuthMiddleware)
	appGroup.POST("", appHandler.CreateApplication)
	appGroup.GET("", appHandler.GetApplications)
	appGroup.GET("/:id", appHandler.GetApplicationByID)
	appGroup.PUT("/:id", appHandler.UpdateApplication)
	appGroup.DELETE("/:id", appHandler.DeleteApplication)

	// Blog routes
	blogGroup := apiGroup.Group("/blog")

	// Public blog routes
	blogGroup.GET("/posts", blogHandler.GetPublicPosts)
	blogGroup.GET("/posts/:username/:slug", blogHandler.GetPublicPost)
	blogGroup.GET("/posts/:postID/comments", blogHandler.GetCommentsForPost)

	// Authenticated blog routes
	blogAuthGroup := blogGroup.Group("", AuthMiddleware)
	blogAuthGroup.POST("/posts", blogHandler.CreatePost)
	blogAuthGroup.POST("/posts/:postID/comments", blogHandler.AddComment)
	blogAuthGroup.POST("/like", blogHandler.ToggleLike)

	// SPA fallback: for any route not matched by the API, serve index.html
	e.HTTPErrorHandler = func(err error, c echo.Context) {
		code := http.StatusInternalServerError
		if he, ok := err.(*echo.HTTPError); ok {
			code = he.Code
		}
		if code == http.StatusNotFound && c.Request().Method == http.MethodGet {
			// Check if it's not an API route
			if len(c.Path()) < 4 || c.Path()[:4] != "/api" {
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
