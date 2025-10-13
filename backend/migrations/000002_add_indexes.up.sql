
-- Index for users table for fast lookups by email and username
CREATE INDEX ON users (email);
CREATE INDEX ON users (username);

-- Index for applications table for fast lookups by user_id and status
CREATE INDEX ON applications (user_id);
CREATE INDEX ON applications (status);

-- Index for notes and history_events for fast lookups by application_id
CREATE INDEX ON notes (application_id);
CREATE INDEX ON history_events (application_id);

-- Index for blog_posts for fast lookups by slug
CREATE INDEX ON blog_posts (slug);

-- Index for comments for fast lookups by post_id
CREATE INDEX ON comments (post_id);

-- -- migrations/000002_add_indexes.down.sql

DROP INDEX IF EXISTS users_email_idx;
DROP INDEX IF EXISTS users_username_idx;
DROP INDEX IF EXISTS applications_user_id_idx;
DROP INDEX IF EXISTS applications_status_idx;
DROP INDEX IF EXISTS notes_application_id_idx;
DROP INDEX IF EXISTS history_events_application_id_idx;
DROP INDEX IF EXISTS blog_posts_slug_idx;
DROP INDEX IF EXISTS comments_post_id_idx;
