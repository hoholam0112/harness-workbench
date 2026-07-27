---
name: experiment-wiki
description: Records facts and decisions into the project's LLM wiki and keeps it current. Use whenever the user asks to record, save, or document something - "이거 기록해둬", "문서에 남겨줘", "위키에 저장해줘", "위키 갱신해줘", "이 결정 남겨줘", "정리해서 남겨줘" - and whenever the user states a durable project fact or constraint that must outlive this session, and at loop wrap-up when the wiki needs updating. Owns the rules for which document a piece of information belongs in. Always use this skill instead of editing wiki documents directly.
---

<!-- BEGIN shared-principles -->
## Core Principles

Paths below are relative to this skill's own directory.

- **Code grounding.** Docs are for fast context only. Read the actual code
  before judging, implementing, or verifying. When docs and code disagree,
  trust the code.
- **Claim-level sourcing.** Every claim in an agent-authored document cites its
  source file (and line where useful).
- **Template compliance (binding).** Create every document by copying its
  template from `../../shared/templates/`, never by writing freely. Keep every
  section heading unrenamed and in order, fill each with real content, delete
  every guidance comment and `FILL` marker, and meet stated quantities
  literally. "N/A" needs one sentence of why. The template is a floor, not a
  cap — additions are welcome. Full rules:
  `../../shared/template-compliance.md`. A deviation is a Major issue, not a
  stylistic one.
- **Always-read core.** On user input, always read `docs/glossary.md`,
  `docs/index.md`, every knowledge doc that `index.md` marks as always-read
  core, and `docs/agent/guidance/human-feedback.md`. Read these every time —
  judging whether you need them is exactly how known facts get skipped. Align
  the user's terms against the glossary, and ask them rather than guess when a
  term they used is ambiguous. Only then open what the specific task needs.
- **Log human input.** Append every human choice, instruction, correction, and
  stated preference to `docs/agent/loops/<loop-id>/loop-log.md` as it happens.
  Completeness beats polish.
- **Durable facts go to the wiki immediately.** The moment the user states a
  fact or constraint that stays true beyond this turn, invoke the
  `experiment-wiki` skill and write it to its home now — not at wrap-up. Then
  tell the user in one line where you saved it. If the user tells you something
  you should already know, that is proof the fact was never captured or is not
  being read: capture it right then, and fix why it was not read.
- **Escalation.** Stop, set `status: "escalated"` in `state.json`, record the
  question in `pending_decisions`, describe the situation to the user, and
  present 2-3 options.
- **Verification gates** run in subagents per
  `../../shared/verification-gate.md`. Subagents verify; they never execute the
  work. After a gate passes, summarize what was produced before moving on.
- **Language.** All docs and code in English. `docs/glossary.md` may contain
  Korean. Talk to the user in Korean (technical terms in English).
- **Plain language.** State the conclusion first, then a short reason. One idea
  per sentence; keep sentences short. Gloss a technical term the first time you
  use it. Prefer plain Korean over transliterated English (write "출처를 따라갈
  수 있는지", not "추적성"). Prefer concrete verbs over abstract nouns.
<!-- END shared-principles -->

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
  **immediately** (see "Capture on the spot" below) — do not
  defer a must-not-forget fact to wrap-up distillation.
- `docs/CONVENTIONS.md` governs the wiki: document authority (human `raw/` is
  top authority), priority when sources disagree, and the frontmatter spec.

## Capture on the spot

The loop log is a raw dump distilled at wrap-up. That is too slow for a fact
you must not forget. When the user states a durable project fact or constraint
- about the data, the system, the goal, or a hard limit - write it to its home
**now**: `knowledge/` per the "Which bucket?" rule below, a working preference
to `guidance/human-feedback.md`, a term to `docs/glossary.md`. Cite its source,
mark it always-read core in `docs/index.md` if it is core, then tell the user
in one line where you saved it. Logging it only to the loop log does not count.

If the user tells you something you should already know - restating a fact,
re-explaining context, correcting the same mistake twice - treat it as proof
the fact was never captured or is not being read. Capture it right then, and if
it was already written, fix why it was not read (wrong location, not marked
always-read). Close the leak, not just the symptom.

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
Every stage reads these every time, not selectively (see "Always-read core"
above, in this file's Shared Principles). Keep the set small so "always read"
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
   - Place promoted content (see below) using the "Which bucket?" rule above
     — new topic → new file/subdirectory under `knowledge/`, existing topic →
     update in place.
   - Restructure when a `knowledge/` subdirectory has grown too large to scan
     or its topic has blurred: split or merge subdirectories so each stays a
     single clear topic. Only restructure when the need is real — do not churn
     structure every loop.
   - Update `docs/index.md` to reflect every added, moved, or deleted document,
     and `docs/glossary.md` if terminology changed.
   - If this loop changed the code structure (moved files, new entry
     points/modules), refresh `docs/agent/knowledge/code-map.md`.
5. Promote loop-scoped content: consolidate the loop log
   (`docs/agent/loops/<loop-id>/loop-log.md`) into the persistent stores. Sort
   each important item by the "Which bucket?" rule above:
   - A rule about HOW the agent should work (a correction or preference to
     carry forward) → `docs/agent/guidance/human-feedback.md`.
   - A choice about WHAT to build or run, and why → an ADR in
     `docs/agent/knowledge/decisions/` (`../../shared/templates/decision-record.md`).
   - A current fact about the project (new/changed behavior, config, data) →
     update the relevant `docs/agent/knowledge/` doc in place.

   If this loop measured serving numbers, update
   `docs/agent/knowledge/serving.md` with them — the measured
   latency/throughput/cost, the condition they were measured under, and which
   targets are now met. These are current facts about the project, so they
   belong in the doc, not only in this loop's report; the next loop's stage 1
   reads them to see where serving actually stands. If the doc does not exist
   yet (serving targets settled after onboarding), create it and mark it
   always-read core in `docs/index.md`.

   The loop's record documents (including the log) stay in place; only
   scratch is collected during garbage collection.

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
