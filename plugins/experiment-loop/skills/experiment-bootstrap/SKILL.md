---
name: experiment-bootstrap
description: Onboards a project onto the ML experiment loop - stage 0, run once per project. Use when the user asks to set up, onboard, or initialize the experiment loop - "이 프로젝트 온보딩해줘", "실험 루프 세팅해줘", "부트스트랩 실행해줘", "실험 루프 붙여줘" - or when docs/index.md does not exist so the loop cannot run yet. Restructures the docs tree, seeds the LLM wiki from existing code, writes CLAUDE.md, guides the user through a PRD, and identifies required MCP servers.
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

# Stage 0: Bootstrap (once per project)

Onboard a project onto the experiment loop. Run only when `docs/index.md`
does not exist.

**Purpose:** understand the project and restructure its documentation so the
loop can run on it.

## Must read first

The always-read core does not exist yet — this stage creates it. Instead, read
the project itself before proposing any layout: the `README`, any existing docs,
the code structure, the experiment/training entry points, and the test setup
(procedure step 1). Read the code, not just the docs.

## Deliverables

- Doc layout per the `experiment-wiki` skill's "Layout — what goes where"
  section, adapted to the project's existing conventions.
- `docs/glossary.md` — terminology used in the project and by the user
  (the one document where Korean is allowed).
- `docs/index.md` — what every document is for and when an agent should read
  it, including the layout decisions made here. Later stages navigate by
  this file. It also marks the **always-read core**: the small set of knowledge
  docs holding must-know project facts and constraints that every stage reads
  every time (see the `experiment-wiki` skill's "Always-read core" section).
  Seed this set with the core facts learned during onboarding.
- `docs/CONVENTIONS.md` — the wiki's rules: document authority (human `raw/`
  is top authority), priority when sources disagree, and the frontmatter spec.
- Seeded `docs/agent/knowledge/` — initial knowledge documents filled from the
  existing code and docs (not just empty directories): data pipeline, dataset,
  model/architecture, evaluation setup, environment. Each claim cites its
  source file. Includes:
  - `code-map.md` (from `../../shared/templates/code-map.md`) — where code lives and where
    to look to change something: layout, entry points, key modules, configs.
    This is where the step-1 code analysis is written down instead of thrown
    away.
  - `experiment-ledger.md` (from `../../shared/templates/experiment-ledger.md`) — start it
    from any experiments already run before onboarding, else an empty table.
  - `artifact-map.md` (from `../../shared/templates/artifact-map.md`) — registry of
    non-code, non-doc artifacts (checkpoints, datasets, run outputs, plots).
    Record the project's artifact storage convention (where they live) and any
    artifacts that already exist; else an empty table.
  - `serving.md` — **only if the PRD's Serving Requirements says the project
    serves requests.** Restate the targets (latency p50/p95 with the condition
    they hold under, throughput, per-request and monthly cost ceilings with the
    traffic the monthly figure assumes), plus any serving numbers already
    measured before onboarding and how they were measured. Mark this doc
    **always-read core** in `index.md` — every later loop must see the targets
    without being told to look. If the PRD says "No serving", do not create the
    file.
- `docs/agent/guidance/human-feedback.md` (from `../../shared/templates/human-feedback.md`)
  — log of human corrections and stated preferences, read before every stage's
  work. Seed it with any standing preferences the user gives during onboarding;
  else empty.
- `CLAUDE.md` at the project root (English) — harness guidance for Claude Code:
  build/test/run commands, project conventions, and the communication rule
  (explain to the user in plain Korean; see SKILL.md "Plain language").
- A PRD in `docs/human/raw/`. If none exists, guide the user through writing one
  using `../../shared/templates/prd.md`: interview them section by section — the user
  authors the content, you scribe. Settle **Serving Requirements** explicitly:
  it is the switch that decides whether every later loop must measure serving
  numbers, so "we'll figure it out later" is not an acceptable answer — get
  either the targets or "No serving" with a reason. If a PRD already exists but
  has no Serving Requirements section, ask the user for it and scribe their
  answer into the PRD — read the wording back to them before saving, since
  `human/raw/` is theirs.
- Required MCP servers identified and the user guided to install them (see
  procedure step 5). Bootstrap does not install them itself.

## Procedure outline (adapt as needed)

1. Analyze the project: README, existing docs, code structure,
   experiment/training entry points, test setup. Read the code, not just the
   docs.
2. Propose the layout adaptation to the user (what moves where, what gets
   created). Get agreement before moving any files.
3. Restructure. **Invoke the `experiment-wiki` skill** for the layout rules -
   the human/agent split, the knowledge/guidance/decisions buckets, and where
   each kind of document goes. Do not reproduce those rules here. Apply them to
   this project's existing docs, then write `glossary.md` and `CONVENTIONS.md`.
4. Seed the wiki: from the code and existing docs, write the initial
   `docs/agent/knowledge/` documents (code map, data pipeline, dataset, model,
   eval setup, environment). Write the step-1 code analysis into `code-map.md`.
   Decide where experiment artifacts are stored and record the convention plus
   any existing artifacts in `artifact-map.md`. Settle the PRD's Serving
   Requirements now rather than at step 6 — the answer decides whether to seed
   `serving.md` here and mark it always-read core. Create
   `docs/agent/guidance/human-feedback.md` (seeded with any standing
   preferences, else empty). Ground every claim in a source file. Then write
   `CLAUDE.md` at the project root with build/test/run commands, conventions,
   and the plain-Korean communication rule.
5. Identify required MCP servers for this project's work (e.g. web search for
   paper research, a Git host, a data source). List them for the user with
   why each is needed, and guide them to install — do not install yourself.
   If none are needed, say so.
6. Ensure the PRD exists. Then write `index.md` last — its presence is how
   the dashboard detects a completed onboarding, so it must not exist before
   everything else is in place.

**Done when:** layout exists, wiki seeded, `CLAUDE.md` written, MCP servers
handled, `index.md` reflects it, PRD present, and the user confirms. Then
start the first loop (stage 1).
