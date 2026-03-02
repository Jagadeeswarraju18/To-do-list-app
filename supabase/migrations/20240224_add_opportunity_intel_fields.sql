-- Add competitor_name and author_bio columns to opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS competitor_name TEXT;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS author_bio TEXT;
