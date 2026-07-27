# Stage 4: Experiment

**Purpose:** run the experiment and report the results.

## Must read first

The **always-read core** (SKILL.md → "Progressive context loading, with an
always-read core"): `docs/glossary.md`, `docs/index.md`, the always-read core
knowledge docs, and `docs/agent/guidance/human-feedback.md`. Plus for this stage:

- this loop's `tech-design-spec.md` — the exact commands, metrics, and
  thresholds that decide each acceptance criterion, the **Serving Measurement
  Plan** this stage executes, and the progress-logging plan the stall check
  relies on;
- this loop's `experiment-design.md` — the acceptance criteria to evaluate, and
  the serving targets in its Constraints that the measured numbers are judged
  against;
- `docs/agent/knowledge/artifact-map.md` — where artifacts are stored and what
  to register.

Report-writing sources are read by the `experiment-report` skill, not here.

## Execution

- Steps per the tech design: data preparation → training → evaluation →
  serving measurement. Run the serving measurement per the spec's **Serving
  Measurement Plan** — its command, under its stated condition, writing to its
  output file. Skip this step only when the plan says "N/A"; do not skip it
  because the accuracy results already look decided. Record the measurement
  condition alongside the numbers in the output file, so the report can cite
  both from one place.
- Run long jobs (anything that could outlive the session) in the background:

  ```
  mkdir -p docs/agent/loops/<loop-id>/logs
  nohup <command> > docs/agent/loops/<loop-id>/logs/<job>.log 2>&1 &
  ```

  Record in `state.json.jobs`: command, PID, log path, expected outputs.
- Record enough to reproduce every run: commit hash, configs, seeds, data
  versions. Keep the run config alongside its outputs.
- Store artifacts (checkpoints, prepared datasets, run outputs, plots) in the
  project's artifact location (see the artifact map). Register each significant
  artifact in `docs/agent/knowledge/artifact-map.md` when produced — path,
  type, this loop, approx size, purpose, retention (`keep`/`temp`), config
  source. This map, not git, tracks artifacts that are too large to commit.

## Monitor and continue

Don't block the session waiting on a job. Schedule a re-check on an interval;
between checks the session can do other work or idle. Each check reads the log
and the PID, decides one of the outcomes below, then re-schedules or moves on.

- Pick the interval from the job's own cadence — about the gap between the
  progress lines the code emits (see tech design / implementation), not
  shorter. A job that logs every ~10 min needs no 1-minute check.
- Use the harness's scheduled re-check mechanism (e.g. a monitor, a scheduled
  wake-up, or a recurring `/loop`) to drive it. On a plain shell, an outer
  polling loop serves the same role. Never hold the session in a blocking
  `sleep`.

Each check, decide from log + PID:

| Signal | Outcome |
|--------|---------|
| Expected outputs exist / log shows completion | **Complete** — verify outputs are non-empty and well-formed, record the run config and register artifacts, then continue to the next step. |
| PID alive, new progress line since last check | **Running** — re-schedule the next check. |
| PID alive, no new progress line for ~30 min | **Stalled** — escalate (`status: escalated`); don't kill or rerun on your own. |
| PID gone, outputs incomplete / log shows error | **Failed** — rerun once at most; if it fails again, escalate instead of retrying. |

Auto-continue only through the experiment's own steps (data preparation →
training → evaluation → serving measurement): when one completes, start the
next without waiting for the user. Stop for the user only at the report-review gate below, and at any
escalation.

**On session resume** (fresh session, jobs still in `state.json.jobs`): for
each job, check whether the PID is alive and still matches the recorded command
(PIDs get reused). If alive, resume monitoring. If gone, decide from the log
whether it finished or failed, then continue or rerun per the table above.
Update `state.json` (`stage`, `current_task`, `jobs`) after every transition so
the next check — or the next session — starts from the truth.

## Report

This stage produces two reports — this loop's experiment report and the
whole-project report. **Invoke the `experiment-report` skill.** It owns the
sections, the writing method, the HTML rendering, and both verification gates.

Do not write a report from this file. There is deliberately no summary of the
procedure here: a summary would get followed instead of the skill, and it would
be the weaker of the two.

When the skill returns, both reports are written and gated.

**Done when:** user has reviewed **both** reports (loop and project). Set state
to stage 5.
