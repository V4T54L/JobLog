package handler

import (
	"net/http"

	"job-app-tracker/internal/usecase"
	"job-app-tracker/pkg/util"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
)

type UserHandler struct {
	userUseCase usecase.UserUseCase
}

func NewUserHandler(uc usecase.UserUseCase) *UserHandler {
	return &UserHandler{userUseCase: uc}
}

func (h *UserHandler) GetProfile(c echo.Context) error {
	username := c.Param("username")

	// Viewer ID is optional (for non-logged-in users)
	var viewerID int64
	userToken, ok := c.Get("user").(*jwt.Token)
	if ok {
		claims := userToken.Claims.(*util.Claims)
		viewerID = claims.UserID
	}

	profile, err := h.userUseCase.GetProfile(username, viewerID)
	if err != nil {
		// Handle "not found" specifically if the use case returns a sentinel error
		return c.JSON(http.StatusNotFound, map[string]string{"message": "User not found"})
	}

	return c.JSON(http.StatusOK, profile)
}

func (h *UserHandler) FollowUser(c echo.Context) error {
	followeeUsername := c.Param("username")
	followerID := c.Get("userID").(int64)

	if err := h.userUseCase.FollowUser(followerID, followeeUsername); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}

	return c.NoContent(http.StatusCreated)
}

func (h *UserHandler) UnfollowUser(c echo.Context) error {
	followeeUsername := c.Param("username")
	followerID := c.Get("userID").(int64)

	if err := h.userUseCase.UnfollowUser(followerID, followeeUsername); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"message": err.Error()})
	}

	return c.NoContent(http.StatusNoContent)
}
