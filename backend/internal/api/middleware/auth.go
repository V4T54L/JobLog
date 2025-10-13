
package middleware

import (
	"context"
	"net/http"
	"strings"

	"joblog/pkg/auth"
	"joblog/pkg/jsonutil"
)

func Authenticator(jwtManager *auth.JWTManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				jsonutil.RespondWithError(w, http.StatusUnauthorized, "Authorization header is required")
				return
			}

			headerParts := strings.Split(authHeader, " ")
			if len(headerParts) != 2 || strings.ToLower(headerParts[0]) != "bearer" {
				jsonutil.RespondWithError(w, http.StatusUnauthorized, "Invalid Authorization header format")
				return
			}

			tokenString := headerParts[1]
			claims, err := jwtManager.Verify(tokenString)
			if err != nil {
				jsonutil.RespondWithError(w, http.StatusUnauthorized, "Invalid or expired token")
				return
			}

			// Add user ID to context for downstream handlers
			ctx := context.WithValue(r.Context(), "userID", claims.UserID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
