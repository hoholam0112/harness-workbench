# Artifact Map

<!--
A registry of experiment artifacts beyond code and the wiki: model
checkpoints, prepared/processed datasets, run outputs, metrics files, plots.
Its job is to say what exists, where, which loop made it, and whether to keep
it — so a later loop can find and reuse an artifact, and wrap-up can garbage-
collect safely.

Artifacts are often too large for git, so THIS map — not the git diff — is the
source of truth for what exists. One row per artifact; keep cells short.
Register a significant artifact when it is produced; set/refresh its retention
at wrap-up. How it was produced lives in the loop's report.

Retention: `keep` (needed to reproduce or reuse — final checkpoints, eval
outputs the report cites, expensive-to-rebuild datasets) or `temp` (delete at
wrap-up — intermediate epochs, scratch).
-->

| Artifact | Type | Loop | Size | Purpose | Retention | Config/source |
|----------|------|------|------|---------|-----------|---------------|
| <path> | checkpoint / dataset / output / plot | <loop-id> | <approx> | <short> | keep / temp | <config path or report> |
