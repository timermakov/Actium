package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
)

// Config - модель конфига
type Config struct {
	AppHost    string
	AppPort    string
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBUrl      string
	JWTSecret  string
}

// Load - прочитать из файла конфигурации
func Load() *Config {
	cfg := &Config{
		AppHost:    getEnv("APP_HOST"),
		AppPort:    getEnv("APP_PORT"),
		DBHost:     getEnv("DB_HOST"),
		DBPort:     getEnv("DB_PORT"),
		DBUser:     getEnv("DB_USER"),
		DBPassword: getEnv("DB_PASSWORD"),
		DBName:     getEnv("DB_NAME"),
		JWTSecret:  getEnv("JWT_SECRET"),
	}

	if errs := cfg.Validate(); len(errs) > 0 {
		panic(formatErrors(errs))
	}

	cfg.DBUrl = fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		cfg.DBUser,
		cfg.DBPassword,
		cfg.DBHost,
		cfg.DBPort,
		cfg.DBName,
	)

	return cfg
}

func (c *Config) Validate() []error {
	var errs []error

	if c.AppHost == "" {
		errs = append(errs, fmt.Errorf("APP_HOST is required"))
	}
	if c.AppPort == "" {
		errs = append(errs, fmt.Errorf("APP_PORT is required"))
	}
	if c.DBHost == "" {
		errs = append(errs, fmt.Errorf("DB_HOST is required"))
	}
	if c.DBPort == "" {
		errs = append(errs, fmt.Errorf("DB_PORT is required"))
	}
	if c.DBUser == "" {
		errs = append(errs, fmt.Errorf("DB_USER is required"))
	}
	if c.DBPassword == "" {
		errs = append(errs, fmt.Errorf("DB_PASSWORD is required"))
	}
	if c.DBName == "" {
		errs = append(errs, fmt.Errorf("DB_NAME is required"))
	}
	if c.JWTSecret == "" {
		errs = append(errs, fmt.Errorf("JWT_SECRET is required"))
	}

	if c.AppPort != "" {
		if _, err := strconv.Atoi(c.AppPort); err != nil {
			errs = append(errs, fmt.Errorf("APP_PORT must be a number"))
		}
	}

	if c.DBPort != "" {
		if _, err := strconv.Atoi(c.DBPort); err != nil {
			errs = append(errs, fmt.Errorf("DB_PORT must be a number"))
		}
	}

	return errs
}

func getEnv(key string) string {
	return strings.TrimSpace(os.Getenv(key))
}

func formatErrors(errs []error) string {
	var builder strings.Builder
	builder.WriteString("config validation failed:\n")
	for _, err := range errs {
		builder.WriteString(" - ")
		builder.WriteString(err.Error())
		builder.WriteString("\n")
	}
	return builder.String()
}
