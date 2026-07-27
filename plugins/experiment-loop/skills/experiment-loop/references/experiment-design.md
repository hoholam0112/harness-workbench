# Stage 1: Experiment Design

**Purpose:** decide what this loop experiments on, and specify it well enough
that tech design can start.

## Must read first

The **always-read core** (SKILL.md → "Progressive context loading, with an
always-read core"): `docs/glossary.md`, `docs/index.md`, the always-read core
knowledge docs, and `docs/agent/guidance/human-feedback.md`. Plus for this stage:

- the previous loop's `experiment-report.md` (its Error Analysis) — what failed
  last time; if this is the first loop, note there is none;
- `docs/agent/knowledge/experiment-ledger.md` — every experiment already run, to
  avoid proposing a repeat;
- the PRD in `docs/human/raw/` and `docs/agent/knowledge/long-term-plan.md` (if
  it exists) — what this loop should serve. Read the PRD's **Serving
  Requirements** section specifically: it decides whether this loop must plan to
  measure serving numbers;
- `docs/agent/knowledge/serving.md` (if it exists) — the serving targets and the
  numbers measured so far, so this loop's Constraints start from the real
  current state rather than the original targets alone;
- `docs/agent/knowledge/code-map.md` — to ground the current state in real code.

## Deliverables

- New loop directory `docs/agent/loops/<loop-id>/` (`loop-id` = next
  zero-padded sequence + slug) with `state.json` initialized: stage 1,
  `in_progress`, `start_commit` set to the current commit hash (used by
  wrap-up's change-scope diff). Also start `loop-log.md` (from
  `../../shared/templates/loop-log.md`) — appended with human choices and inputs through the
  whole loop, distilled at wrap-up.
- `experiment-design.md` in the loop directory, from
  `../../shared/templates/experiment-design-doc.md`: problem definition / data /
  external research / prior error review / hypothesis / search space /
  evaluation method / constraints / acceptance criteria / out of scope.

## Procedure outline

1. Load context progressively (glossary → index → needed docs). Read the
   relevant code to ground the current state.
2. Research recent papers and open-source repositories relevant to the
   problem (web search). Capture findings with sources; write the full
   findings to a separate file and keep only a summary + references in the
   design doc's external-research section.
3. Review prior errors: read the previous loop's experiment report (its Error
   Analysis section) and relevant knowledge/decision notes. Summarize the main
   error patterns and decide which this loop will address. This feeds the
   hypothesis and search space. If this is the first loop, note that there is
   no prior report.
4. Check the experiment ledger (`docs/agent/knowledge/experiment-ledger.md`) —
   the list of every experiment already run. Confirm the proposed direction is
   not a repeat. If it overlaps a completed experiment, state what is different
   and why re-running is worth it (e.g. fixing a flaw in the earlier run). Read
   the referenced report(s) when an entry looks close.
5. Propose 2-3 candidate directions for this loop with trade-offs and a
   recommendation. Always include a free-form option for the user's own
   idea. If the chosen direction doesn't fit one loop, enter stage 0.5 —
   at most once per loop; if the scope still doesn't fit after 0.5,
   escalate instead of re-entering.
6. **Design the search space with the user — don't fix it silently.** Choosing
   a direction does NOT settle its search space; that is a set of decisions the
   user should shape. Decompose it into: which factors to vary, the candidate
   values/range for each, and the run budget (how many runs, how searched).
   Then:
   - Surface the 2-3 **highest-impact** decisions (the ones that most change
     cost or outcome) as separate questions, each with 2-3 options, a free-form
     option, and a clearly marked recommended default.
   - Fill the remaining low-impact choices with recommended defaults, and state
     one reason for each in the doc's Search Space section.
   - Never settle a material factor, its range, or the budget on your own
     without offering the user the choice first.
7. **Settle the serving question before writing Constraints.** Read the PRD's
   Serving Requirements. If the PRD has no such section (a project onboarded
   before this was required), ask the user once — does this project serve
   requests, and if so what are the latency/throughput/cost targets and the
   condition they hold under? Write their answer to its home immediately per
   SKILL.md "Capture durable facts on the spot": into
   `docs/agent/knowledge/serving.md`, marked always-read core in `index.md`, and
   tell the user where you saved it. Do not carry the answer only in this loop's
   doc — the next loop would have to ask again.
   Then decide, as a user question with options, whether THIS loop measures the
   serving targets. Measuring costs run time, so it is the user's call — but a
   loop that changes the inference path and skips measurement should be flagged
   as such when you present the options.
8. Write the design doc. For every other section, present the user a question
   with 2-3 options (include a free-form option for their own input). Keep the
   writing plain — detailed but easy, readable by an undergraduate.
9. Verification gate (../../shared/verification-gate.md). Criteria:
   - the hypothesis is falsifiable;
   - the evaluation method can actually measure the acceptance criteria;
   - the data section matches the real data (checked against code/files);
   - the scope is achievable in one loop;
   - the prior error review reflects the previous loop's actual report (or
     notes that this is the first loop);
   - the experiment is not a duplicate of a ledger entry, or the design says
     what differs and why re-running is justified;
   - the Search Space records which high-impact factors/ranges/budget the user
     chose from offered options, and gives a reason for every value filled by a
     default — no material factor was fixed silently;
   - **serving**: if the project serves requests (PRD Serving Requirements), the
     Constraints section restates the targets as concrete numbers — each with
     the condition it must hold under — and states which of them this loop
     measures, or gives one sentence of why it measures none. A Constraints
     section that points at the PRD instead of restating the numbers, or that
     omits the measure/don't-measure decision, is a Major issue. If the project
     has no serving, Constraints says so and repeats the PRD's reason.
10. Request user review (`status: awaiting_user_review`); revise until
    approved.

**Done when:** user approves the doc. Set state to stage 2.
