package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"user-account/cmd/internal/model"

	"github.com/google/uuid"
)

// UserProvider - интерфейс бизнес-логики
type UserProvider interface {
	Delete(ctx context.Context, id uuid.UUID) error
	UpdatePassword(ctx context.Context, id uuid.UUID, newPassword string) error
	List(ctx context.Context) ([]model.User, error)
}

// UserHandler - хендлер для ручек
type UserHandler struct {
	userService UserProvider
}

// NewUserHandler - конструктор
func NewUserHandler(userService UserProvider) *UserHandler {
	return &UserHandler{userService: userService}
}

func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request, id uuid.UUID) {
	if r.Method != http.MethodDelete {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	if err := h.userService.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UpdatePassword - ручка /users/{id}/password
func (h *UserHandler) UpdatePassword(w http.ResponseWriter, r *http.Request, id uuid.UUID) {
	if r.Method != http.MethodPatch {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		NewPassword string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := h.userService.UpdatePassword(r.Context(), id, req.NewPassword); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// List - ручка /users
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	users, err := h.userService.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	err = json.NewEncoder(w).Encode(users)
	if err != nil {
		return
	}
}

// ServeUserByID - метод-резолвер для ручек
func (h *UserHandler) ServeUserByID(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		http.Error(w, "invalid user ID", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodDelete:
		h.Delete(w, r, id)
	case http.MethodPatch:
		h.UpdatePassword(w, r, id)
	default:
		w.WriteHeader(http.StatusMethodNotAllowed)
	}
}
