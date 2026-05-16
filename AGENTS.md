# Agent Notes

This repository is a portfolio demo for process mining, service operations analytics, and business transformation reporting.

## Local Run

Use PowerShell on Windows:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
python -m uvicorn backend.app.main:app --reload --port 8020

cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend runs on `http://127.0.0.1:5174`.

## Verification

```powershell
python -m pytest
cd frontend
npm.cmd test
npm.cmd run build
```

## Guardrails

- Keep deterministic analytics as the default path.
- Optional LLM support is limited to OpenAI-compatible local endpoints such as LM Studio.
- Do not commit `.env`, downloaded public event logs, raw BPI datasets, virtual environments, `node_modules`, or build output.
- Do not add real client names, university-restricted files, credentials, or absolute local OneDrive paths to public docs or source.
- PM4Py is optional and only used by `scripts/convert_xes_to_csv.py` when the user manually installs it.
