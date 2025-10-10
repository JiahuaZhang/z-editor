-- Migration: Rename reminder field to alert in editor_documents table
-- This migration handles the schema change from reminder JSONB[] to alert JSONB[]
-- and migrates existing data to the new format

-- Step 1: Add the new alert column (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'editor_documents' 
        AND column_name = 'alert'
    ) THEN
        ALTER TABLE editor_documents ADD COLUMN alert JSONB[];
    END IF;
END $$;

-- Step 2: Check if reminder column exists and migrate data
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'editor_documents' 
        AND column_name = 'reminder'
    ) THEN
        -- Migrate data from reminder to alert column
        UPDATE editor_documents 
        SET alert = reminder 
        WHERE reminder IS NOT NULL AND alert IS NULL;
        
        -- Drop the old reminder column
        ALTER TABLE editor_documents DROP COLUMN reminder;
    END IF;
END $$;