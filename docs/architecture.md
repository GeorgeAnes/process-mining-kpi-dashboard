# Architecture

The dashboard has a local-first architecture:

1. The frontend sends the included sample CSV, pasted CSV text, or an uploaded CSV to the FastAPI backend.
2. The backend validates the event-log schema, normalizes timestamps and numeric fields, and builds a case table.
3. Analytics modules calculate KPIs, bottlenecks, variants, SLA breakdowns, rework, directly-follows edges, and recommendation cards.
4. The frontend renders the analysis as KPI cards, charts, tables, a process map, recommendations, and export controls.
5. The optional assistant answers stakeholder questions using deterministic templates by default or LM Studio when explicitly configured.

The core analytics do not depend on an LLM.
