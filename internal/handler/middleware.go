package handler

import (
	"errors"
	"job-app-tracker/internal/domain"
	"job-app-tracker/pkg/util"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/time/rate"
)

// AuthMiddleware validates the JWT token from the Authorization header.
// If the token is valid, it extracts user information and sets it in the context.
func AuthMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Missing authorization header"})
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid authorization header format"})
		}

		tokenStr := parts[1]
		claims, err := util.ValidateJWT(tokenStr)
		if err != nil {
			return c.JSON(http.StatusUnauthorized, map[string]string{"message": "Invalid or expired token"})
		}

		c.Set("userID", claims.UserID)
		c.Set("username", claims.Username)

		return next(c)
	}
}

// --- Rate Limiting ---

// client represents a user for rate limiting purposes.
type client struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

var (
	clients = make(map[string]*client)
	mu      sync.Mutex
)

// getVisitor retrieves or creates a rate limiter for a given IP address.
func getVisitor(ip string) *rate.Limiter {
	mu.Lock()
	defer mu.Unlock()

	c, exists := clients[ip]
	if !exists {
		// Allow 5 requests per second with a burst of 10.
		limiter := rate.NewLimiter(5, 10)
		clients[ip] = &client{limiter: limiter, lastSeen: time.Now()}
		return limiter
	}

	c.lastSeen = time.Now()
	return c.limiter
}

// init starts a background goroutine to clean up old, inactive clients
// from the rate limiter map to prevent memory leaks.
func init() {
	go func() {
		for {
			time.Sleep(time.Minute)
			mu.Lock()
			for ip, c := range clients {
				if time.Since(c.lastSeen) > 3*time.Minute {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()
}

// RateLimiterMiddleware applies rate limiting to incoming requests based on IP address.
func RateLimiterMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ip := c.RealIP()
		limiter := getVisitor(ip)
		if !limiter.Allow() {
			return c.JSON(http.StatusTooManyRequests, map[string]string{"message": "Too many requests"})
		}
		return next(c)
	}
}

