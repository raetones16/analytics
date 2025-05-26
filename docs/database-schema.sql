-- Database Schema Updates for Automatic Syncing
-- Add these fields to the existing integrations table

ALTER TABLE integrations
ADD COLUMN sync_frequency VARCHAR(20) DEFAULT 'manual',
ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN next_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN selected_fields JSONB DEFAULT '{}';

-- Create index for efficient querying of integrations due for sync
CREATE INDEX idx_integrations_next_sync ON integrations(next_sync_at)
WHERE sync_enabled = true;

-- Sync frequency options:
-- 'manual' - No automatic syncing
-- 'hourly' - Every hour
-- 'daily' - Once per day
-- 'weekly' - Once per week
-- 'monthly' - Once per month

-- selected_fields structure:
-- {
--   "Account": ["Id", "Name", "Email", "Phone"],
--   "Contact": ["Id", "FirstName", "LastName", "Email"],
--   "Lead": ["Id", "Name", "Company", "Status"]
-- }