-- make tournament and user deletions cascade
ALTER TABLE user_tournament
    DROP CONSTRAINT FK_user,
    ADD CONSTRAINT FK_user FOREIGN KEY (user_id) REFERENCES userinfo(id) ON DELETE CASCADE,
    DROP CONSTRAINT FK_tournament,
    ADD CONSTRAINT FK_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE;
ALTER TABLE tournament_invites
    DROP CONSTRAINT fk_tournament_id,
    ADD CONSTRAINT fk_tournament_id FOREIGN KEY (tournament_id) REFERENCES tournaments (id) ON DELETE CASCADE,
    DROP CONSTRAINT fk_inviter_user_id,
    ADD CONSTRAINT fk_inviter_user_id FOREIGN KEY (inviter_user_id) REFERENCES userinfo (id) ON DELETE CASCADE;