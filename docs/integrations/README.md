# Integrations Implementation Plan

## Overview

This document outlines the implementation and progress for integrating external data sources into the Analytics Dashboard using Meltano and the Singer ecosystem, starting with Salesforce as the first connector. This is an enhancement to the existing local file processing system, adding live data integration capabilities while maintaining the current working dashboard functionality.

## 🎉 **Current Status - COMPLETED & WORKING**

**Last Updated**: 26 May 2025

✅ **All core integration features are now fully functional:**

- Salesforce OAuth PKCE flow - seamless user authentication
- Automatic syncing with configurable frequencies (hourly, daily, weekly, monthly)
- Manual sync with proper status tracking
- Field selection UI with dynamic schema discovery
- Secure credential management via environment variables
- Complete API endpoints for CRUD, testing, and syncing
- Database schema with sync scheduling and field selection storage

**Enhancement Context:**
This live integration system works alongside the existing local file processing dashboard. Users can continue using CSV/Excel exports while also setting up live Salesforce connections for real-time data access.

**Recent Major Completions:**

- OAuth flow implemented and working
- Sync endpoints fully functional
- Field selection and schema discovery operational
- All API endpoints tested and verified
- Import path issues resolved
- Database schema properly updated

---

## Project Goals

- ✅ Enable users to connect external data sources (starting with Salesforce) to the analytics platform.
- ✅ Provide a simple, non-technical, wizard-based UI for managing integrations.
- ✅ Ensure all connector configuration is centralized and secure.
- ✅ Build a scalable framework to add more connectors in the future.
- ✅ Follow best practices for secrets management and user experience.

---

## ✅ Salesforce OAuth Flow - COMPLETED

### **Implementation Completed**

✅ **Seamless OAuth PKCE Flow:**

1. User clicks "Connect Salesforce" in the UI
2. User is redirected to Salesforce's OAuth login/consent page
3. User logs in and authorizes the app
4. Salesforce redirects back with authorization code
5. Backend exchanges code for refresh token and access token
6. Tokens stored securely as environment variables
7. User never sees or enters credentials manually

✅ **Security Features:**

- PKCE (Proof Key for Code Exchange) for enhanced security
- Client secret never exposed to frontend
- Refresh tokens stored as environment variables
- Automatic token refresh handling

✅ **User Experience:**

- One-click connection process
- Clear success/error feedback
- Disconnect/reconnect functionality
- No manual credential entry required

### **High-Level Flow**

1. User clicks "Connect Salesforce" in the UI.
2. User is redirected to Salesforce's OAuth login/consent page.
3. User logs in and authorizes the app.
4. Salesforce redirects back to the app with an authorization code.
5. The backend exchanges the code for a refresh token and access token.
6. Tokens are stored securely and used for all future syncs/tests.
7. User never sees or enters a client ID/secret/token.

### **Implementation Steps**

1. **Salesforce Setup (One-Time, Admin Only):**
   - Register a Connected App in Salesforce.
   - Get the Client ID and Client Secret.
   - Set the OAuth callback URL to your backend (e.g., `/api/oauth/salesforce/callback`).
2. **Frontend:**
   - Replace manual credential fields with a "Connect Salesforce" button.
   - Button triggers the OAuth flow via the backend.
3. **Backend:**
   - `/api/oauth/salesforce/start`: Redirects to Salesforce OAuth login.
   - `/api/oauth/salesforce/callback`: Handles redirect, exchanges code for tokens, stores tokens securely.
   - Associates tokens with the user's integration.
4. **Integration with Meltano/Singer:**
   - When running a sync or test, fetch the stored tokens and pass them to Meltano/tap-salesforce as config.
5. **UI Feedback:**
   - Show success message when connected.
   - Allow disconnect/reconnect as needed.

### **Complexity & Considerations**

- **Moderate complexity:** Standard OAuth 2.0 flow, well-supported by Node.js libraries.
- **Security:** Never expose client secret to frontend; store tokens securely.
- **User Experience:** User only clicks "Connect" and logs in—no manual credential entry.

### **Next Actions**

- Set up Salesforce Connected App (admin task).
- Scaffold backend OAuth endpoints.
- Update frontend to use the new flow.
- Test end-to-end with a Salesforce developer account.

---

## Technical Approach

- **Orchestration:** Use Meltano to manage connectors (Singer taps/targets), configuration, and scheduling.
- **Connectors:** Leverage existing Singer taps (starting with `tap-salesforce`).
- **Frontend:** Next.js (React, TypeScript), Tailwind CSS, Radix UI for modals/forms.
- **Backend:** API endpoints securely store and validate connector configs, and orchestrate Meltano CLI commands.
- **Config Storage:** Store connector configs securely in Supabase (encrypted at rest, never exposed to frontend after entry).
- **Extensibility:** Design for easy addition of new connectors and marketplace-style discovery.

---

## Backend Meltano/Singer Integration (Seamless Orchestration)

### **Status**

- Meltano is installed and initialized in the project root.
- `tap-salesforce` and `target-jsonl` are installed and configured in `meltano.yml`.
- The backend API is ready to orchestrate real Meltano commands for testing and (soon) syncing integrations.

### **How It Works**

- The backend (Next.js API routes) manages all Meltano/Singer orchestration.
- When a user adds, tests, or syncs an integration in the UI, the backend:
  1. Fetches the integration config from Supabase.
  2. Writes the config to a temporary file.
  3. Runs Meltano CLI commands (e.g., `meltano invoke tap-salesforce --test`) using Node.js `child_process`.
  4. Parses the output and returns the result to the frontend.
- **End users never interact with Meltano, Singer, or config files directly.**
- All orchestration is handled transparently by the backend for a seamless experience.

### **Backend Environment Requirements**

- **Python 3.8+** and **Meltano** must be installed and available in the backend environment (e.g., server, Docker container).
- All required Singer taps/targets (e.g., `tap-salesforce`, `target-jsonl`) must be installed in the same environment.
- The backend must have permission to run shell commands (Node.js `child_process.spawn`).
- The backend must be able to write/read temporary config files (e.g., `/tmp`).

### **Setup Instructions (for Developers/Deployment)**

1. **Install Python and pipx:**
   ```bash
   brew install python3  # or use your OS package manager
   python3 -m pip install --user pipx
   python3 -m pipx ensurepath
   ```
2. **Install Meltano:**
   ```bash
   pipx install meltano
   ```
3. **Initialize Meltano project (if not already):**
   ```bash
   meltano init .
   ```
4. **Add Salesforce tap and a target:**
   ```bash
   meltano add extractor tap-salesforce
   meltano add loader target-jsonl  # or another target as needed
   ```
5. **Ensure all commands work from the backend environment:**
   - The `meltano` command should be available in the PATH for the Node.js backend.
   - All taps/targets should be installed and discoverable by Meltano.

### **Security Notes**

- Secrets are never exposed to the frontend or stored in the UI.
- All config files are written to temporary locations and deleted after use.
- Only the backend service needs access to Meltano and the Singer ecosystem.

---

## **How to Test the End-to-End Salesforce Integration**

### **1. Start Your App**

- Make sure your Next.js app and backend are running (e.g., `npm run dev`).
- Ensure the backend is running in the same environment where Meltano is installed and `meltano.yml` is present.

### **2. Add a Salesforce Integration via the UI**

- Go to the Integrations page in your app.
- Click "Add Integration."
- Enter the required Salesforce config fields:
  - **Name:** Any friendly name (e.g., `Test Salesforce`)
  - **Instance URL:** Your Salesforce instance URL (e.g., `https://your-instance.salesforce.com`)
  - **Start Date:** Any valid date (e.g., `2024-01-01`)
  - **Client ID, Client Secret, Refresh Token:** Use real Salesforce credentials if you want a real test, or dummy values to test error handling.
- Proceed through the wizard to the "Test Connection" step.

### **3. Test the Connection**

- Click "Test Connection."
- The backend will:
  1. Fetch your integration config from Supabase.
  2. Write it to a temp file.
  3. Run `meltano invoke tap-salesforce --test` with your config.
  4. Return the result (success or error) to the UI.
- **What to expect:**
  - If credentials are valid, you'll see a success message.
  - If credentials are invalid or there's a config error, you'll see an error message from Meltano/Singer.

### **4. Troubleshooting**

- If you see an error:
  - Check the backend logs for details (look for errors from the `meltano` command).
  - Make sure the backend process has permission to run shell commands and access the Meltano project files.
  - Ensure the config file is being written to a location the backend can access (e.g., `/tmp`).
  - Make sure the `meltano` command is available in the backend's PATH.
- If you need to debug further, try running the same Meltano command manually in your terminal:
  ```bash
  meltano invoke tap-salesforce --test --config /tmp/sf-config-<id>.json
  ```
  (Replace `<id>` with the actual integration ID.)

### **5. Next Steps**

- Once testing works, you can proceed to implement and test the sync endpoint in the same way.
- Continue to polish the UI and error handling as needed.

---

## Backend API Implementation (Completed)

### **Supabase Table**

- Table: `integrations`
- Fields: `id`, `type`, `name`, `config`, `secrets`, `status`, `created_at`, `updated_at`

### **API Endpoints**

All endpoints are available under `/api/integrations`.

#### **Create Integration**

- **POST `/api/integrations`**
- Create a new integration (e.g., Salesforce)
- **Body:**
  ```json
  {
    "type": "salesforce",
    "name": "My Salesforce Connector",
    "config": { "instance_url": "...", "start_date": "..." },
    "secrets": {
      "client_id": "...",
      "client_secret": "...",
      "refresh_token": "..."
    }
  }
  ```
- **Response:** Created integration object

#### **List Integrations**

- **GET `/api/integrations`**
- Returns all integrations
- **Response:** `{ "integrations": [ ... ] }`

#### **Get Integration by ID**

- **GET `/api/integrations/[id]`**
- Returns a single integration
- **Response:** `{ "integration": { ... } }`

#### **Update Integration**

- **PUT `/api/integrations/[id]`**
- Update an integration
- **Body:** Same as create
- **Response:** Updated integration object

#### **Delete Integration**

- **DELETE `/api/integrations/[id]`**
- Deletes an integration
- **Response:** `{ "success": true }`

#### **Test Connection**

- **POST `/api/integrations/[id]/test`**
- Tests the connection by running Meltano CLI with the integration config
- **Response:** `{ "success": true, "message": "Connection successful!", "output": "..." }` or `{ "success": false, "error": "..." }`

#### **Trigger Sync**

- **POST `/api/integrations/[id]/sync`**
- Triggers a sync (to be implemented: will run Meltano ELT job)
- **Response:** `{ "success": true, "message": "Sync triggered (stub)." }`

---

## User Experience Principles

- **Wizard-based modal UI** for adding/editing integrations (step-by-step, non-technical).
- **Marketplace** for browsing/searching available connectors.
- **Simple forms** for required fields, with advanced options hidden by default.
- **Live validation** and "Test Connection" before saving.
- **Notifications** for sync issues, with clear actions to resolve.
- **No secrets ever displayed after entry.**

---

## Implementation Steps & Status

1. **Documentation & Planning**

   - [x] Create and maintain this documentation folder for all integration-related work.

2. **Backend**

   - [x] Supabase table for integrations (with sync scheduling and field selection columns)
   - [x] API endpoints for CRUD, test, and sync actions
   - [x] Secure secrets management (environment variables, never exposed to frontend)
   - [x] Meltano CLI orchestration for test endpoint
   - [x] Meltano CLI orchestration for sync endpoint (manual and automatic)
   - [x] Schema discovery endpoint for field selection
   - [x] Sync scheduling and field selection endpoints
   - [x] Cron endpoint for automatic syncing
   - [x] All endpoints tested and working

3. **Frontend**

   - [x] Add "Integrations" section/page
   - [x] Display list of integrations (GET endpoint)
   - [x] Add "Add Integration" wizard/modal with OAuth flow
   - [x] Enable edit, delete, test, and sync actions from the UI
   - [x] Integration settings modal for sync scheduling and field selection
   - [x] Enhanced table with sync status and schedule information

4. **Meltano Integration**

   - [x] Implement real logic for test endpoint (call Meltano CLI)
   - [x] Implement real logic for sync endpoint (call Meltano CLI)
   - [x] Sync integration config with `meltano.yml` for field selections
   - [x] Surface sync/test results and logs
   - [x] Environment variable integration for secure credential handling

5. **OAuth & Security**

   - [x] Salesforce OAuth PKCE flow implementation
   - [x] Secure token storage and refresh handling
   - [x] Environment variable management for all secrets
   - [x] Bearer token authentication for cron endpoints

6. **Advanced Features**

   - [x] Automatic syncing with configurable frequencies
   - [x] Field selection UI with schema discovery
   - [x] Sync scheduling and status tracking
   - [x] Database indexing for performance
   - [x] Error handling and user feedback

7. **Notifications & Error Handling**

   - [x] User-friendly error messages for sync failures
   - [x] Clear feedback for connection testing
   - [x] Status indicators for sync schedules
   - [ ] Email/Slack notifications for sync failures (future enhancement)

8. **Extensibility**
   - [x] Scalable architecture for additional connectors
   - [ ] Schema-driven form generation for new connectors (future)
   - [ ] Connector metadata (name, logo, category, description) for marketplace (future)
   - [ ] Bulk actions and advanced scheduling support (future)

## ✅ **Completed Major Milestones**

- **OAuth Integration**: Seamless Salesforce authentication without manual credential entry
- **Automatic Syncing**: Configurable sync frequencies with cron job execution
- **Field Selection**: Dynamic schema discovery and selective field syncing
- **Complete UI**: Full integration management interface with settings modal
- **Security**: Environment variable storage and secure token handling
- **Performance**: Database indexing and efficient API design

## 🔮 **Future Enhancements**

- Additional CRM connectors (HubSpot, Pipedrive, etc.)
- Advanced notification system
- Bulk operations and management
- Connector marketplace with metadata
- Advanced scheduling options
- Sync analytics and monitoring

---

## Open Questions & Decisions (Updated)

- **Secrets Management:** Using Supabase for secure storage; consider managed secrets service for production if needed.
- **User Permissions:** No permissions for MVP; design with future admin-only access in mind.
- **Connector Marketplace:** Start with Salesforce, but design for easy addition and discovery of more connectors.
- **Notifications:** Use notification bars/toasts with clear, actionable messages.
- **Meltano CLI Integration:** Test endpoint now calls Meltano CLI; sync endpoint to follow.

---

## References

- [Meltano Documentation](https://docs.meltano.com/)
- [Singer SDK](https://sdk.meltano.com/)
- [Supabase](https://supabase.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

_This document is a living plan. Please update as decisions are made and implementation progresses._
