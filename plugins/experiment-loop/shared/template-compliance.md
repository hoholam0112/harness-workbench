# Template Compliance (binding)

Every document created from a template in `shared/templates/` is created by
**copying the template file**, not by writing freely "inspired by" it. The
template is a **mandatory floor, not a cap**: fill all of it, then add beyond
it when that serves the reader. Non-negotiable:

- Keep **every** section heading from the template, unrenamed and in order.
  Do not drop, rename, merge, or reorder the required sections. You **may**
  add extra sections, subsections, tables, or charts beyond the floor when
  they help the reader — additions are encouraged, never penalized.
- Each template embeds its requirements as guidance (HTML comments, or `FILL`
  markers). Replace each one with real content, then delete the guidance
  marker. A finished document contains **no** template guidance text and
  **no** `FILL` marker.
- Every section holds real content. No section may be empty, a restatement of
  its own heading, or a placeholder. If a section is genuinely not applicable,
  write "N/A" **and one sentence of why** — silence is not allowed.
- Where a template states a quantity ("at least 20-30 cases", "sample rows"),
  meet it literally.

This is enforced by the verification gate; a document that deviates from its
template is a Major issue, not a stylistic one.
