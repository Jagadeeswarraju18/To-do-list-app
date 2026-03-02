-- Add author_bio column to opportunities table
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS author_bio TEXT;
