# Integrations Implementation Plan

## Overview

This document outlines the plan for integrating external data sources into the Analytics Dashboard using Meltano and the Singer ecosystem, starting with Salesforce as the first connector. It is intended as a living document to guide implementation, capture decisions, and support ongoing collaboration.

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
- **Config Storage:** Store connector configs securely (encrypted at rest, never exposed to frontend after entry).
- **Extensibility:** Design for easy addition of new connectors and marketplace-style discovery.

---

## User Experience Principles

- **Wizard-based modal UI** for adding/editing integrations (step-by-step, non-technical).
- **Marketplace** for browsing/searching available connectors.
- **Simple forms** for required fields, with advanced options hidden by default.
- **Live validation** and "Test Connection" before saving.
- **Notifications** for sync issues, with clear actions to resolve.
- **No secrets ever displayed after entry.**

---

## Implementation Steps

1. **Documentation & Planning**

   - Create and maintain this documentation folder for all integration-related work.

2. **Frontend**

   - Add "Integrations" or "Marketplace" section/page.
   - Implement "Add Integration" button (opens Radix Dialog wizard).
   - Step 1: Select connector (Salesforce for MVP).
   - Step 2: Show config form (Client ID, Secret, Refresh Token, Instance URL, Start Date, etc.).
   - Step 3: Test connection (calls backend API).
   - Step 4: Review & Save.
   - Show installed integrations with status/logs/actions.

3. **Backend**

   - API endpoints for storing, retrieving, and validating connector configs.
   - Secure secrets management (encrypted storage, never exposed to frontend).
   - Interface with Meltano CLI to add/configure/test connectors.

4. **Meltano Integration**

   - Add and configure `tap-salesforce` in `meltano.yml`.
   - Implement logic to run/test syncs and surface results/logs in the UI.
   - Plan for adding more connectors (marketplace, dynamic config forms).

5. **Notifications & Error Handling**

   - Notification system for sync failures, misconfigurations, and required actions.
   - Actionable alerts with deep links to fix issues.

6. **Extensibility**
   - Schema-driven form generation for new connectors.
   - Connector metadata (name, logo, category, description) for marketplace.
   - Bulk actions and scheduling support.

---

## Open Questions & Decisions

- **Secrets Management:** Use encrypted DB fields for MVP, consider managed secrets service for production.
- **User Permissions:** No permissions for MVP; design with future admin-only access in mind.
- **Connector Marketplace:** Start with Salesforce, but design for easy addition and discovery of more connectors.
- **Notifications:** Use notification bars/toasts with clear, actionable messages.

---

## References

- [Meltano Documentation](https://docs.meltano.com/)
- [Singer SDK](https://sdk.meltano.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

_This document is a living plan. Please update as decisions are made and implementation progresses._
