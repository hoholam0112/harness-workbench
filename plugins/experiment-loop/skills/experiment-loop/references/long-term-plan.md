# Stage 0.5: Long-Term Plan

Entered from stage 1 when the user's requirement doesn't fit a single loop.
If unsure whether it fits, ask the user.

**Purpose:** break a multi-loop requirement into a sequence of loop-sized
goals.

## Must read first

The **always-read core** (SKILL.md → "Progressive context loading, with an
always-read core"): `docs/glossary.md`, `docs/index.md`, the always-read core
knowledge docs, and `docs/agent/guidance/human-feedback.md`. Plus for this stage:

- the PRD in `docs/human/raw/` — the overall requirement being decomposed;
- `docs/agent/knowledge/long-term-plan.md` if it already exists — extend it,
  don't restart.

## Deliverables

- `docs/agent/knowledge/long-term-plan.md` (project-persistent): an ordered list of
  loop-sized goals, each with — goal, why it needs its own loop,
  dependencies, rough success criterion. Mark which goal the next loop
  takes.

## Procedure outline

1. Clarify the overall requirement with the user.
2. Decompose into loop-sized goals; present the plan; revise until approved.
3. Maintain the document at every loop's wrap-up: mark finished goals done,
   adjust the remainder.

While working in stage 0.5, set the current loop's `state.json.stage` to
`0.5` (and back to `1` on return), consistent with the update-on-every-
transition rule.

**Done when:** user approves the plan. Return to stage 1 with the first
unfinished goal as this loop's scope.
