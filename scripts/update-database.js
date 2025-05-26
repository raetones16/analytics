// This script demonstrates the SQL commands needed to update your Supabase database
// You'll need to run these commands in your Supabase SQL editor

const sqlCommands = `
-- Add new columns for automatic syncing
ALTER TABLE integrations
ADD COLUMN IF NOT EXISTS sync_frequency VARCHAR(20) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS next_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS selected_fields JSONB DEFAULT '{}';

-- Create index for efficient querying of integrations due for sync
CREATE INDEX IF NOT EXISTS idx_integrations_next_sync ON integrations(next_sync_at)
WHERE sync_enabled = true;

-- Update existing integrations to have default values
UPDATE integrations
SET
  sync_frequency = 'manual',
  sync_enabled = false,
  selected_fields = '{}'
WHERE sync_frequency IS NULL;
`;

console.log("=== SQL Commands to Run in Supabase ===");
console.log(sqlCommands);
console.log("\n=== Instructions ===");
console.log("1. Go to your Supabase dashboard");
console.log("2. Navigate to the SQL Editor");
console.log("3. Copy and paste the SQL commands above");
console.log("4. Run the commands");
console.log("5. Verify the columns were added to the integrations table");

// For local testing, you could also use the Supabase client
// But it's safer to run these commands directly in the Supabase dashboard
