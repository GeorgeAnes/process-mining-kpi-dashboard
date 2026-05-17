# WIN95 UI Overhaul Plan

## Summary
Overhaul the frontend into a Windows 95/98-inspired enterprise process-mining cockpit while preserving the current FastAPI backend, analytics logic, API contracts, synthetic IT service event log, backend port `8020`, and frontend port `5174`.

The app remains React + Vite + TypeScript with Recharts. It uses route-backed windows via `react-router-dom` and a manually implemented retro design system instead of `98.css`, so charts, responsive behavior, and recruiter polish stay under direct control.

## Current Architecture And API Assumptions
- Current frontend is a single-screen dashboard in `frontend/src/App.tsx`; it owns dataset loading, CSV text, analysis result, loading state, and errors.
- API client uses `VITE_API_BASE_URL || "/api"`; Vite proxies `/api` to `http://127.0.0.1:8020`.
- Existing endpoints remain unchanged: `GET /health`, `GET /datasets`, `GET /datasets/sample`, `POST /analyze`, `POST /export`, and `POST /assistant`.
- Existing `AnalysisResponse` data is sufficient for the new UI: KPIs, bottlenecks, SLA breakdowns, variants, rework, process edges, recommendations, executive summary, and warnings.
- Synthetic IT service event log must still auto-load and auto-analyze when the backend is available.

## Proposed Routes And Window Model
- `/desktop`: default retro desktop / boot screen.
- `/overview`: high-level process cockpit window.
- `/analysis/throughput`: cycle-time and throughput view.
- `/analysis/bottlenecks`: bottleneck transition view.
- `/analysis/sla`: SLA breakdown view.
- `/analysis/variants`: variant and process-map view.
- `/analysis/rework`: repeated-activity and rework view.
- `/report`: executive report window.
- Shared state lives in `ProcessMiningProvider`; navigation feels like opening desktop icons, but routes remain deep-linkable and testable.

## Retro Design System
- Colors: shell gray `#c0c0c0`, shadow `#808080`, highlight `#ffffff`, active title bar `#000080`, black text, and muted status colors for KPI severity.
- Typography: `Tahoma`, `MS Sans Serif`, `Arial`, sans-serif; monospace only for CSV/data previews.
- Window components: bevelled panels, title bars, menu bars, status bars, resize-grip visuals, dialog-style alerts, and inset content wells.
- Buttons and inputs: sharp bevels, pressed/disabled states, and visible focus outlines.
- Icons: CSS/pixel-style desktop icons labelled `Throughput.exe`, `Bottlenecks.exe`, `SLA Monitor.exe`, `Variants.exe`, `Rework.exe`, and `Executive Report.txt`.
- Tone: serious legacy enterprise system, not a parody or game interface.

## Screen And Window Breakdown
- Desktop / Boot Screen: icon grid, dataset status widget, backend status widget, CSV upload/paste controls, taskbar status.
- Overview Window: KPI cards, event-log summary, SLA violation rate, cycle-time overview, and recommendation cards.
- Detailed Analysis Windows: focused views for throughput, bottlenecks, SLA, variants, and rework.
- Executive Report Window: executive summary, recommendations, assistant panel, and Markdown/JSON export actions.

## Component Breakdown
- Shell/layout: `RetroDesktopShell`, `Taskbar`, `DesktopIcon`, `WinWindow`, `WinMenuBar`, `WinStatusBar`, `BackendStatusWidget`, `DatasetStatusWidget`.
- State: `ProcessMiningProvider`, `useProcessMining`.
- Views: `DesktopScreen`, `OverviewWindow`, `AnalysisWindow`, `ExecutiveReportWindow`.
- Existing chart/content components are reused where practical and restyled into bevelled window panels.

## Data Flow And State Management
- On app start, call `/health`, `/datasets`, `/datasets/sample`, then `POST /analyze` for the sample dataset if the backend is available.
- If the backend is offline, keep the desktop visible and show the exact backend command:
  `python -m uvicorn backend.app.main:app --reload --port 8020`
- Upload/paste CSV updates shared CSV text and can rerun `POST /analyze`.
- No Redux/Zustand; React context plus derived selectors is sufficient.
- The assistant remains optional and deterministic by default.

## Accessibility And Readability Constraints
- Desktop icons are real buttons/links with keyboard focus.
- Window title bars and menu buttons use high-contrast text.
- Severity states include text labels, not color alone.
- Charts must remain readable on laptop screens.
- Offline and analysis errors must be clear and actionable.
- Responsive behavior collapses windows into stacked content below laptop width.

## Playwright E2E Plan
Do not add Playwright in this implementation chunk. Future tests should verify:
- `/desktop` loads and shows desktop icons.
- Backend offline state shows a helpful message.
- Icons open the correct route/window.
- `/overview` renders KPI summary from mocked API data.
- Analysis windows render their charts/tables.
- Export/report route renders and download actions are present.
- Navigation back to desktop does not clear loaded analysis.

## Implementation Chunks And Definition Of Done
1. Planning artifact: create this file.
2. Routing and shared state: add `react-router-dom`, provider, routes, and backend health check.
3. Retro shell and desktop: add desktop, taskbar, icons, backend/dataset widgets.
4. Overview window: rebuild high-level KPI/recommendation layout.
5. Detailed analysis windows: split bottlenecks, SLA, variants, rework, and throughput into focused routes.
6. Executive report window: restyle report export and assistant into retro document/window UI.
7. Testing and polish: update Vitest smoke tests and run backend/frontend verification.

## Risks And Non-Goals
- Do not change backend analytics, schemas, or endpoint behavior.
- Do not overuse novelty styling at the cost of chart readability.
- Do not add heavy window-manager libraries.
- Do not make draggable/resizable windows in v1.
- Do not commit generated screenshots or Playwright artifacts unless intentionally used in docs.
- Do not make the app dependent on public datasets.
