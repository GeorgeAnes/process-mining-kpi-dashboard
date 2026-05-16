# Public Event Logs

The default dashboard uses `data/sample_event_log.csv` so the repository runs immediately.

For larger experiments, manually download public event logs and keep them outside git, for example under `data/raw/`.

Useful sources:

- [processmining.org event logs](https://www.processmining.org/event-data.html)
- Hospital Billing event log
- Sepsis Cases event log
- Road Traffic Fine Management event log
- BPI Challenge logs, including 2019 and 2020

Many public logs are large and may have usage terms. Do not commit raw downloaded datasets.

## XES Conversion

Install PM4Py only when needed:

```powershell
pip install pm4py
```

Convert a manually downloaded XES file:

```powershell
python scripts\convert_xes_to_csv.py data\raw\example.xes.gz data\external\example_converted.csv
python scripts\validate_event_log.py data\external\example_converted.csv
```

The converter maps common XES fields into the dashboard schema and fills missing business fields with safe defaults.
