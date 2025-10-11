package util

import (
	"regexp"
	"strings"
)

var (
	nonAlphaNumRegex = regexp.MustCompile(`[^a-z0-9]+`)
	dashRegex        = regexp.MustCompile(`-{2,}`)
)

func Slugify(s string) string {
	s = strings.ToLower(s)
	s = nonAlphaNumRegex.ReplaceAllString(s, "-")
	s = dashRegex.ReplaceAllString(s, "-")
	s = strings.Trim(s, "-")
	return s
}

