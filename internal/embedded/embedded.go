package embedded

import (
	"embed"
	"io/fs"
)

//go:embed dist/*
var distFS embed.FS

// GetFrontendFS returns an io/fs sub-filesystem rooted at dist.
func GetFrontendFS() fs.FS {
	sub, err := fs.Sub(distFS, "dist")
	if err != nil {
		return nil
	}
	return sub
}
