package router

import (
	"net/http"
	"user-account/cmd/internal/handler"
	"user-account/cmd/internal/middleware"

	"github.com/gorilla/mux"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/cors"
)

// NewRouter возвращает настроенный роутер с хендлерами
func NewRouter(healthHandler *handler.HealthHandler, authHandler *handler.AuthHandler, userHandler *handler.UserHandler, jwtSecret string, allowedOrigins []string) http.Handler {
	r := mux.NewRouter()

	// Prometheus metrics endpoint (no metrics middleware - pure metrics)
	r.Handle("/metrics", promhttp.Handler())

	// API routes with metrics middleware
	api := r.PathPrefix("").Subrouter()
	api.Use(middleware.PrometheusMetrics)

	api.HandleFunc("/health", healthHandler.Health).Methods(http.MethodGet)

	api.HandleFunc("/register", authHandler.Register).Methods(http.MethodPost)
	api.HandleFunc("/login", authHandler.Login).Methods(http.MethodPost)
	api.HandleFunc("/logout", authHandler.Logout).Methods(http.MethodPost)

	jwtMiddleware := middleware.JWTAuth(jwtSecret)

	api.Handle("/users", jwtMiddleware(http.HandlerFunc(userHandler.List))).Methods(http.MethodGet)

	api.Handle("/users/{id}", jwtMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		idStr := vars["id"]
		userHandler.ServeUserByID(w, r, idStr)
	}))).Methods(http.MethodDelete, http.MethodPatch)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	return c.Handler(r)
}
