package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"

	"github.com/labstack/echo/v4"
)

type AnalyticsHandler struct {
	analyticsUC usecase.AnalyticsUseCase
}

func NewAnalyticsHandler(uc usecase.AnalyticsUseCase) *AnalyticsHandler {
	return &AnalyticsHandler{analyticsUC: uc}
}

func (h *AnalyticsHandler) GetDashboardAnalytics(c echo.Context) error {
	userID, ok := c.Get("userID").(int64)
	if !ok {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid user ID in token"})
	}

	analytics, err := h.analyticsUC.GetDashboardAnalytics(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to fetch analytics data"})
	}

	return c.JSON(http.StatusOK, analytics)
}

