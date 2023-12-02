CREATE TABLE verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,

  PRIMARY KEY (identifier, token)
);

CREATE TABLE accounts (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE sessions (
  id SERIAL,
  "userId" INTEGER NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL,

  PRIMARY KEY (id)
);

CREATE TABLE users (
  id SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  "emailVerified" TIMESTAMPTZ,
  image TEXT,

  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS tournaments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_tournament (
    user_id SERIAL,
    tournament_id UUID,
    CONSTRAINT user_tourn_pk PRIMARY KEY (user_id, tournament_id),
    CONSTRAINT FK_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT FK_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);
