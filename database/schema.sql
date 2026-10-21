-- PostgreSQL + PostGIS schema for production (the prototype uses server/data/db.json).
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE verification_status AS ENUM ('Community Submitted','Community Verified','Expert Verified','Rejected');
CREATE TYPE condition_level AS ENUM ('Good','Needs Attention','Deteriorating','At Risk');
CREATE TYPE user_role AS ENUM ('user','admin','expert');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text UNIQUE,
  name text NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  xp int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE heritage_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, local_name text,
  category text NOT NULL, tags text[] DEFAULT '{}',
  geom geography(Point,4326) NOT NULL,
  locality text, district text, state text,
  period_text text,                       -- approximate; uncertainty allowed
  description text NOT NULL, significance text,
  local_story text, local_story_label text DEFAULT 'Community-sourced', language text DEFAULT 'English',
  verification verification_status NOT NULL DEFAULT 'Community Submitted',
  verifier_id uuid REFERENCES users(id), verified_at timestamptz,
  condition condition_level NOT NULL DEFAULT 'Good',
  published boolean NOT NULL DEFAULT false,
  submitted_by uuid REFERENCES users(id),
  review_note text, created_at timestamptz DEFAULT now()
);
CREATE INDEX heritage_geom_idx ON heritage_sites USING GIST (geom);
CREATE INDEX heritage_search_idx ON heritage_sites USING GIN (to_tsvector('simple', name || ' ' || coalesce(description,'') || ' ' || coalesce(district,'')));
-- "Near me" query:  SELECT * FROM heritage_sites WHERE published AND ST_DWithin(geom, ST_MakePoint($lng,$lat)::geography, $radius_m);

CREATE TABLE media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES heritage_sites(id) ON DELETE CASCADE,
  kind text CHECK (kind IN ('image','audio','video')), url text NOT NULL, credit text
);
CREATE TABLE sources (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id uuid REFERENCES heritage_sites(id) ON DELETE CASCADE, text text NOT NULL);
CREATE TABLE vouches (site_id uuid REFERENCES heritage_sites(id) ON DELETE CASCADE, user_id uuid REFERENCES users(id), PRIMARY KEY (site_id, user_id));
CREATE TABLE corrections (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id uuid REFERENCES heritage_sites(id), user_id uuid REFERENCES users(id), text text, status text DEFAULT 'open', created_at timestamptz DEFAULT now());

CREATE TABLE condition_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES heritage_sites(id), user_id uuid REFERENCES users(id),
  proposed condition_level, notes text, status text DEFAULT 'pending', created_at timestamptz DEFAULT now()
);
CREATE TABLE condition_history (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id uuid REFERENCES heritage_sites(id), from_level condition_level, to_level condition_level, notes text, changed_by uuid REFERENCES users(id), changed_at timestamptz DEFAULT now());

CREATE TABLE quizzes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), site_id uuid REFERENCES heritage_sites(id), status text DEFAULT 'draft', ai_generated boolean DEFAULT false);
CREATE TABLE quiz_questions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE, question text, options jsonb, answer_index int);

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text NOT NULL, description text,
  geom geography(Point,4326), district text, site_id uuid REFERENCES heritage_sites(id),
  starts_at date, ends_at date, badge text, status text DEFAULT 'published'
);
CREATE TABLE event_missions (id text, event_id uuid REFERENCES events(id) ON DELETE CASCADE, type text, title text, xp int, quiz_id uuid, PRIMARY KEY (event_id, id));
CREATE TABLE event_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id uuid REFERENCES events(id), mission_id text, user_id uuid REFERENCES users(id),
  text_body text, media_url text, status text DEFAULT 'pending', created_at timestamptz DEFAULT now()
);

CREATE TABLE hunts (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), title text, difficulty text, starts_at date, ends_at date, badge text);
CREATE TABLE hunt_stops (hunt_id uuid REFERENCES hunts(id), position int, site_id uuid REFERENCES heritage_sites(id), clue text, keywords text[], question text, options jsonb, answer_index int, mission text, qr_code text, PRIMARY KEY (hunt_id, position));
CREATE TABLE hunt_progress (hunt_id uuid REFERENCES hunts(id), user_id uuid REFERENCES users(id), step int DEFAULT 0, PRIMARY KEY (hunt_id, user_id));

CREATE TABLE xp_log (id bigserial PRIMARY KEY, user_id uuid REFERENCES users(id), action_key text NOT NULL, points int NOT NULL, reason text, district text, event_id uuid, created_at timestamptz DEFAULT now(), UNIQUE (user_id, action_key)); -- UNIQUE = no double rewards
CREATE TABLE badges (user_id uuid REFERENCES users(id), badge text, earned_at timestamptz DEFAULT now(), PRIMARY KEY (user_id, badge));
CREATE TABLE passport_stamps (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES users(id), kind text, ref_id text, label text, created_at timestamptz DEFAULT now(), UNIQUE (user_id, kind, ref_id));

-- Leaderboards
-- Global:   SELECT user_id, sum(points) FROM xp_log GROUP BY 1 ORDER BY 2 DESC;
-- Location: add WHERE district = 'Nagpur';   Event: add WHERE event_id = $1;
