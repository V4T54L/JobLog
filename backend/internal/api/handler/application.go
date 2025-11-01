package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"joblog/internal/core/domain"
	"joblog/internal/core/service"
	"joblog/pkg/jsonutil"

	"github.com/go-chi/chi/v5"
)

type ApplicationHandler struct {
	appService *service.ApplicationService
}

func NewApplicationHandler(appService *service.ApplicationService) *ApplicationHandler {
	return &ApplicationHandler{appService: appService}
}

func (h *ApplicationHandler) GetAllApplications(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	apps, err := h.appService.GetAllByUserID(r.Context(), userID)
	if err != nil {
		log.Println("[AppHandler.GetAllApplications] Error:", err)
		jsonutil.RespondWithError(w, http.StatusInternalServerError, "Could not fetch applications")
		return
	}
	jsonutil.RespondWithJSON(w, http.StatusOK, apps)
}

func (h *ApplicationHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	var newApp domain.NewApplication
	if err := json.NewDecoder(r.Body).Decode(&newApp); err != nil {
		jsonutil.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	createdApp, err := h.appService.Create(r.Context(), userID, newApp)
	if err != nil {
		log.Println("[AppHandler.CreateApplication] Error:", err)
		jsonutil.RespondWithError(w, http.StatusInternalServerError, "Could not create application")
		return
	}

	jsonutil.RespondWithJSON(w, http.StatusCreated, createdApp)
}

func (h *ApplicationHandler) GetApplicationByID(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	appID := chi.URLParam(r, "id")

	app, err := h.appService.GetByID(r.Context(), userID, appID)
	if err != nil {
		log.Println("[AppHandler.GetApplicationByID] Error:", err)
		jsonutil.RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	jsonutil.RespondWithJSON(w, http.StatusOK, app)
}

func (h *ApplicationHandler) UpdateApplication(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	appID := chi.URLParam(r, "id")

	var updateData domain.ApplicationUpdate
	if err := json.NewDecoder(r.Body).Decode(&updateData); err != nil {
		log.Println("[AppHandler.UpdateApplicationByID] Error:", err)
		jsonutil.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	updatedApp, err := h.appService.Update(r.Context(), userID, appID, updateData)
	if err != nil {
		jsonutil.RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	jsonutil.RespondWithJSON(w, http.StatusOK, updatedApp)
}

func (h *ApplicationHandler) ArchiveApplication(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	appID := chi.URLParam(r, "id")

	err := h.appService.Archive(r.Context(), userID, appID)
	if err != nil {
		log.Println("[AppHandler.ArchieveApplicationByID] Error:", err)
		jsonutil.RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *ApplicationHandler) AddNote(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	appID := chi.URLParam(r, "id")

	var noteContent struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&noteContent); err != nil {
		log.Println("[AppHandler.AddNote] Error:", err)
		jsonutil.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	note, err := h.appService.AddNote(r.Context(), userID, appID, noteContent.Content)
	if err != nil {
		jsonutil.RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	jsonutil.RespondWithJSON(w, http.StatusCreated, note)
}

func (h *ApplicationHandler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	appID := chi.URLParam(r, "id")
	noteID := chi.URLParam(r, "noteId")

	var noteContent struct {
		Content string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&noteContent); err != nil {
		log.Println("[AppHandler.UpdateNote] Error:", err)
		jsonutil.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	note, err := h.appService.UpdateNote(r.Context(), userID, appID, noteID, noteContent.Content)
	if err != nil {
		jsonutil.RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	jsonutil.RespondWithJSON(w, http.StatusOK, note)
}

func (h *ApplicationHandler) DeleteNote(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value("userID").(string)
	appID := chi.URLParam(r, "id")
	noteID := chi.URLParam(r, "noteId")

	if err := h.appService.DeleteNote(r.Context(), userID, appID, noteID); err != nil {
		log.Println("[AppHandler.DeleteNote] Error:", err)
		jsonutil.RespondWithError(w, http.StatusNotFound, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
