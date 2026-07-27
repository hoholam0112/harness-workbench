# Stage 2: Tech Design

**Purpose:** design the code changes needed to run the experiment, grounded
in the actual codebase.

**Code grounding is mandatory here:** read every module the design touches
before writing AS-IS. The AS-IS section must cite real files. Start from the
code map (`docs/agent/knowledge/code-map.md`) to find where to look, but the
code is the source of truth — when the map and the code disagree, trust the
code and fix the map.

## Must read first

The **always-read core** (SKILL.md → "Progressive context loading, with an
always-read core"): `docs/glossary.md`, `docs/index.md`, the always-read core
knowledge docs, and `docs/agent/guidance/human-feedback.md`. Plus for this stage:

- this loop's `experiment-design.md` — what the design must enable;
- `docs/agent/knowledge/code-map.md`, then **the actual code modules** the design
  will touch (code grounding is mandatory — see above).

## Deliverables (both in the loop directory)

- `tech-design-spec.md` from `../../shared/templates/tech-design-spec.md`:
  - AS-IS / TO-BE, based on the Experiment Design Doc;
  - acceptance criteria restated technically — the exact command, metric,
    and threshold that decides each one;
  - serving measurement plan: for each serving target in the design doc's
    Constraints, the command, the measurement condition (hardware, batch size,
    concurrency, input length, request count, warm-up), the output file, and
    the pass/fail threshold — plus how the three cost figures (per-request
    inference, this loop's one-off training, monthly estimate with its assumed
    traffic) are computed. "N/A" with the design doc's reason if this loop
    measures none;
  - verification plan: how the code will be reviewed and tested;
  - progress observability: for every long-running process (data prep,
    training, evaluation), specify how it reports progress at a regular
    interval — a step/epoch/sample count, a key metric, and a timestamp
    written to its log — so a watcher can tell it is alive and advancing.
- `implementation-plan.md` from `../../shared/templates/implementation-plan.md`:
  - tasks (each specified per `../../shared/templates/task-spec.md`), their order and
    dependencies, and verification checkpoints — covering implementation
    through verification.

## Procedure outline

1. Write the spec, then the plan.
2. Verification gate (../../shared/verification-gate.md). Criteria:
   - AS-IS matches the real code;
   - TO-BE is sufficient to run the designed experiment;
   - every acceptance criterion has a technical verification;
   - **serving**: every serving target in the design doc's Constraints has a
     measurement plan with its measurement condition spelled out, an output
     file, and a threshold — a command with no stated hardware/batch/concurrency
     produces a number nobody can reproduce or compare, so that is a Major
     issue. The three cost figures each say how they are computed, and the
     monthly estimate names the traffic it assumes. If the plan says "N/A", the
     reason matches the one in the design doc rather than being invented here;
   - every long-running process has a progress-logging plan;
   - tasks are ordered, dependency-correct, and individually testable.
3. Request user review; revise until approved.

**Done when:** user approves both documents. Set state to stage 3.
