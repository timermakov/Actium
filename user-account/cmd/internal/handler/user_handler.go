package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"user-account/cmd/internal/model"

	"github.com/google/uuid"
)

type UserProvider interface {
	Delete(ctx context.Context, id uuid.UUID) error
	UpdatePassword(ctx context.Context, id uuid.UUID, newPassword string) error
	List(ctx context.Context) ([]model.User, error)
}

type UserHandler struct {
	baseHandler
	userService UserProvider
}

func NewUserHandler(userService UserProvider) *UserHandler {
	return &UserHandler{userService: userService}
}

// List - GET /users
func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	users, err := h.userService.List(r.Context())
	if err != nil {
		h.writeError(w, "failed to fetch users", http.StatusInternalServerError)
		return
	}

	type userResponse struct {
		ID        uuid.UUID `json:"id"`
		Email     string    `json:"email"`
		Nickname  string    `json:"nickname"`
		Role      string    `json:"role"`
		CreatedAt string    `json:"created_at"`
	}

	resp := make([]userResponse, len(users))
	for i, u := range users {
		resp[i] = userResponse{
			ID:        u.ID,
			Email:     u.Email,
			Nickname:  u.Nickname,
			Role:      u.Role,
			CreatedAt: u.CreatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	h.writeJSON(w, http.StatusOK, resp)
}

// Delete - DELETE /users/{id}
func (h *UserHandler) Delete(w http.ResponseWriter, r *http.Request, id uuid.UUID) {
	if err := h.userService.Delete(r.Context(), id); err != nil {
		h.writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// UpdatePassword - PATCH /users/{id}
func (h *UserHandler) UpdatePassword(w http.ResponseWriter, r *http.Request, id uuid.UUID) {
	var req UpdatePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if err := req.Validate(); err != nil {
		h.writeError(w, err.Error(), http.StatusBadRequest)
		return
	}

	if err := h.userService.UpdatePassword(r.Context(), id, req.NewPassword); err != nil {
		h.writeError(w, err.Error(), http.StatusInternalServerError)
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{"status": "password updated"})
}

// ServeUserByID - роутинг для /users/{id}
func (h *UserHandler) ServeUserByID(w http.ResponseWriter, r *http.Request, idStr string) {
	id, err := uuid.Parse(idStr)
	if err != nil {
		h.writeError(w, "invalid user ID format", http.StatusBadRequest)
		return
	}

	switch r.Method {
	case http.MethodDelete:
		h.Delete(w, r, id)
	case http.MethodPatch:
		h.UpdatePassword(w, r, id)
	default:
		h.writeError(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}
