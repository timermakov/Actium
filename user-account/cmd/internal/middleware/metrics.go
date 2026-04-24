package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// HTTPRequestsTotal counts total HTTP requests by method, path, and status
	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	// HTTPRequestDuration tracks HTTP request duration
	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path", "status"},
	)

	// HTTPRequestsInFlight tracks concurrent requests
	HTTPRequestsInFlight = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "http_requests_in_flight",
			Help: "Number of HTTP requests currently being served",
		},
	)

	// APIEndpointCalls tracks calls to specific API endpoints
	APIEndpointCalls = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "api_endpoint_calls_total",
			Help: "Total number of calls to specific API endpoints",
		},
		[]string{"endpoint", "method", "status"},
	)

	// APIAuthEvents tracks authentication events
	APIAuthEvents = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "api_auth_events_total",
			Help: "Total number of authentication events (login, register, logout)",
		},
		[]string{"event", "status"},
	)

	// APIUserOperations tracks user management operations
	APIUserOperations = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "api_user_operations_total",
			Help: "Total number of user management operations",
		},
		[]string{"operation", "status"},
	)
)

// endpointType returns a clean endpoint name for metrics
func endpointType(path string) string {
	switch path {
	case "/health":
		return "health"
	case "/register":
		return "register"
	case "/login":
		return "login"
	case "/logout":
		return "logout"
	case "/users":
		return "users_list"
	default:
		// Handle /users/{id} pattern
		if len(path) > 7 && path[:7] == "/users/" {
			return "user_by_id"
		}
		return "unknown"
	}
}

// RecordAPIEvent records authentication events
func RecordAPIEvent(event, status string) {
	APIAuthEvents.WithLabelValues(event, status).Inc()
}

// RecordUserOperation records user management operations
func RecordUserOperation(operation, status string) {
	APIUserOperations.WithLabelValues(operation, status).Inc()
}

// PrometheusMetrics is an HTTP middleware that collects Prometheus metrics
func PrometheusMetrics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		path := r.URL.Path
		method := r.Method

		HTTPRequestsInFlight.Inc()
		defer HTTPRequestsInFlight.Dec()

		// Wrap response writer to capture status code
		wrapped := &responseRecorder{ResponseWriter: w, statusCode: http.StatusOK}

		next.ServeHTTP(wrapped, r)

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(wrapped.statusCode)

		HTTPRequestsTotal.WithLabelValues(method, path, status).Inc()
		HTTPRequestDuration.WithLabelValues(method, path, status).Observe(duration)

		// Record endpoint-specific metrics
		endpoint := endpointType(path)
		APIEndpointCalls.WithLabelValues(endpoint, method, status).Inc()

		// Record business-specific events
		switch endpoint {
		case "register":
			if wrapped.statusCode == http.StatusCreated {
				RecordAPIEvent("register", "success")
			} else {
				RecordAPIEvent("register", "failure")
			}
		case "login":
			if wrapped.statusCode == http.StatusOK {
				RecordAPIEvent("login", "success")
			} else {
				RecordAPIEvent("login", "failure")
			}
		case "logout":
			RecordAPIEvent("logout", "success")
		case "users_list":
			if wrapped.statusCode == http.StatusOK {
				RecordUserOperation("list", "success")
			} else {
				RecordUserOperation("list", "failure")
			}
		case "user_by_id":
			if method == http.MethodDelete {
				if wrapped.statusCode == http.StatusOK {
					RecordUserOperation("delete", "success")
				} else {
					RecordUserOperation("delete", "failure")
				}
			} else if method == http.MethodPatch {
				if wrapped.statusCode == http.StatusOK {
					RecordUserOperation("update_password", "success")
				} else {
					RecordUserOperation("update_password", "failure")
				}
			}
		}
	})
}

// responseRecorder wraps http.ResponseWriter to capture the status code
type responseRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (rr *responseRecorder) WriteHeader(code int) {
	rr.statusCode = code
	rr.ResponseWriter.WriteHeader(code)
}
