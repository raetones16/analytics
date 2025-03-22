# Analytics Dashboard

A simple, functional analytics dashboard to visualize key business metrics from multiple data sources. The dashboard consolidates data from local files (Salesforce, ChurnZero, and Support Portal exports) into an easy-to-read interface that focuses on product usage, sales performance, and customer satisfaction.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd analytics
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Adjust any paths if needed

### Data Setup

The application reads data from the following directories:

```
data/
├── customer/     # ChurnZero reports (XLSX format)
├── sales/        # Salesforce reports (CSV format)
└── support/      # Support portal exports (XLSX format)
```

You can generate sample data files with:

```
npm run generate-data
```

This will create properly structured files in the data directories.

## Available Scripts

- `npm run dev`: Starts the development server
- `npm run build`: Builds the application for production
- `npm run start`: Runs the built application
- `npm run lint`: Lints the code
- `npm run setup`: Sets up data directories
- `npm run generate-data`: Generates sample data files
- `npm run check-files`: Checks data file structure and contents
- `npm run test-api`: Tests the API endpoints

## Development

### Project Structure

```
/analytics/
├── app/                      # Next.js app directory
│   ├── page.tsx              # Main dashboard page
│   ├── layout.tsx            # App layout
│   ├── components/           # UI components
│   │   ├── DateFilter.tsx    # Date filter component
│   │   ├── ProductCharts.tsx # Product usage visualizations
│   │   ├── SalesCharts.tsx   # Sales statistics visualizations
│   │   └── CSATCharts.tsx    # CSAT/Support visualizations
│   ├── api/                  # API routes
│   │   └── data/route.ts     # Data retrieval and processing API
│   └── globals.css           # Global styles
├── data/                     # Data directory (not tracked in git)
│   ├── customer/             # ChurnZero reports (XLSX)
│   ├── sales/                # Salesforce reports (CSV)
│   └── support/              # Support portal exports (XLSX)
├── scripts/                  # Utility scripts
│   ├── setup-data-dirs.js    # Data directory setup helper
│   ├── generate-sample-data.js # Sample data generator
│   ├── check-files.js        # Data file checker
│   └── test-api.js           # API tester
└── public/                   # Static assets
```

### Key Features

1. **Dashboard**:
   - Clean, responsive dashboard layout
   - Date range filtering (month, quarter, half-year, year)
   - Visual representation of key metrics

2. **Data Processing**:
   - File reading utilities for Excel and CSV
   - Data aggregation and transformation
   - Error handling for missing files or data

3. **Charts**:
   - Product usage charts
   - Sales performance metrics
   - Customer satisfaction and support metrics

## Data File Structure

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

## Troubleshooting

If you encounter issues with data loading:

1. Check the browser console for error messages
2. Run `npm run check-files` to verify your data files
3. Check that the file naming conventions match what the application expects
4. Ensure your data files have the correct structure (columns, data types)
5. Try regenerating the sample data with `npm run generate-data`
