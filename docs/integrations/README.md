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
- **Backend:** API endpoints to securely store and validate connector configs, interface with Meltano CLI.
- **Config Storage:** Store connector configs securely in Supabase (encrypted at rest, never exposed to frontend after entry).
- **Extensibility:** Design for easy addition of new connectors and marketplace-style discovery.

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
- Tests the connection (currently a stub, will call Meltano CLI in future)
- **Response:** `{ "success": true, "message": "Test connection stub: always succeeds." }`

#### **Trigger Sync**

- **POST `/api/integrations/[id]/sync`**
- Triggers a sync (currently a stub, will call Meltano CLI in future)
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
   - [x] All endpoints tested and working

3. **Frontend**

   - [ ] Add "Integrations" or "Marketplace" section/page
   - [ ] Display list of integrations (GET endpoint)
   - [ ] Add "Add Integration" wizard/modal (POST endpoint)
   - [ ] Enable edit, delete, test, and sync actions from the UI

4. **Meltano Integration**

   - [ ] Implement real logic for test and sync endpoints (call Meltano CLI)
   - [ ] Sync integration config with `meltano.yml`
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
- **Meltano CLI Integration:** Next major backend step is to connect test/sync endpoints to Meltano CLI.

---

## References

- [Meltano Documentation](https://docs.meltano.com/)
- [Singer SDK](https://sdk.meltano.com/)
- [Supabase](https://supabase.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

_This document is a living plan. Please update as decisions are made and implementation progresses._
