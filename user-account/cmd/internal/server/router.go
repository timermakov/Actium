package router

import (
	"net/http"
	"user-account/cmd/internal/handler"
	"user-account/cmd/internal/middleware"

	"github.com/gorilla/mux"
)

// NewRouter возвращает настроенный роутер с хендлерами
func NewRouter(healthHandler *handler.HealthHandler, authHandler *handler.AuthHandler, userHandler *handler.UserHandler, jwtSecret string) http.Handler {
	r := mux.NewRouter()

	jwtMiddleware := middleware.JWTAuth(jwtSecret)

	r.HandleFunc("/health", healthHandler.Health).Methods(http.MethodGet)

	r.HandleFunc("/register", authHandler.Register).Methods(http.MethodPost)
	r.HandleFunc("/login", authHandler.Login).Methods(http.MethodPost)

	r.Handle("/users", jwtMiddleware(http.HandlerFunc(userHandler.List))).Methods(http.MethodGet)

	r.Handle("/users/{id}", jwtMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idStr := vars["id"]
		userHandler.ServeUserByID(w, r, idStr)
	}))).Methods(http.MethodDelete, http.MethodPatch)

	return r
}
