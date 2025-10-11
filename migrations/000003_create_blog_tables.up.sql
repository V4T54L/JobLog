CREATE TABLE blog_posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content_md TEXT NOT NULL,
    content_html TEXT NOT NULL,
    excerpt TEXT,
    is_public BOOLEAN NOT NULL DEFAULT FALSE, -- Default to draft
    seo_meta_title VARCHAR(255),
    seo_meta_description VARCHAR(255),
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

CREATE INDEX idx_blog_posts_user_id ON blog_posts(user_id);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_is_public ON blog_posts(is_public);

