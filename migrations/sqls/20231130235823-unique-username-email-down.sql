-- Reverse the time zone data type changes from the up migration
ALTER TABLE users
ALTER COLUMN creation SET DATA TYPE TIMESTAMP USING creation AT TIME ZONE 'UTC';
ALTER TABLE tournaments
ALTER COLUMN creation SET DATA TYPE TIMESTAMP USING creation AT TIME ZONE 'UTC';

-- drop the user_refresh_tokens table
DROP TABLE user_refresh_tokens;

-- Add the password_hash column back
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255);

-- Make the email column optional (null)
ALTER TABLE users
ALTER COLUMN email DROP NOT NULL;

ALTER TABLE users
DROP CONSTRAINT useremail_unique;

ALTER TABLE users
DROP CONSTRAINT username_unique;