# Methodology

This repository uses transparent event-log calculations intended for a portfolio demo and management review.

## KPI Definitions

- Case duration: last event timestamp minus first event timestamp per case.
- Median and mean duration: calculated over case durations in hours.
- SLA violation: case duration exceeds the first available `sla_hours` value for the case.
- Total cost: sum of event-level `cost`.

## Bottlenecks

Waiting time before an activity is the elapsed time between the previous event and the current event in a case. Bottleneck transitions are directly-follows pairs ranked by average elapsed hours.

This is an inter-event proxy, not a fully instrumented activity-duration measurement.

## Variants

A process variant is the ordered activity sequence for a case. Variant coverage is the share of cases represented by a sequence.

## Rework

A case has rework if at least one activity repeats within the same case. The dashboard reports rework rate and the most repeated activities.

## SLA Root-Cause Views

SLA breakdowns group cases by priority, department, resource, and customer segment. These views are diagnostic starting points, not causal proof.
