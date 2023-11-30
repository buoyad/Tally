CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tournaments (
    name VARCHAR(255) NOT NULL PRIMARY KEY,
    creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_tournament (
    user_id UUID,
    tournament_name VARCHAR(255),
    CONSTRAINT user_tourn_pk PRIMARY KEY (user_id, tournament_name),
    CONSTRAINT FK_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT FK_tournament FOREIGN KEY (tournament_name) REFERENCES tournaments(name)
);
