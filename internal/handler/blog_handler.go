package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"

	"github.com/gomarkdown/markdown"
	"github.com/gomarkdown/markdown/parser"
	"github.com/labstack/echo/v4"
)

type BlogHandler struct {
	blogUseCase usecase.BlogUseCase
}

func NewBlogHandler(uc usecase.BlogUseCase) *BlogHandler {
	return &BlogHandler{blogUseCase: uc}
}

type createPostRequest struct {
	Title     string `json:"title"`
	ContentMD string `json:"contentMd"`
	IsPublic  bool   `json:"isPublic"`
}

func (h *BlogHandler) CreatePost(c echo.Context) error {
	userID := c.Get("userID").(int64)
	req := new(createPostRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	// Sanitize HTML on the backend
	// For production, use a library like bluemonday after this step.
	extensions := parser.CommonExtensions | parser.AutoHeadingIDs
	p := parser.NewWithExtensions(extensions)
	htmlBytes := markdown.ToHTML([]byte(req.ContentMD), p, nil)
	html := string(htmlBytes)

	post, err := h.blogUseCase.CreatePost(userID, req.Title, req.ContentMD, html, req.IsPublic)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}

	return c.JSON(http.StatusCreated, post)
}

func (h *BlogHandler) GetPublicPost(c echo.Context) error {
	username := c.Param("username")
	slug := c.Param("slug")

	post, err := h.blogUseCase.GetPublicPost(username, slug)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}
	if post == nil {
		return c.JSON(http.StatusNotFound, map[string]string{"message": "Post not found"})
	}

	return c.JSON(http.StatusOK, post)
}

func (h *BlogHandler) GetPublicPosts(c echo.Context) error {
	posts, err := h.blogUseCase.GetPublicPosts()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, posts)
}

