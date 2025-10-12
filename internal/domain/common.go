package domain

// ListParams holds parameters for filtering, sorting, and pagination.
type ListParams struct {
	Page      int
	Limit     int
	SortBy    string
	SortOrder string
	Search    string
	Filters   map[string]string
}

// Pagination holds metadata for paginated results.
type Pagination struct {
	TotalItems  int64 `json:"total_items"`
	TotalPages  int   `json:"total_pages"`
	CurrentPage int   `json:"current_page"`
	PageSize    int   `json:"page_size"`
}

// PaginatedApplications is a container for paginated application results.
type PaginatedApplications struct {
	Applications []Application `json:"applications"`
	Pagination   Pagination    `json:"pagination"`
}

// PaginatedBlogPosts is a container for paginated blog post results.
type PaginatedBlogPosts struct {
	BlogPosts  []BlogPost `json:"posts"`
	Pagination Pagination `json:"pagination"`
}

