-- create the scores table
CREATE TYPE puzzletype AS ENUM ('mini', 'biggie');
CREATE TABLE scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    for_day DATE NOT NULL,
    puzzle_type puzzletype NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES userinfo(id),
    CONSTRAINT unique_user_day_puzzle UNIQUE (user_id, for_day, puzzle_type)
);