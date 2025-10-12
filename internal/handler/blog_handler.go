package handler

import (
	"job-app-tracker/internal/domain"
	"job-app-tracker/internal/usecase"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/russross/blackfriday/v2"
)

type BlogHandler struct {
	blogUseCase usecase.BlogUseCase
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
	ContentType domain.ContentType `json:"content_type"`
	ContentID   int64              `json:"content_id"`
}

func NewBlogHandler(uc usecase.BlogUseCase) *BlogHandler {
	return &BlogHandler{blogUseCase: uc}
}

func (h *BlogHandler) CreatePost(c echo.Context) error {
	userID := c.Get("userID").(int64)
	req := new(createPostRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	// Convert Markdown to HTML on the server
	html := blackfriday.Run([]byte(req.ContentMD))

	post, err := h.blogUseCase.CreatePost(userID, req.Title, req.ContentMD, string(html), req.IsPublic)
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
	page, _ := strconv.Atoi(c.QueryParam("page"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	params := domain.ListParams{
		Page:      page,
		Limit:     limit,
		SortBy:    c.QueryParam("sortBy"),
		SortOrder: c.QueryParam("sortOrder"),
		Search:    c.QueryParam("search"),
	}

	paginatedPosts, err := h.blogUseCase.GetPublicPosts(params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": "Failed to retrieve posts"})
	}
	return c.JSON(http.StatusOK, paginatedPosts)
}

func (h *BlogHandler) AddComment(c echo.Context) error {
	userID := c.Get("userID").(int64)
	username := c.Get("username").(string)
	postID, err := strconv.ParseInt(c.Param("postID"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid post ID"})
	}

	req := new(addCommentRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	html := blackfriday.Run([]byte(req.ContentMD))

	comment, err := h.blogUseCase.AddComment(postID, userID, req.ParentCommentID, req.ContentMD, string(html))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}

	comment.Username.String = username
	return c.JSON(http.StatusCreated, comment)
}

func (h *BlogHandler) GetCommentsForPost(c echo.Context) error {
	postID, err := strconv.ParseInt(c.Param("postID"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid post ID"})
	}

	comments, err := h.blogUseCase.GetCommentsForPost(postID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}

	return c.JSON(http.StatusOK, comments)
}

func (h *BlogHandler) ToggleLike(c echo.Context) error {
	userID := c.Get("userID").(int64)
	req := new(toggleLikeRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"})
	}

	if req.ContentType != domain.ContentTypePost && req.ContentType != domain.ContentTypeComment {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid content type"})
	}

	isLiked, err := h.blogUseCase.ToggleLike(userID, req.ContentType, req.ContentID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]bool{"isLiked": isLiked})
}
