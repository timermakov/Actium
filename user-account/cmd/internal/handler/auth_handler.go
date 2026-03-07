package handler

import (
	"context"
	"encoding/json"
	"net/http"
)

type AuthProvider interface {
	Register(ctx context.Context, email, password, nickname string) error
	Login(ctx context.Context, email, password string) (string, error)
}

type AuthHandler struct {
	baseHandler
	authService AuthProvider
}

func NewAuthHandler(authService AuthProvider) *AuthHandler {
	return &AuthHandler{authService: authService}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		h.writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.authService.Register(r.Context(), req.Email, req.Password, req.Nickname); err != nil {
		h.writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	h.writeJSON(w, http.StatusCreated, map[string]string{
		"status":  "ok",
		"message": "User registered successfully",
	})
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		h.writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	token, err := h.authService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		h.writeError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{
		"token": token,
		"email": req.Email,
	})
}

func (h *AuthHandler) Logout(w http.ResponseWriter, _ *http.Request) {
	h.writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
