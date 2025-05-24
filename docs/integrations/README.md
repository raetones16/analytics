# Integrations Implementation Plan

## Overview

This document outlines the plan and progress for integrating external data sources into the Analytics Dashboard using Meltano and the Singer ecosystem, starting with Salesforce as the first connector. It is a living document to guide implementation, capture decisions, and support ongoing collaboration.

---

## Project Goals

- Enable users to connect external data sources (starting with Salesforce) to the analytics platform.
- Provide a simple, non-technical, wizard-based UI for managing integrations.
- Ensure all connector configuration is centralized and secure.
- Build a scalable framework to add more connectors in the future.
- Follow best practices for secrets management and user experience.

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

   - [x] Supabase table for integrations
   - [x] API endpoints for CRUD, test, and sync actions
   - [x] Secure secrets management (Supabase, never exposed to frontend)
   - [x] Meltano CLI orchestration for test endpoint
   - [ ] Meltano CLI orchestration for sync endpoint
   - [x] All endpoints tested and working

3. **Frontend**

   - [ ] Add "Integrations" or "Marketplace" section/page
   - [ ] Display list of integrations (GET endpoint)
   - [ ] Add "Add Integration" wizard/modal (POST endpoint)
   - [ ] Enable edit, delete, test, and sync actions from the UI

4. **Meltano Integration**

   - [x] Implement real logic for test endpoint (call Meltano CLI)
   - [ ] Implement real logic for sync endpoint (call Meltano CLI)
   - [ ] Sync integration config with `meltano.yml` if needed
   - [ ] Surface sync/test results and logs

5. **Notifications & Error Handling**

   - [ ] Notification system for sync failures, misconfigurations, and required actions
   - [ ] Actionable alerts with deep links to fix issues

6. **Extensibility**
   - [ ] Schema-driven form generation for new connectors
   - [ ] Connector metadata (name, logo, category, description) for marketplace
   - [ ] Bulk actions and scheduling support

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
