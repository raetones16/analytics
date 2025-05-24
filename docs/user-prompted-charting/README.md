# User-Prompted Charting: Requirements & Technical Delivery

## Overview

Enable non-technical users to create new charts or stat widgets by describing what they want in natural language. The system, powered by OpenAI GPT-4.1-mini, interprets the request, guides the user through clarifications, previews the data, and generates the chart or stat widget—no code required.

---

## User Experience Flow

### Entry Point

- "Create Chart" button on the dashboard (modal or side panel for now).
- Future: persistent chat interface for ongoing data exploration.

### Prompt & LLM Interpretation

- User enters a free-form request (e.g., "Show me ARR over time").
- LLM parses intent, maps to available data fields (using a data dictionary/schema).
- **Time granularity is always set globally and not prompted during chart creation.**

### Clarification & Data Selection

- If the LLM is unsure, it asks clarifying questions (e.g., "Which field represents ARR?").
- System presents a preview of the data to be charted (table/grid view).
- User can confirm or adjust the data selection (fields, filters, groupings).
- If the requested data is unavailable, the LLM directs the user to the integration's data points tab.

### Chart/Stat Widget Type & Options

- LLM suggests the most appropriate visualization (stat widget vs. full chart), but user has final say.
- Stat widgets: single value with label (as per current dashboard), always at the top, not reorderable.
- Full charts: user can choose from allowed types (line, bar, pie, etc.), can be reordered.
- User can customize field/metric labels (default to source field names, but editable).
- Minimal customization: chart title and axis labels can be edited, but no advanced formatting.
- All charts/widgets respect global time filter.

### Chart/Widget Creation & Dashboard Integration

- Confirmed chart/widget is added to the dashboard.
- Max 20 charts/widgets per dashboard (stat widgets included in quota).
- Stat widgets always at the top; other charts can be reordered, resized, or deleted.

### Data Transparency

- Users can preview the underlying data for any chart/widget during creation.
- No export functionality for now.

### Editing

- Editing is for tweaking visualization type, labels, etc.—not for changing the underlying data.
- To change the data, users should delete and recreate the chart/widget.
- Editing flow: define data first, then allow visual customization.

### Data Refresh

- Data refreshes on page reload only.

### Error Handling

- If chart/widget creation fails (e.g., missing data), system explains the issue in clear, natural language and suggests next steps.

---

## Requirements

- **LLM Provider:** OpenAI GPT-4.1-mini (upgrade to full 4.1 if needed).
- **Data Dictionary:**
  - Each integration exposes a list of available fields/metrics (visible on the integrations page, e.g., a "Data Points" tab).
  - LLM uses this dictionary to map user requests to available data.
- **Chart/Widget Limits:** Max 20 per dashboard (stat widgets included).
- **Stat Widgets:** Single value + label, always at top, not reorderable.
- **Field Naming:** Default to source field names, but user can provide custom labels.
- **Editing:** Only visualization and labels; not data source/fields.
- **Roles:** Single super user for now; future: read/write roles at dashboard/chart level.
- **Accessibility:** No specific requirements at this stage.
- **Analytics:** Not required for MVP.

---

## Technical Considerations

- **LLM Integration:**
  - Use OpenAI API with GPT-4.1-mini.
  - Prompt engineering to ensure reliable mapping from user language to data schema.
  - Multi-turn conversation support for clarifications.
- **Data Schema Awareness:**
  - Expose integration data dictionaries to the LLM (field names, types, descriptions, user-friendly aliases).
- **Dynamic Chart Generation:**
  - Extend current charting system to accept dynamic configs.
  - Stat widgets and charts share a common config structure.
- **UI Components:**
  - Modal/side panel for chat flow.
  - Data preview table/grid (e.g., TanStack Table).
  - Chart/Stat widget preview and configuration form.
- **Error Handling:**
  - Natural language explanations for failures or missing data.
- **Security:**
  - No sensitive data in LLM prompts or previews.
- **Extensibility:**
  - Design for future integrations, sharing, exporting, and advanced formatting.

---

## Delivery Phases

### Phase 1: Foundations

- Expose data dictionary for each integration (UI + API).
- Add "Create Chart" entry point and modal/side panel.
- Integrate OpenAI GPT-4.1-mini for intent parsing and clarification.
- Implement stat widget and chart config structure.

### Phase 2: Chart/Widget Creation Flow

- Implement chat-driven chart/stat widget creation flow.
- Data preview and field/label customization.
- Add to dashboard with quota enforcement and stat widget placement rules.
- Editing for visualization type and labels.
- Error handling and user guidance.

### Phase 3: Polish & Extensibility

- Refine LLM prompts and clarifications.
- Improve UI/UX for data preview and editing.
- Prepare for future features: sharing, exporting, persistent chat, roles, analytics.

---

## Future Extensibility

- Persistent chat interface for ongoing data Q&A.
- Multi-user roles and permissions.
- Chart/data export and sharing.
- Advanced stat widgets (change indicators, mini trends).
- Central branding and formatting controls.
- Analytics/telemetry for feature usage.

---

## Assumptions & Notes

- All requirements and flows are based on current single-user, single-dashboard context.
- LLM provider is OpenAI GPT-4.1-mini for MVP.
- No accessibility or analytics requirements for MVP, but design should not preclude future enhancements.

---

_This document is a living plan. Please update as decisions are made and implementation progresses._
