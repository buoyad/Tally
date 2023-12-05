CREATE TABLE sent_emails (
    id SERIAL NOT NULL,
    email TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    sending_user_id INTEGER DEFAULT NULL,
    email_type TEXT NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_sending_user_id FOREIGN KEY (sending_user_id) REFERENCES userinfo (id) ON DELETE SET NULL
);