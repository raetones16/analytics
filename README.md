# Analytics Dashboard

A comprehensive analytics dashboard that visualizes key business metrics from multiple data sources. The platform currently supports local file processing (Salesforce, ChurnZero, and Support Portal exports) with hard-coded charts, and is being enhanced with live Salesforce integration, automatic syncing, and dynamic chart creation capabilities.

## 🎯 **Current Capabilities**

### **Local File Analytics (Working)**

- Processes local CSV/Excel exports from Salesforce, ChurnZero, and Support Portal
- Hard-coded charts for product usage, sales performance, and customer satisfaction
- Date range filtering (month, quarter, half-year, year)
- Clean, responsive dashboard interface

### **Live Integration Enhancement (New)**

- **Live Salesforce Integration** - OAuth PKCE flow for seamless authentication
- **Automatic Data Syncing** - Configurable sync frequencies (hourly, daily, weekly, monthly)
- **Smart Field Selection** - Dynamic schema discovery with selective data syncing
- **Dynamic Chart Creation** - User-prompted chart generation (planned)
- **Secure Architecture** - Environment variable storage, encrypted credentials

## 📊 **Analytics Focus**

The platform provides insights across multiple business areas:

**Current (Local Files):**

- Product usage metrics (web app, mobile app, timesheets)
- Sales performance from Salesforce exports
- Customer satisfaction and support metrics

**Enhanced (Live Integration):**

- Real-time sales performance metrics
- Revenue analytics (ARR growth, deal values)
- Client analytics (active clients, new acquisitions, churn)
- Pipeline health and conversion metrics

## 🏗️ **Technical Architecture**

### **Current Stack**

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Data Processing**: File reading utilities for Excel/CSV
- **Charts**: Hard-coded visualizations with date filtering
- **Storage**: Local file system (`data/` directory)

### **Enhanced Stack**

- **Live Integration**: Meltano + Singer (tap-salesforce, target-jsonl)
- **Database**: Supabase PostgreSQL for integration configs
- **Authentication**: OAuth 2.0 PKCE flow with Salesforce
- **Deployment**: Vercel with automated cron jobs
- **Security**: Environment variables, encrypted token storage

## 📚 **Documentation**

### **Current System**

- Local file processing and chart generation (see sections below)

### **Enhanced Features**

- **[Sales Analytics Platform Roadmap](docs/sales-analytics-platform-roadmap.md)** - Vision for live integration expansion
- **[Automatic Syncing & Field Selection](docs/automatic-syncing-and-field-selection.md)** - Live integration technical details
- **[Integrations Implementation](docs/integrations/README.md)** - OAuth flow and integration architecture
- **[User-Prompted Charting](docs/user-prompted-charting/README.md)** - Future dynamic chart generation

## 🚀 **Getting Started**

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

**For Live Integration Features:**

- Python 3.8+ and Meltano (for data pipeline)
- Supabase account (for database)
- Salesforce Connected App (for OAuth)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd analytics
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

### Data Setup (Current System)

The application reads data from the following directories:

```
data/
├── customer/     # ChurnZero reports (XLSX format)
├── sales/        # Salesforce reports (CSV format)
└── support/      # Support portal exports (XLSX format)
```

You can generate sample data files with:

```bash
npm run generate-data
```

This will create properly structured files in the data directories.

### Live Integration Setup (Enhanced Features)

For the new Salesforce integration capabilities:

1. **Set up Meltano:**

   ```bash
   # Install Meltano
   pipx install meltano

   # Initialize project (if not already done)
   meltano init .

   # Install Salesforce connector
   meltano add extractor tap-salesforce
   meltano add loader target-jsonl
   ```

2. **Configure live integration environment variables:**

   ```env
   # Supabase (for integration configs)
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Salesforce OAuth
   SALESFORCE_CLIENT_ID=your-salesforce-client-id
   SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret

   # Meltano/Singer
   TAP_SALESFORCE_CLIENT_ID=your-salesforce-client-id
   TAP_SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
   TAP_SALESFORCE_REFRESH_TOKEN=auto-populated

   # Cron Security
   CRON_SECRET=your-secure-cron-secret
   ```

3. **Set up database:**
   - Create a Supabase project
   - Run the SQL commands from `docs/database-schema.sql`

## 🔧 **Available Scripts**

### **Current System**

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Lint code
- `npm run setup` - Set up data directories
- `npm run generate-data` - Generate sample data files
- `npm run check-files` - Check data file structure and contents
- `npm run test-api` - Test API endpoints

### **Enhanced Features**

All the above scripts plus live integration capabilities when properly configured.

## 📁 **Project Structure**

```
/analytics/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Main dashboard (local file charts)
│   ├── layout.tsx                # App layout
│   ├── components/               # UI components
│   │   ├── DateFilter.tsx        # Date filter component
│   │   ├── ProductCharts.tsx     # Product usage visualizations
│   │   ├── SalesCharts.tsx       # Sales statistics visualizations
│   │   └── CSATCharts.tsx        # CSAT/Support visualizations
│   ├── integrations/             # NEW: Live integration management
│   │   ├── page.tsx              # Integrations list
│   │   └── IntegrationSettings.tsx # Settings modal
│   ├── api/                      # API routes
│   │   ├── data/route.ts         # Local file data processing
│   │   ├── integrations/         # NEW: Integration CRUD
│   │   ├── oauth/                # NEW: OAuth flow
│   │   └── cron/                 # NEW: Automatic syncing
│   └── globals.css               # Global styles
├── data/                         # Local data directory (not tracked in git)
│   ├── customer/                 # ChurnZero reports (XLSX)
│   ├── sales/                    # Salesforce reports (CSV)
│   └── support/                  # Support portal exports (XLSX)
├── docs/                         # Comprehensive documentation
├── scripts/                      # Utility scripts
│   ├── setup-data-dirs.js        # Data directory setup helper
│   ├── generate-sample-data.js   # Sample data generator
│   ├── check-files.js            # Data file checker
│   └── test-api.js               # API tester
├── meltano.yml                   # NEW: Meltano configuration
├── vercel.json                   # NEW: Deployment configuration
└── public/                       # Static assets
```

## 🎯 **Current Status**

### **Working Features (Local Files)**

✅ **Dashboard with hard-coded charts**
✅ **Local file processing (CSV/Excel)**
✅ **Date range filtering**
✅ **Product usage analytics**
✅ **Sales performance metrics**
✅ **Customer satisfaction tracking**

### **Enhanced Features (Live Integration)**

✅ **Salesforce OAuth integration**
✅ **Automatic syncing with scheduling**
✅ **Field selection with schema discovery**
✅ **Manual sync capabilities**
✅ **Integration management UI**
✅ **Secure credential handling**

### **Upcoming Enhancements**

🔮 **Smart object filtering** (reduce 1099+ objects to core sales objects)
🔮 **Enhanced field selection UX** with search and categorization
🔮 **Historical data analysis** and trend tracking
🔮 **LLM-powered chart generation** (user-prompted charts)
🔮 **Multi-CRM support** (HubSpot, Pipedrive)

## 📊 **Data File Structure (Current System)**

### Customer Data (Excel)

#### Web App Stats

Expected columns:

- `Date`: Date of the metrics (YYYY-MM-DD)
- `Logins`: Number of web app logins
- `AbsencesBooked`: Number of absences booked via web app
- `WorkflowsCreated`: Number of workflows created

#### Mobile App Stats

Expected columns:

- `Date`: Date of the metrics (YYYY-MM-DD)
- `Logins`: Number of mobile app logins
- `AbsencesBooked`: Number of absences booked via mobile app

#### Timesheet Stats

Expected columns:

- `Date`: Date of the metrics (YYYY-MM-DD)
- `WebTimesheets`: Number of timesheets submitted via web app
- `MobileTimesheets`: Number of timesheets submitted via mobile app

### Sales Data (CSV)

Expected columns:

- `CloseDate`: Date when opportunity was closed (YYYY-MM-DD)
- `Amount`: Deal amount (number)
- `NumberOfModules`: Number of modules sold (number)

### Support Data (Excel)

Expected columns:

- `Created_at`: Ticket creation date (YYYY-MM-DD)
- `Priority`: Ticket priority (Low, Medium, High, Urgent)
- `Topic`: Category or topic of the ticket
- `Type`: Ticket type (including "Cancellation" for churn tracking)
- `NPS_score`: NPS rating if available (0-10)

## 🔧 **Troubleshooting**

### Current System Issues

If you encounter issues with local file data loading:

1. Check the browser console for error messages
2. Run `npm run check-files` to verify your data files
3. Check that the file naming conventions match what the application expects
4. Ensure your data files have the correct structure (columns, data types)
5. Try regenerating the sample data with `npm run generate-data`

### Live Integration Issues

1. **OAuth Flow Fails**

   - Check Salesforce Connected App configuration
   - Verify callback URL matches your domain
   - Ensure client ID/secret are correct

2. **Sync Fails**

   - Check Meltano installation: `meltano --version`
   - Verify environment variables are set
   - Check Salesforce API quota limits

3. **Database Errors**
   - Ensure database schema is up to date
   - Check Supabase connection settings
   - Verify table permissions

## 🚀 **Vision & Roadmap**

This platform is evolving from a local file processing dashboard into a comprehensive B2B SaaS analytics solution:

**Phase 1 (Complete)**: Local file processing with hard-coded charts
**Phase 2 (In Progress)**: Live Salesforce integration with automatic syncing
**Phase 3 (Planned)**: Dynamic chart creation and enhanced UX
**Phase 4 (Future)**: Multi-CRM support and AI-powered insights

The goal is to maintain the current working functionality while adding powerful live integration capabilities that eliminate manual export/import workflows and enable dynamic, user-driven analytics.
