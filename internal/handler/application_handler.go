package handler

import (
	"job-app-tracker/internal/usecase"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type ApplicationHandler struct {
	appUseCase usecase.ApplicationUseCase
}

func NewApplicationHandler(uc usecase.ApplicationUseCase) *ApplicationHandler {
	return &ApplicationHandler{appUseCase: uc}
}

type createApplicationRequest struct {
	CompanyName string `json:"companyName"`
	RoleTitle   string `json:"roleTitle"`
	Status      string `json:"status"`
	DateApplied string `json:"dateApplied"` // YYYY-MM-DD
}

func (h *ApplicationHandler) CreateApplication(c echo.Context) error {
	userID := c.Get("userID").(int64)
	req := new(createApplicationRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid request body"})
	}

	app, err := h.appUseCase.CreateApplication(userID, req.CompanyName, req.RoleTitle, req.Status, req.DateApplied)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "Failed to create application", "error": err.Error()})
	}

	return c.JSON(http.StatusCreated, app)
}

func (h *ApplicationHandler) GetApplications(c echo.Context) error {
	userID := c.Get("userID").(int64)
	apps, err := h.appUseCase.GetApplications(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "Failed to get applications"})
	}
	return c.JSON(http.StatusOK, apps)
}

func (h *ApplicationHandler) GetApplicationByID(c echo.Context) error {
	userID := c.Get("userID").(int64)
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid application ID"})
	}

	app, err := h.appUseCase.GetApplicationByID(id, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "Failed to get application"})
	}
	if app == nil {
		return c.JSON(http.StatusNotFound, echo.Map{"message": "Application not found"})
	}

	return c.JSON(http.StatusOK, app)
}

func (h *ApplicationHandler) UpdateApplication(c echo.Context) error {
	userID := c.Get("userID").(int64)
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid application ID"})
	}

	req := new(createApplicationRequest)
	if err := c.Bind(req); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid request body"})
	}

	app, err := h.appUseCase.UpdateApplication(id, userID, req.CompanyName, req.RoleTitle, req.Status, req.DateApplied)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "Failed to update application"})
	}
	if app == nil {
		return c.JSON(http.StatusNotFound, echo.Map{"message": "Application not found"})
	}

	return c.JSON(http.StatusOK, app)
}

func (h *ApplicationHandler) DeleteApplication(c echo.Context) error {
	userID := c.Get("userID").(int64)
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"message": "Invalid application ID"})
	}

	if err := h.appUseCase.DeleteApplication(id, userID); err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"message": "Failed to delete application"})
	}

	return c.NoContent(http.StatusNoContent)
}

