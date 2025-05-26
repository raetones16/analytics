# Automatic Syncing and Field Selection

## 🎉 **Status Update - COMPLETED & WORKING**

**Last Updated**: 26 May 2025

✅ **All features are now fully functional:**

- Automatic syncing with configurable frequencies
- Manual sync with proper timestamp updates
- Field selection UI with dynamic schema loading
- Database schema properly updated
- API endpoints working correctly
- Import path issues resolved

**Recent Fixes Applied:**

- Fixed import paths for `supabaseClient` in all API routes
- Updated manual sync endpoint to properly update `last_sync_at` timestamp
- Resolved Salesforce API quota limit handling
- All endpoints now working correctly

---

This document covers the implementation of automatic syncing and field selection features for the analytics app integrations.

## 🚀 **Features Implemented**

### 1. **Automatic Syncing**

- ✅ Configurable sync frequencies (hourly, daily, weekly, monthly)
- ✅ Enable/disable automatic syncing per integration
- ✅ Cron endpoint for scheduled execution
- ✅ Next sync time calculation and tracking
- ✅ Last sync timestamp tracking
- ✅ Overdue sync detection

### 2. **Field Selection**

- ✅ Dynamic schema discovery from Salesforce
- ✅ Interactive field selection UI
- ✅ Object-level and field-level selection
- ✅ Meltano configuration updates
- ✅ Persistent field selection storage

## 📊 **Database Schema Updates**

The following columns were added to the `integrations` table:

```sql
ALTER TABLE integrations
ADD COLUMN sync_frequency VARCHAR(20) DEFAULT 'manual',
ADD COLUMN last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN next_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN sync_enabled BOOLEAN DEFAULT false,
ADD COLUMN selected_fields JSONB DEFAULT '{}';

CREATE INDEX idx_integrations_next_sync ON integrations(next_sync_at)
WHERE sync_enabled = true;
```

### Field Descriptions:

- **`sync_frequency`**: `'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly'`
- **`last_sync_at`**: Timestamp of the last successful sync
- **`next_sync_at`**: Calculated timestamp for the next scheduled sync
- **`sync_enabled`**: Boolean flag to enable/disable automatic syncing
- **`selected_fields`**: JSONB object storing field selections per Salesforce object

## 🔗 **New API Endpoints**

### 1. **Schedule Management**

```
PUT /api/integrations/[id]/schedule
GET /api/integrations/[id]/schedule
```

**Request Body (PUT):**

```json
{
  "sync_enabled": true,
  "sync_frequency": "daily"
}
```

**Response:**

```json
{
  "integration": { ... },
  "message": "Automatic sync enabled (daily). Next sync: 2024-01-15T10:00:00Z"
}
```

### 2. **Field Selection**

```
PUT /api/integrations/[id]/fields
GET /api/integrations/[id]/fields
```

**Request Body (PUT):**

```json
{
  "selected_fields": {
    "Account": ["Id", "Name", "Email", "Phone"],
    "Contact": ["Id", "FirstName", "LastName", "Email"],
    "Lead": ["Id", "Name", "Company", "Status"]
  }
}
```

### 3. **Schema Discovery**

```
GET /api/integrations/[id]/schema
```

**Response:**

```json
{
  "success": true,
  "catalog": {
    "streams": [
      {
        "tap_stream_id": "Account",
        "schema": {
          "properties": {
            "Id": { "type": "string" },
            "Name": { "type": "string" },
            "Email": { "type": "string" }
          }
        }
      }
    ]
  }
}
```

### 4. **Automatic Sync Cron**

```
POST /api/cron/sync
```

**Headers:**

```
Authorization: Bearer your-secure-cron-secret-here
```

**Response:**

```json
{
  "message": "Processed 2 integrations",
  "results": [
    {
      "integration_id": "123",
      "integration_name": "Salesforce",
      "success": true,
      "next_sync_at": "2024-01-16T10:00:00Z"
    }
  ]
}
```

## 🎨 **UI Components**

### 1. **Integration Settings Modal**

- **Component**: `IntegrationSettings.tsx`
- **Features**:
  - Toggle switch for enabling automatic syncing
  - Dropdown for sync frequency selection
  - Display of last sync and next sync times
  - Interactive field selection with checkboxes
  - Object-level select/deselect all functionality
  - Real-time schema loading from Salesforce

### 2. **Enhanced Integrations Table**

- **Updated**: `page.tsx`
- **New Columns**:
  - **Sync Schedule**: Shows frequency and overdue status
  - **Last Sync**: Shows last sync date
  - **Settings Button**: Opens the settings modal

## ⚙️ **Configuration**

### Environment Variables

```bash
# Required for cron endpoint security
CRON_SECRET=your-secure-cron-secret-here

# Existing Salesforce OAuth credentials
SALESFORCE_CLIENT_ID=...
SALESFORCE_CLIENT_SECRET=...

# Existing Meltano environment variables
TAP_SALESFORCE_CLIENT_ID=...
TAP_SALESFORCE_CLIENT_SECRET=...
TAP_SALESFORCE_REFRESH_TOKEN=...
```

### Vercel Cron (Optional)

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```

## 🔄 **How Automatic Syncing Works**

1. **User Configuration**: User enables automatic syncing and sets frequency via the Settings modal
2. **Next Sync Calculation**: System calculates `next_sync_at` based on frequency
3. **Cron Execution**: Cron job runs every hour (or as configured) and calls `/api/cron/sync`
4. **Integration Processing**: System finds integrations where `next_sync_at <= now` and `sync_enabled = true`
5. **Sync Execution**: For each due integration:
   - Updates `meltano.yml` with integration config and field selections
   - Runs `meltano run --force tap-salesforce target-jsonl` with environment variables
   - Updates `last_sync_at` and calculates new `next_sync_at`
   - Updates integration status based on sync result

## 🎯 **Field Selection Workflow**

1. **Schema Discovery**: System calls `meltano invoke tap-salesforce --discover` to get available objects and fields
2. **UI Display**: Settings modal shows objects with expandable field lists
3. **User Selection**: User selects/deselects fields and objects
4. **Storage**: Selections stored in `selected_fields` JSONB column
5. **Meltano Update**: System updates `meltano.yml` with field selections using `select` configuration
6. **Sync Application**: Next sync uses the selected fields only

## 🧪 **Testing**

### Database Setup

1. Run the SQL commands from `scripts/update-database.js` in your Supabase dashboard
2. Verify columns were added to the integrations table

### API Testing

```bash
# Run the test script
node scripts/test-endpoints.js
```

### Manual Testing

1. Start the development server: `npm run dev`
2. Go to `/integrations`
3. Click "Settings" on an existing Salesforce integration
4. Test sync scheduling and field selection features

## 🔒 **Security Considerations**

1. **Cron Authentication**: The cron endpoint requires a bearer token for security
2. **Environment Variables**: All secrets are stored as environment variables, not in code
3. **Field Validation**: API endpoints validate input data before processing
4. **Error Handling**: Comprehensive error handling prevents system crashes

## 📈 **Performance Optimizations**

1. **Database Index**: Created index on `next_sync_at` for efficient cron queries
2. **Field Limiting**: UI shows only first 10 objects and 20 fields per object to prevent overwhelming users
3. **Background Processing**: Cron jobs run in background without blocking user interactions
4. **Efficient Queries**: Only fetch integrations that are actually due for sync

## 🚀 **Deployment Notes**

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. The `vercel.json` file configures automatic cron execution
3. Cron jobs run automatically in production

### Alternative Deployment

If not using Vercel, set up a cron job to call the sync endpoint:

```bash
# Every hour
0 * * * * curl -X POST https://your-domain.com/api/cron/sync -H "Authorization: Bearer your-secret"
```

## 🔮 **Future Enhancements**

1. **Sync History**: Track detailed sync logs and history
2. **Error Notifications**: Email/Slack notifications for sync failures
3. **Advanced Scheduling**: Custom cron expressions for more flexible scheduling
4. **Bulk Operations**: Enable/disable syncing for multiple integrations at once
5. **Sync Analytics**: Dashboard showing sync performance and statistics
6. **Field Mapping**: Advanced field mapping and transformation options

## 📝 **Troubleshooting**

### Common Issues

1. **Database columns missing**: Run the SQL commands in Supabase
2. **Cron endpoint unauthorized**: Check `CRON_SECRET` environment variable
3. **Schema loading fails**: Verify Salesforce credentials and connection
4. **Sync fails**: Check Meltano configuration and environment variables

### Debug Commands

```bash
# Test Meltano configuration
meltano config tap-salesforce list

# Test Salesforce connection
meltano invoke tap-salesforce --discover | head -20

# Check environment variables
env | grep TAP_SALESFORCE
```
