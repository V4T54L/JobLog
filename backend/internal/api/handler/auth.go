package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"joblog/internal/core/domain"
	"joblog/internal/core/service"
	"joblog/pkg/jsonutil"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var regDetails domain.UserRegistration
	if err := json.NewDecoder(r.Body).Decode(&regDetails); err != nil {
		jsonutil.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	user, err := h.authService.Register(r.Context(), regDetails)
	if err != nil {
		log.Println("[AuthH.Register] Error:", err)
		jsonutil.RespondWithError(w, http.StatusBadRequest, err.Error())
		return
	}

	jsonutil.RespondWithJSON(w, http.StatusCreated, user)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var loginDetails domain.UserLogin
	if err := json.NewDecoder(r.Body).Decode(&loginDetails); err != nil {
		jsonutil.RespondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	authResponse, err := h.authService.Login(r.Context(), loginDetails)
	if err != nil {
		log.Println("[AuthH.Login] Error:", err)
		jsonutil.RespondWithError(w, http.StatusUnauthorized, err.Error())
		return
	}

	jsonutil.RespondWithJSON(w, http.StatusOK, authResponse)
}

func (h *AuthHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		jsonutil.RespondWithError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	user, err := h.authService.GetUserProfile(r.Context(), userID)
	if err != nil {
		log.Println("[AuthH.GetProfile] Error:", err)
		jsonutil.RespondWithError(w, http.StatusNotFound, "User not found")
		return
	}

	jsonutil.RespondWithJSON(w, http.StatusOK, user)
}
