package handler

import (
	"encoding/json"
	"net/http"
)

// baseHandler содержит общую логику для всех HTTP хендлеров
type baseHandler struct{}

// writeJSON отправляет успешный JSON ответ
func (h *baseHandler) writeJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}

// writeError отправляет ошибку в формате JSON
func (h *baseHandler) writeError(w http.ResponseWriter, message string, code int) {
	h.writeJSON(w, code, map[string]string{"error": message})
}
