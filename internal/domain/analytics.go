package domain

// StatusCount represents the count of applications for a specific status.
type StatusCount struct {
	Status string `json:"status" db:"status"`
	Count  int    `json:"count" db:"count"`
}

// ApplicationsOverTime represents the count of applications for a specific time period (e.g., month).
type ApplicationsOverTime struct {
	Date  string `json:"date" db:"date"` // e.g., "YYYY-MM"
	Count int    `json:"count" db:"count"`
}

// DashboardAnalytics aggregates all analytics data for the dashboard.
type DashboardAnalytics struct {
	ApplicationsByStatus []StatusCount          `json:"applicationsByStatus"`
	ApplicationsOverTime []ApplicationsOverTime `json:"applicationsOverTime"`
}

