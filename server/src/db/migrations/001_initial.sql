CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id VARCHAR(80) NOT NULL UNIQUE,
  display_name VARCHAR(20) NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  max_players INTEGER,
  status VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code CHAR(6) NOT NULL UNIQUE CHECK (room_code ~ '^[A-Z0-9]{6}$'),
  game_id VARCHAR(50) NOT NULL REFERENCES games(id),
  host_player_id UUID NOT NULL REFERENCES players(id),
  status VARCHAR(20) NOT NULL CHECK (status IN ('WAITING', 'PLAYING', 'FINISHED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role VARCHAR(20),
  connected BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (room_id, player_id)
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  game_id VARCHAR(50) NOT NULL REFERENCES games(id),
  state JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  winner_player_id UUID REFERENCES players(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX IF NOT EXISTS game_sessions_room_id_idx ON game_sessions (room_id);

CREATE TABLE IF NOT EXISTS game_moves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  move_number INTEGER NOT NULL,
  player_id UUID NOT NULL REFERENCES players(id),
  from_position INTEGER NOT NULL,
  to_position INTEGER NOT NULL,
  captured_position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_session_id, move_number)
);

INSERT INTO games (id, name, max_players, status) VALUES
  ('barah-goti', 'Barah Goti', 2, 'playable'),
  ('solah-goti', 'Solah Goti', NULL, 'coming-soon'),
  ('atha-goti', 'Atha Goti', NULL, 'coming-soon'),
  ('bagh-chal', 'Bagh-Chal', NULL, 'coming-soon'),
  ('chowka-bara', 'Chowka Bara', NULL, 'coming-soon'),
  ('pallankuzhi', 'Pallankuzhi', NULL, 'coming-soon'),
  ('kaudi', 'Kaudi', NULL, 'coming-soon'),
  ('pachisi', 'Pachisi', NULL, 'coming-soon'),
  ('chaupar', 'Chaupar', NULL, 'coming-soon'),
  ('mancala', 'Mancala', NULL, 'coming-soon')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, max_players = EXCLUDED.max_players, status = EXCLUDED.status;