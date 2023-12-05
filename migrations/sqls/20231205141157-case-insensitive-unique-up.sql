-- make tournaments.name unique case insensitive
CREATE UNIQUE INDEX tournaments_name_ci ON tournaments (UPPER(name));
-- make tournament_invites(tournament_id, invitee_email) unique case insensitive
CREATE UNIQUE INDEX tournament_invites_tournament_id_invitee_email_ci ON tournament_invites (tournament_id, UPPER(invitee_email));