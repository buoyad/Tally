-- create a table for tournament invites
CREATE TABLE tournament_invites (
    id SERIAL PRIMARY KEY,
    tournament_id SERIAL,
    invitee_email TEXT NOT NULL,
    inviter_user_id SERIAL,
    rejected BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_tournament_invite UNIQUE (tournament_id, invitee_email),
    CONSTRAINT fk_tournament_id FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
    CONSTRAINT fk_inviter_user_id FOREIGN KEY (inviter_user_id) REFERENCES userinfo (id)
);