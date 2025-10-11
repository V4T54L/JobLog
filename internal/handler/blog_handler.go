package handler

import (
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/usecase"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"gopkg.in/russross/blackfriday.v2"
)

type BlogHandler struct {
	blogUseCase usecase.BlogUseCase
}

func NewBlogHandler(uc usecase.BlogUseCase) *BlogHandler {
	return &BlogHandler{blogUseCase: uc}
}

type createPostRequest struct {
	Title     string `json:"title"`
	ContentMD string `json:"content_md"`
	IsPublic  bool   `json:"is_public"`
}

type addCommentRequest struct {
	ContentMD       string `json:"content_md"`
	ParentCommentID *int64 `json:"parent_comment_id"`
}

type toggleLikeRequest struct {
	ContentType string `json:"content_type"`
	ContentID   int64  `json:"content_id"`
}

func (h *BlogHandler) CreatePost(c echo.Context) error {
	userID, ok := c.Get("userID").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "Invalid user ID in token"})
	}

	var req createPostRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid request body"})
	}

	// Sanitize HTML on the server
	html := blackfriday.Run([]byte(req.ContentMD))

	post, err := h.blogUseCase.CreatePost(userID, req.Title, req.ContentMD, string(html), req.IsPublic)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}

	return c.JSON(http.StatusCreated, post)
}

func (h *BlogHandler) GetPublicPost(c echo.Context) error {
	username := c.Param("username")
	slug := c.Param("slug")

	post, err := h.blogUseCase.GetPublicPost(username, slug)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}
	if post == nil {
		return c.JSON(http.StatusNotFound, echo.Map{"message": "Post not found"})
	}

	return c.JSON(http.StatusOK, post)
}

func (h *BlogHandler) GetPublicPosts(c echo.Context) error {
	posts, err := h.blogUseCase.GetPublicPosts()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}
	return c.JSON(http.StatusOK, posts)
}

func (h *BlogHandler) AddComment(c echo.Context) error {
	userID, ok := c.Get("userID").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "Invalid user ID in token"})
	}

	postID, err := strconv.ParseInt(c.Param("postID"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid post ID"})
	}

	var req addCommentRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid request body"})
	}

	html := blackfriday.Run([]byte(req.ContentMD))

	comment, err := h.blogUseCase.AddComment(postID, userID, req.ParentCommentID, req.ContentMD, string(html))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}

	// To return the username with the new comment
	username, ok := c.Get("username").(string)
	if ok {
		comment.Username.String = username
		comment.Username.Valid = true
	}

	return c.JSON(http.StatusCreated, comment)
}

func (h *BlogHandler) GetCommentsForPost(c echo.Context) error {
	postID, err := strconv.ParseInt(c.Param("postID"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid post ID"})
	}

	comments, err := h.blogUseCase.GetCommentsForPost(postID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}

	return c.JSON(http.StatusOK, comments)
}

func (h *BlogHandler) ToggleLike(c echo.Context) error {
	userID, ok := c.Get("userID").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, echo.Map{"message": "Invalid user ID in token"})
	}

	var req toggleLikeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid request body"})
	}

	contentType := domain.ContentType(req.ContentType)
	if contentType != domain.ContentTypePost && contentType != domain.ContentTypeComment {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid content type"})
	}

	isLiked, err := h.blogUseCase.ToggleLike(userID, contentType, req.ContentID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": err.Error()})
	}

	return c.JSON(http.StatusOK, echo.Map{"is_liked": isLiked})
}
