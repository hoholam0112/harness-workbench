# LLM Wiki

The agent-generated knowledge base under `docs/agent/`. It keeps project
context current and easy for agents to search and reuse across loops.

## Writing principles

- Keep project context continuously up to date so agents can search and reuse
  it.
- Claim-level sourcing: every claim in an agent-authored document cites its
  source of truth at the file level (and line where useful).
- Update the wiki at the end of each stage, not only at wrap-up. And when the
  user states a durable project fact or constraint, write it to its home
  **immediately** (see SKILL.md "Capture durable facts on the spot") — do not
  defer a must-not-forget fact to wrap-up distillation.
- `docs/CONVENTIONS.md` governs the wiki: document authority (human `raw/` is
  top authority), priority when sources disagree, and the frontmatter spec.

## Layout — what goes where

Default project layout. Bootstrap adapts it to existing project conventions and
records the result in `docs/index.md`; later stages follow `index.md`, not this
default.

```
docs/
  index.md              # navigation for agents (agent-maintained)
  glossary.md           # human<->agent terminology
  CONVENTIONS.md        # wiki rules: authority, priority, frontmatter spec
  human/
    raw/                # human-authored originals (top authority; agents never edit)
  agent/                # agents read and write; humans don't read this
    knowledge/          # about the PROJECT, grouped by topic (code map, artifact map, experiment ledger, long-term plan, data/model/eval notes, ...)
      decisions/        # decision records (ADR): why a choice was made
    guidance/           # about HOW THE AGENT SHOULD WORK: human-feedback (corrections and preferences)
    loops/<loop-id>/    # one dir per loop; its record docs (design doc, spec, plan, report, loop-log, state.json) are kept — later loops cite and read them. Only scratch/intermediate files inside are GC'd
  shared/               # agents write, humans read: reports, summaries (e.g. HTML report)
```

`loop-id` = zero-padded sequence + slug, e.g. `003-lora-rank-sweep`.

The top-level split is by subject: `knowledge/` is about the **project**;
`guidance/` is about **how the agent should work**.

- `docs/agent/knowledge/` — everything about the project, grouped by topic into
  subdirectories. Contents: the code map (`code-map.md` — where code lives and
  where to look to change something), the artifact map (`artifact-map.md` —
  checkpoints, datasets, run outputs and whether to keep them), the experiment
  ledger (`experiment-ledger.md` — every experiment run so far, one row each),
  how the data pipeline works, dataset descriptions, model/architecture notes,
  the evaluation setup, recurring error patterns, environment/infra notes,
  serving targets and the serving numbers measured so far (`serving.md`, when
  the project serves requests), and the long-term plan (`long-term-plan.md`) if
  one exists. These hold the CURRENT
  TRUE STATE — update them in place as the project changes. Also here: the
  whole-project report (`project-report.md`) — a reader-facing summary spanning
  all loops, refreshed at each loop's stage 4 (its HTML render goes to
  `docs/shared/project-report.html`).
  - `docs/agent/knowledge/decisions/` — decision records (ADR), one file per
    significant choice: what was decided, why, alternatives, consequences.
    Examples: "why LoRA rank 16", "why dataset X was dropped". These hold the
    WHY (past-tense). Written at wrap-up by distilling the loop log. Append-only
    — record a new ADR that supersedes an old one rather than rewriting history.
- `docs/agent/guidance/` — how the agent should work. `human-feedback.md`:
  corrections and preferences the human stated, read before every stage's work,
  updated at wrap-up from the loop log.
- `docs/agent/loops/<loop-id>/` — one directory per loop. Its record documents
  (`experiment-design.md`, external-research findings, `tech-design-spec.md`,
  task specs, `implementation-plan.md`, `experiment-report.md`, `loop-log.md`,
  `state.json`) are KEPT — the ledger and maps cite them and later loops read
  them. Only scratch and intermediate working files inside are GC'd. At wrap-up
  the loop log is distilled into `knowledge/decisions/` and
  `guidance/human-feedback.md`, and lasting facts update `knowledge/` in place.
- `docs/shared/` — human-view outputs: the per-loop HTML experiment report
  (`<loop-id>-report.html`), the whole-project HTML report
  (`project-report.html`), summaries.

**Which bucket?** Ask two questions in order:
1. Is it about how the *agent* should work (a correction or preference)? →
   `guidance/human-feedback.md`.
2. Otherwise it is about the *project*. Is it a current fact/state, or the
   reasoning behind a past choice?
   - Current fact/state → `knowledge/` (new topic → new file/subdirectory;
     existing topic → update it in place). Test: if the project changes, you
     would edit this doc.
   - Reasoning behind a choice → `knowledge/decisions/` (new ADR, append-only).
     Test: if the choice changes, you add a new record and leave the old one.

Examples: "the model uses LoRA rank 16" → `knowledge/` (current fact);
"why rank 16 over 32" → `knowledge/decisions/`; "always put charts in the
report" / "explain in plain Korean" → `guidance/human-feedback.md`.

Whenever you add, move, or delete a document, update `docs/index.md`.

**Always-read core.** `docs/index.md` marks a small set of knowledge docs as
"always-read core" — the must-know project facts and constraints an agent needs
before any work (e.g. what the data really is, hard limits, the current goal).
Every stage reads these every time, not selectively (see SKILL.md "Progressive
context loading, with an always-read core"). Keep the set small so "always read"
stays cheap; when you capture a durable fact the agent must not forget, add its
doc to this core in `index.md`. This is the recall half of on-the-spot capture:
a fact written but not marked core can still be skipped.

## Update procedure (used at wrap-up)

1. Compute the change scope:
   `git diff --name-only <state.json.start_commit>..HEAD` plus changes to
   human-authored docs.
2. Dispatch one updater subagent per `docs/agent/knowledge/` subdirectory in
   parallel (Agent tool, `general-purpose` type) with the updater prompt
   below. Updaters write directly — directories are disjoint, so no conflicts.
   Skip `knowledge/decisions/`: ADRs are append-only history, not claims to
   re-sync against code.
3. Dispatch one verifier subagent per updated directory with the verifier
   prompt below. The main session fixes only failed claims, then re-verifies
   the fixed claims once with a fresh verifier. If a claim still fails, delete
   it and note it in `handoff_notes` — do not loop further.
4. Garden the wiki:
   - Place promoted content (see wrap-up) using the "Which bucket?" rule above
     — new topic → new file/subdirectory under `knowledge/`, existing topic →
     update in place.
   - Restructure when a `knowledge/` subdirectory has grown too large to scan
     or its topic has blurred: split or merge subdirectories so each stays a
     single clear topic. Only restructure when the need is real — do not churn
     structure every loop.
   - Update `docs/index.md` to reflect every added, moved, or deleted document,
     and `docs/glossary.md` if terminology changed.

### Updater prompt template

```
You maintain the agent-generated wiki of this project. Update the documents
in {directory} to reflect this loop's changes. Changed files this loop:
{changed file list}

Rules:
- Work claim by claim: check each existing claim against the current code;
  fix stale claims, delete obsolete ones, add claims for new behavior.
- Every claim cites its source file (and line where useful).
- Only edit files inside {directory}. English only.

Return: the files you changed, with a one-line summary each.
```

### Verifier prompt template

```
Verify agent-maintained wiki documents in {directory}. For each claim
modified in this update ({changed docs}), read the cited source and confirm
the claim is accurate. Do NOT modify any files.

Return per claim: file, claim, verdict (accurate | inaccurate |
unverifiable), evidence. Return "ALL ACCURATE" if everything checks out.
```
