
package handler

import (
	"encoding/json"
	"net/http"

	"joblog/internal/core/domain"
	"joblog/internal/core/service"
	"joblog/pkg/jsonutil"

	"github.com/go-chi/chi/v5"
)

type BlogHandler struct {
	blogService *service.BlogService
}

func NewBlogHandler(blogService *service.BlogService) *BlogHandler {
	return &BlogHandler{blogService: blogService}
}

func (h *BlogHandler) GetAllBlogPosts(w http.ResponseWriter, r *http.Request) {
	posts, err := h.blogService.GetAll(r.Context())
	if err != nil {
		jsonutil.RespondWithError(w, http.StatusInternalServerError, "Could not fetch blog posts")
		return
	}
	jsonutil.RespondWithJSON(w, http.StatusOK, posts)
}

func (h *BlogHandler) GetBlogPostBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	post, err := h.blogService.GetBySlug(r.Context(), slug)
	if err != nil {
		jsonutil.RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	jsonutil.RespondWithJSON(w, http.StatusOK, post)
}

func (h *BlogHandler) CreateBlogPost(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	var newPost domain.NewBlogPost
	if err := json.NewDecoder(r.Body).Decode(&newPost); err != nil {
		jsonutil.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	createdPost, err := h.blogService.Create(r.Context(), userID, newPost)
	if err != nil {
		jsonutil.RespondWithError(w, http.StatusInternalServerError, "Could not create blog post")
		return
	}

	jsonutil.RespondWithJSON(w, http.StatusCreated, createdPost)
}
