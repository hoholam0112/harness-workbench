# Stage 3: Implementation

**Purpose:** implement the plan's tasks so the experiment can run.

## Must read first

The **always-read core** (SKILL.md → "Progressive context loading, with an
always-read core"): `docs/glossary.md`, `docs/index.md`, the always-read core
knowledge docs, and `docs/agent/guidance/human-feedback.md`. Plus for this stage:

- this loop's `tech-design-spec.md` — what to build and how it is verified;
- this loop's `implementation-plan.md` and its task specs — the tasks, order,
  and checkpoints you execute;
- `docs/agent/knowledge/code-map.md`, then the code you will change.

## Method: TDD, task by task, in plan order

For each task in `implementation-plan.md`:

1. Write a failing test that captures the task's done-condition. Run it and
   confirm it fails for the expected reason.
2. Write the minimal implementation to make it pass. Run the test; confirm
   it passes.
3. Refactor if needed; keep the whole suite green.
4. Commit, referencing the task.
5. Update `state.json.current_task`.

Run tests in the main session — the TDD cycle needs immediate feedback. Do
not delegate the cycle to subagents.

For any long-running process (data prep, training, evaluation), implement the
progress logging the tech design requires: print a step/epoch/sample count, a
key metric, and a timestamp at a regular interval. When you run it, confirm the
log actually advances — this is what stage 4's stall check reads.

## Verification gate

Run the gate (references/verification-gate.md) at each checkpoint the
implementation plan marks — at minimum once after all tasks. Criteria:

- the code matches the Tech Design Spec;
- tests actually verify the acceptance criteria rather than restating the
  implementation;
- long-running processes emit periodic progress to their log as specified;
- no unexplained deviations from the plan.

**Done when:** all tasks complete, the full test suite passes, and the gate
passed. Set state to stage 4.
