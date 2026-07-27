# Verification Gate (shared)

Verify a stage's artifacts with a subagent before moving on. Used by stages
1, 2, 3 (per plan checkpoints), and 4 (report). Stage 5 (wiki) uses its own
prompts and flow, defined in wrap-up.md.

## Protocol

1. Dispatch ONE reviewer subagent (Agent tool, `general-purpose` type) with
   the prompt template below, filled with: the artifact paths, **the template
   path each artifact was created from** (so the reviewer can compare structure),
   and the stage's verification criteria (each stage reference lists its
   criteria).
2. Triage returned issues:
   - Issues flagged `decision_needed: yes` → escalate immediately (see
     SKILL.md), regardless of severity or round count.
   - Defects: fix them in the main session immediately.
3. Re-verify with a FRESH subagent (never reuse the previous reviewer — avoid
   anchoring). At most 3 fix-and-reverify rounds. Record the current round
   in `state.json` (e.g. `gate_round`) so the cap survives interruption;
   clear it when the gate exits.
4. Exit:
   - Only Minor issues remain → pass; note remaining Minors and proceed.
   - Major or Critical remains after 3 rounds → escalate.
5. After the gate passes, summarize to the user what this stage produced —
   in plain Korean an undergraduate can follow, jargon only when necessary
   (see SKILL.md "Plain language"). Cover what was done, what the gate found
   and how it was resolved, and any remaining Minors, before moving on.

## Rules

- Pass **file paths, not content**. The reviewer reads code and artifacts
  itself (code grounding).
- The reviewer **reports only, never modifies files**. All fixes happen in
  the main session.
- Severity follows the prompt's definitions below: template deviations and
  thin/placeholder/missing sections are **Major** (not stylistic), alongside
  anything that harms experiment validity or reproducibility.

## Reviewer prompt template

```
You are reviewing artifacts for an ML experiment loop. Report issues; do NOT
modify any files.

Artifacts to review (each with the template it must follow):
- {artifact path}  ← template: {template path}

Verification criteria for this stage:
- {criteria from the stage reference}

Ground every finding in the actual files and code — read them directly. When
documents and code disagree, the code is the truth.

FIRST, check template compliance for each artifact. Open the template and the
artifact side by side and verify ALL of the following. Do not eyeball — count.
- Every section heading in the template is present in the artifact, unrenamed
  and in the same order; none dropped, renamed, reordered, or merged. The
  template is a floor, not a cap: extra sections, tables, or charts added beyond
  it are allowed — do NOT flag additions as issues (judge them only on whether
  their content is real and sourced).
- No template guidance text remains (HTML comments from the template, `FILL`
  markers). None may survive in the finished document.
- No section is empty, a bare restatement of its own heading, or a placeholder.
  A section marked "N/A" must give one sentence of why.
- Every quantity the template or criteria state is met literally — e.g. if it
  asks for "at least 20-30 cases", COUNT the cases and report the number; if it
  asks for sample rows or verbatim prompts, confirm they are present inline.
Report each compliance failure as its own issue with the count/evidence.

THEN classify each issue by severity:
- Critical: invalidates results or makes them unreproducible.
- Major: any of — a section missing/renamed/reordered/empty/placeholder; a
  remaining template marker or guidance comment; an unmet required quantity
  (e.g. fewer cases than asked); a section too thin to understand without
  opening code or another doc; a claim without its cited source; or anything
  that meaningfully distorts results or blocks a completion criterion.
  Template deviations and thin/placeholder sections are Major, never Minor.
- Minor: wording, small inconsistencies, cosmetic clarity — only when the
  content is genuinely complete.

Return one markdown list item per issue:
- severity: Critical|Major|Minor
- location: file:line (or section)
- finding: what is wrong, with evidence (include counts for quantity failures)
- decision_needed: yes|no — yes if this is a judgment call for the user
  rather than a defect

Return "NO ISSUES" only if every compliance check above passed and no other
issue was found.
```
