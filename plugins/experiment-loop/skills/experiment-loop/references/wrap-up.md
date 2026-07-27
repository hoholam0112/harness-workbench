# Stage 5: Wrap-Up

**Purpose:** leave the project clean and the knowledge base current; close
the loop.

## Must read first

The **always-read core** (SKILL.md → "Progressive context loading, with an
always-read core"): `docs/glossary.md`, `docs/index.md`, the always-read core
knowledge docs, and `docs/agent/guidance/human-feedback.md`. Plus for this stage:

- this loop's `loop-log.md` — the raw record to distill into the wiki;
- this loop's `experiment-report.md` — what the ledger row cites;
- `docs/agent/knowledge/artifact-map.md` — to collect artifacts (not the git
  diff);
- `docs/agent/knowledge/experiment-ledger.md` and
  `docs/agent/knowledge/long-term-plan.md` (if it exists) — to append/update;
- `docs/CONVENTIONS.md` — the wiki rules the update must follow.

## 1. Garbage collection

Identify code, configs, and docs made obsolete by this loop (superseded
experiments, dead flags, scratch scripts). Confirm with the user before
deleting anything this loop did not create. Commit deletions separately.

Keep this loop's record documents in `docs/agent/loops/<loop-id>/` (design
doc, spec, plan, report, state.json) — the ledger and maps cite them and later
loops read them. GC inside a loop directory targets only scratch and
intermediate working files, never these records.

Then collect artifacts using the artifact map
(`docs/agent/knowledge/artifact-map.md`) — not the git diff, since artifacts
are often untracked. For each entry: keep what is needed to reproduce or reuse
(final checkpoints, eval outputs the report cites, expensive-to-rebuild
datasets); delete `temp` ones (intermediate epochs, scratch). Confirm before
deleting anything large or shared across loops. Update the map for every
artifact deleted or kept.

## 2. Wiki update and promotion

**Invoke the `experiment-wiki` skill.** It runs the change-scope diff, the
parallel updater and verifier subagents, the gardening pass, and the promotion
of this loop's log into `knowledge/`, `knowledge/decisions/`, and
`guidance/human-feedback.md`. Do not run those steps from here.

Give it this loop's `start_commit` from `state.json` and the path to this
loop's `loop-log.md`.

## 3. Append to the experiment ledger

Append one short row per experiment run this loop (a loop with several variants
gets several rows) to `docs/agent/knowledge/experiment-ledger.md`: loop id,
hypothesis, key setup, key result, outcome — citing this loop's report. Keep
cells short; detail stays in the report. This keeps the ledger the single
up-to-date index that stage 1 checks to avoid repeats.

## 4. Tools & hooks review

Review this loop's friction: commands typed repeatedly, mistakes a hook
could have caught. Add a tool or hook ONLY if the need occurred at least
twice this loop. Avoid overbuilding — none is a fine outcome.

## 5. Close the loop

- Write `state.json.handoff_notes`: what the next loop should know —
  unfinished threads, surprises, recommended next goal.
- Update `docs/agent/knowledge/long-term-plan.md` if it exists.
- Set `status: "done"`.

**Done when:** all five sections are complete.
