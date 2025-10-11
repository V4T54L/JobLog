package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"

	"github.com/labstack/echo/v4"
)

type AuthHandler struct {
	userUseCase usecase.UserUseCase
}

func NewAuthHandler(uc usecase.UserUseCase) *AuthHandler {
	return &AuthHandler{userUseCase: uc}
}

type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AuthHandler) Register(c echo.Context) error {
	var req RegisterRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"}) // Changed error message key
	}

	user, err := h.userUseCase.Register(req.Username, req.Email, req.Password)
	if err != nil {
		// Kept StatusConflict as it's more appropriate for user already exists
		return c.JSON(http.StatusConflict, map[string]string{"message": err.Error()}) // Changed error message key
	}

	// Don't send password back
	user.HashedPassword = ""

	return c.JSON(http.StatusCreated, user)
}

func (h *AuthHandler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"message": "Invalid request body"}) // Changed error message key
	}

	user, token, err := h.userUseCase.Login(req.Email, req.Password) // Updated return signature
	if err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{"message": err.Error()}) // Changed error message key and content
	}

	user.HashedPassword = "" // Added for consistency
	return c.JSON(http.StatusOK, map[string]interface{}{ // Updated return type to include user
		"token": token,
		"user":  user,
	})
}

