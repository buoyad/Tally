ALTER TABLE users
ADD CONSTRAINT username_unique UNIQUE (name);

ALTER TABLE users
ADD CONSTRAINT useremail_unique UNIQUE (email);

-- Make the email column required (not null)
ALTER TABLE users
ALTER COLUMN email SET NOT NULL;

-- Remove the password_hash column
ALTER TABLE users
DROP COLUMN password_hash;

-- Add a user_refresh_tokens table
CREATE TABLE user_refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Alter the users and tournaments tables creation columns to be timezone aware
ALTER TABLE users
ALTER COLUMN creation SET DATA TYPE TIMESTAMP WITH TIME ZONE USING creation AT TIME ZONE 'UTC';
ALTER TABLE tournaments
ALTER COLUMN creation SET DATA TYPE TIMESTAMP WITH TIME ZONE USING creation AT TIME ZONE 'UTC';
