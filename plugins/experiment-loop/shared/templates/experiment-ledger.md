# Experiment Ledger

<!--
A short INDEX of every experiment tried, across ALL loops. Its job is fast
scanning so a new loop's design can spot repeats — not to hold the full record.
The full detail lives in each loop's report; the Report column links to it.

- One row per experiment. A loop that runs several variants gets several rows
  (repeat the loop id, or use 〃 for the shared report).
- Keep every cell to a short phrase. If it needs a paragraph, it belongs in the
  report, not here.
- Created at bootstrap; a row is appended per experiment at each loop's wrap-up.
-->

| Loop | Hypothesis | Key setup | Key result | Outcome | Report |
|------|-----------|-----------|------------|---------|--------|
| <loop-id> | <short: what it tested> | <short: model / data / key config> | <short: headline metric> | success / fail / mixed | docs/agent/loops/<loop-id>/experiment-report.md |
