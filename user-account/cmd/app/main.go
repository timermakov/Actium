package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"time"
	"user-account/cmd/internal/config"
	"user-account/cmd/internal/handler"
	"user-account/cmd/internal/repository"
	router "user-account/cmd/internal/server"
	"user-account/cmd/internal/service"

	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	cfg := config.Load()

	dbPool, err := pgxpool.New(context.Background(), cfg.DBUrl)
	if err != nil {
		log.Fatalf("failed to connect to db: %v", err)
	}
	defer dbPool.Close()

	userRepo := repository.NewPostgresUserRepository(dbPool)

	authService := service.NewAuthService(userRepo, cfg.JWTSecret)
	userService := service.NewUserService(userRepo)

	healthHandler := handler.NewHealthHandler()
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)

	mux := router.NewRouter(
		healthHandler,
		authHandler,
		userHandler,
		cfg.JWTSecret,
	)

	addr := fmt.Sprintf("%s:%s", cfg.AppHost, cfg.AppPort)
	srv := &http.Server{
		Addr:         addr,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	log.Printf("Server running at %s", addr)
	if err = srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatalf("Server failed: %v", err)
	}
}
