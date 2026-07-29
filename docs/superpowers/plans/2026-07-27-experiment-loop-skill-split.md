# experiment-loop 스킬 분할 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 스킬 `experiment-loop`을 플러그인 하나에 담긴 스킬 넷으로 나눠, 사용자가 직접 요청하는 작업(보고서·기록·온보딩)이 각자의 진입점을 갖게 한다.

**Architecture:** 플러그인 루트에 `shared/`(검증 게이트·템플릿·공통 규칙)를 두고, `skills/` 아래 스킬 넷을 둔다. 각 SKILL.md는 공통 원칙 블록을 인라인으로 품고, 긴 절차만 `../../shared/`를 참조한다. 단계 reference에는 보고서·위키 절차를 한 줄도 남기지 않고 스킬 호출만 남긴다.

**Tech Stack:** Markdown 프롬프트, Claude Code 플러그인 형식(`.claude-plugin/plugin.json`), git.

## Global Constraints

- 설계 문서: `docs/superpowers/specs/2026-07-27-experiment-loop-skill-split-design.md`. 충돌하면 설계 문서가 우선한다.
- 서브에이전트는 **검증 전용**이다. 실행 작업을 서브에이전트에 위임하는 지시를 새로 쓰지 않는다.
- 훅은 이번 범위에 **없다**. `hooks/` 디렉터리를 만들지 않는다.
- 스킬 안의 모든 문서와 코드는 **영어**로 쓴다. 사용자와 대화는 한국어.
  단, `description` 안의 사용자 발화 예시는 한국어 그대로 넣는다 — 그게 걸림쇠다.
- 파일을 옮길 때는 `git mv`를 쓴다. 이력이 끊기면 무엇이 어디서 왔는지 추적이 안 된다.
- 내용을 옮길 때 **다시 쓰지 않는다.** 잘라 붙이고, 경로와 호출만 고친다.
  문구를 손보고 싶으면 별도 커밋으로 분리한다.
- 각 태스크는 검사 명령을 돌려 통과한 뒤 커밋한다.

## File Structure

이동 전 → 이동 후.

| 지금 | 옮길 곳 | 비고 |
|---|---|---|
| `skills/experiment-loop/SKILL.md` | `plugins/experiment-loop/skills/experiment-loop/SKILL.md` | 재작성 (Task 6) |
| `references/verification-gate.md` | `plugins/experiment-loop/shared/verification-gate.md` | 내용 그대로 |
| `references/state.md` | `plugins/experiment-loop/shared/state.md` | 내용 그대로 |
| `templates/` 13개 | `plugins/experiment-loop/shared/templates/` | 내용 그대로 |
| `references/bootstrap.md` | `skills/experiment-bootstrap/SKILL.md` | frontmatter 추가 (Task 4) |
| `references/llm-wiki.md` | `skills/experiment-wiki/SKILL.md` | frontmatter + 규칙 흡수 (Task 3) |
| `references/experiment.md` 91~293행 | `skills/experiment-report/SKILL.md` | 잘라내기 (Task 5) |
| `references/experiment.md` 나머지 | `skills/experiment-loop/references/experiment.md` | 약 100줄로 축소 |
| `references/{experiment-design,tech-design,implementation,wrap-up,long-term-plan}.md` | `skills/experiment-loop/references/` | 경로·호출만 수정 |
| — | `plugins/experiment-loop/.claude-plugin/plugin.json` | 신규 |
| — | `plugins/experiment-loop/shared/principles-inline.md` | 신규, 인라인 블록 원본 |
| — | `plugins/experiment-loop/shared/template-compliance.md` | 신규, 템플릿 준수 전체 규칙 |

---

### Task 1: 플러그인 뼈대를 만들고 파일을 새 자리로 옮긴다

내용은 아직 자르지 않는다. 트리만 최종 모양으로 만든다. 반쯤 옮겨진 상태를 만들지 않기 위해서다.

**Files:**
- Create: `plugins/experiment-loop/.claude-plugin/plugin.json`
- Move: `skills/experiment-loop/**` → `plugins/experiment-loop/**`

**Interfaces:**
- Produces: 이후 모든 태스크가 쓰는 경로 — `plugins/experiment-loop/shared/`,
  `plugins/experiment-loop/skills/<skill>/`

- [ ] **Step 1: 디렉터리를 만든다**

```bash
cd /Users/zeroman0112/Projects/agentic_loop_factory
mkdir -p plugins/experiment-loop/.claude-plugin
mkdir -p plugins/experiment-loop/shared
mkdir -p plugins/experiment-loop/skills/experiment-loop/references
mkdir -p plugins/experiment-loop/skills/experiment-bootstrap
mkdir -p plugins/experiment-loop/skills/experiment-report
mkdir -p plugins/experiment-loop/skills/experiment-wiki
```

- [ ] **Step 2: plugin.json을 쓴다**

`plugins/experiment-loop/.claude-plugin/plugin.json`:

```json
{
  "name": "experiment-loop",
  "description": "Agentic loop for ML experiment automation: onboarding, experiment design, tech design, implementation, running experiments, reporting, and wiki upkeep",
  "version": "1.0.0",
  "keywords": ["ml", "experiment", "agentic-loop", "research"]
}
```

- [ ] **Step 3: 공유 파일을 옮긴다**

```bash
git mv skills/experiment-loop/references/verification-gate.md plugins/experiment-loop/shared/
git mv skills/experiment-loop/references/state.md plugins/experiment-loop/shared/
git mv skills/experiment-loop/templates plugins/experiment-loop/shared/templates
```

- [ ] **Step 4: 스킬이 될 파일을 옮긴다**

```bash
git mv skills/experiment-loop/references/bootstrap.md plugins/experiment-loop/skills/experiment-bootstrap/SKILL.md
git mv skills/experiment-loop/references/llm-wiki.md   plugins/experiment-loop/skills/experiment-wiki/SKILL.md
git mv skills/experiment-loop/SKILL.md                 plugins/experiment-loop/skills/experiment-loop/SKILL.md
for f in experiment-design tech-design implementation experiment wrap-up long-term-plan; do
  git mv "skills/experiment-loop/references/$f.md" \
         "plugins/experiment-loop/skills/experiment-loop/references/$f.md"
done
```

- [ ] **Step 5: 옛 디렉터리가 비었는지 확인한다**

Run:
```bash
find skills -type f | sort
```
Expected: 아무것도 출력되지 않음. 파일이 남았으면 옮기다 빠뜨린 것이다.

```bash
rmdir skills/experiment-loop/references skills/experiment-loop skills 2>/dev/null
find plugins -type f | wc -l
```
Expected: `25` (13 템플릿 + 2 공유 + 9 스킬·reference + 1 plugin.json)

- [ ] **Step 6: 커밋한다**

```bash
git add -A
git commit -m "refactor(experiment-loop): move skill into plugin layout

File moves only, no content changes. Splitting the content into four skills
happens in the following commits."
```

---

### Task 2: 공통 원칙 블록과 템플릿 준수 규칙 파일을 만든다

네 SKILL.md가 그대로 품을 블록을 한 번 확정한다. 여기서 정한 텍스트가 원본이고, 나머지 태스크는 이걸 복사한다.

**Files:**
- Create: `plugins/experiment-loop/shared/principles-inline.md`
- Create: `plugins/experiment-loop/shared/template-compliance.md`
- Read: `plugins/experiment-loop/skills/experiment-loop/SKILL.md:45-124` (원문)

**Interfaces:**
- Produces: `<!-- BEGIN shared-principles -->` / `<!-- END shared-principles -->`
  마커로 감싼 블록. Task 3~6이 이 마커째로 각 SKILL.md에 붙인다. Task 9가
  네 복사본이 같은지 대조한다.

- [ ] **Step 1: 템플릿 준수 전체 규칙을 빼낸다**

지금 `SKILL.md:53-71`의 Template compliance 항목 전체를 옮긴다.
`plugins/experiment-loop/shared/template-compliance.md`:

```markdown
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
```

- [ ] **Step 2: 인라인 블록을 쓴다**

`plugins/experiment-loop/shared/principles-inline.md`. 파일 전체가 아래와 같다 — 마커를 포함해 그대로 복사되는 텍스트다.

```markdown
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
  judging whether you need them is exactly how known facts get skipped. Only
  then open what the specific task needs.
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
```

- [ ] **Step 3: 원본과 대조해 빠진 원칙이 없는지 확인한다**

Run:
```bash
grep -c "^- \*\*" plugins/experiment-loop/skills/experiment-loop/SKILL.md
grep -c "^- \*\*" plugins/experiment-loop/shared/principles-inline.md
```
Expected: 원본 12개, 인라인 10개.
차이 2개는 의도한 것이다 — "Capture durable facts"와 "Repeating yourself"가
한 항목("Durable facts go to the wiki immediately")으로 합쳐졌고,
"Progressive context loading"과 "Consult feedback"이 한 항목("Always-read
core")으로 합쳐졌다. 합쳐서 12 → 10이다. 다른 수가 나오면 무언가 빠진 것이다.

- [ ] **Step 4: 커밋한다**

```bash
git add plugins/experiment-loop/shared/
git commit -m "feat(experiment-loop): add shared principles block and template-compliance rules

principles-inline.md is the canonical copy of the block each SKILL.md embeds
verbatim between markers. Task 9 diffs the four copies against it."
```

---

### Task 3: experiment-wiki 스킬을 만든다

먼저 만드는 이유: 위키 배치 규칙의 주인이라, 나머지 스킬이 이걸 참조한다.

**Files:**
- Modify: `plugins/experiment-loop/skills/experiment-wiki/SKILL.md` (지금은 옛 llm-wiki.md 내용)
- Read: `plugins/experiment-loop/skills/experiment-loop/SKILL.md:90-106` (옮겨올 두 원칙)
- Read: `plugins/experiment-loop/skills/experiment-loop/references/wrap-up.md:39-78`

**Interfaces:**
- Produces: 스킬 이름 `experiment-wiki`. Task 4·5·6이 "위키에 기록할 때는 이
  스킬을 호출한다"로 참조한다.

- [ ] **Step 1: frontmatter를 파일 맨 앞에 붙인다**

description에 사용자가 실제로 쓰는 한국어 표현을 넣는 게 핵심이다. 이게 걸림쇠다.

```markdown
---
name: experiment-wiki
description: Records facts and decisions into the project's LLM wiki and keeps it current. Use whenever the user asks to record, save, or document something - "이거 기록해둬", "문서에 남겨줘", "위키에 저장해줘", "위키 갱신해줘", "이 결정 남겨줘", "정리해서 남겨줘" - and whenever the user states a durable project fact or constraint that must outlive this session, and at loop wrap-up when the wiki needs updating. Owns the rules for which document a piece of information belongs in. Always use this skill instead of editing wiki documents directly.
---
```

- [ ] **Step 2: 공통 원칙 블록을 붙인다**

`shared/principles-inline.md` 전체를 frontmatter 바로 다음, 본문 `# LLM Wiki` 제목 앞에 그대로 넣는다. 마커 주석 두 줄도 포함한다.

- [ ] **Step 3: 즉시 기록 규칙을 흡수한다**

`experiment-loop/SKILL.md:90-106`의 두 항목("Capture durable facts on the spot", "Repeating yourself is a bug signal") 본문을 이 스킬의 `## Writing principles` 아래 새 절로 옮긴다.

```markdown
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
```

- [ ] **Step 4: wrap-up의 위키 작업을 흡수한다**

`wrap-up.md:39-48`(2절 LLM wiki update)과 `49-78`(3절 Promote)의 위키 관련 지시를 이 스킬의 `## Update procedure` 절로 합친다. 단, **실험 대장 갱신은 옮기지 않는다** — 그건 루프 진행의 일부라 wrap-up에 남는다.

- [ ] **Step 5: 확인한다**

Run:
```bash
head -5 plugins/experiment-loop/skills/experiment-wiki/SKILL.md
grep -c "BEGIN shared-principles\|END shared-principles" plugins/experiment-loop/skills/experiment-wiki/SKILL.md
grep -n "Which bucket\|Capture on the spot\|Update procedure" plugins/experiment-loop/skills/experiment-wiki/SKILL.md
```
Expected: frontmatter가 `---`로 시작, 마커 2개, 세 절이 모두 존재.

- [ ] **Step 6: 커밋한다**

```bash
git add plugins/experiment-loop/skills/experiment-wiki/SKILL.md
git commit -m "feat(experiment-wiki): make wiki recording its own skill

Absorbs the capture-on-the-spot rules from SKILL.md and the wiki half of
wrap-up, so 'record this' has one owner and one entry point."
```

---

### Task 4: experiment-bootstrap 스킬을 만든다

**Files:**
- Modify: `plugins/experiment-loop/skills/experiment-bootstrap/SKILL.md` (지금은 옛 bootstrap.md 내용)

**Interfaces:**
- Consumes: `experiment-wiki` 스킬(배치 규칙), `../../shared/templates/`
- Produces: 스킬 이름 `experiment-bootstrap`. Task 6의 대시보드가 호출한다.

- [ ] **Step 1: frontmatter를 붙인다**

```markdown
---
name: experiment-bootstrap
description: Onboards a project onto the ML experiment loop - stage 0, run once per project. Use when the user asks to set up, onboard, or initialize the experiment loop - "이 프로젝트 온보딩해줘", "실험 루프 세팅해줘", "부트스트랩 실행해줘", "실험 루프 붙여줘" - or when docs/index.md does not exist so the loop cannot run yet. Restructures the docs tree, seeds the LLM wiki from existing code, writes CLAUDE.md, guides the user through a PRD, and identifies required MCP servers.
---
```

- [ ] **Step 2: 공통 원칙 블록을 붙인다**

`shared/principles-inline.md` 전체를 frontmatter 다음, `# Stage 0: Bootstrap` 제목 앞에 그대로 넣는다.

- [ ] **Step 3: 위키 배치 규칙을 참조로 바꾼다**

지금 이 파일은 배치 규칙을 자체적으로 설명한다(3절 Restructure). 규칙 본문을 지우고 호출로 바꾼다. 지름길을 남기면 그쪽을 따라간다.

`## Procedure outline`의 3번 항목을 다음으로 교체한다:

```markdown
3. Restructure. **Invoke the `experiment-wiki` skill** for the layout rules -
   the human/agent split, the knowledge/guidance/decisions buckets, and where
   each kind of document goes. Do not reproduce those rules here. Apply them to
   this project's existing docs, then write `glossary.md` and `CONVENTIONS.md`.
```

- [ ] **Step 4: 템플릿 경로를 고친다**

Run:
```bash
grep -n "templates/" plugins/experiment-loop/skills/experiment-bootstrap/SKILL.md
```
찾은 곳마다 `templates/x.md` → `../../shared/templates/x.md`로 바꾼다.

- [ ] **Step 5: 확인한다**

Run:
```bash
grep -c "BEGIN shared-principles" plugins/experiment-loop/skills/experiment-bootstrap/SKILL.md
grep -n "experiment-wiki" plugins/experiment-loop/skills/experiment-bootstrap/SKILL.md
grep -n "templates/" plugins/experiment-loop/skills/experiment-bootstrap/SKILL.md | grep -v "shared/templates"
```
Expected: 마커 1개, `experiment-wiki` 호출 존재, 마지막 명령은 출력 없음(고치지 않은 경로가 없음).

- [ ] **Step 6: 커밋한다**

```bash
git add plugins/experiment-loop/skills/experiment-bootstrap/SKILL.md
git commit -m "feat(experiment-bootstrap): make stage 0 onboarding its own skill

Layout rules now come from experiment-wiki rather than being restated here, so
there is one owner for where documents go."
```

---

### Task 5: experiment-report 스킬을 만든다

`references/experiment.md`를 둘로 자른다. 91~293행(Report + HTML rendering)이 새 스킬이 되고, 나머지는 4단계 reference로 남는다.

**Files:**
- Create: `plugins/experiment-loop/skills/experiment-report/SKILL.md`
- Modify: `plugins/experiment-loop/skills/experiment-loop/references/experiment.md` (91~293행 삭제, 호출 한 문단으로 교체)

**Interfaces:**
- Consumes: `../../shared/templates/experiment-report.md`,
  `../../shared/templates/project-report.md`,
  `../../shared/verification-gate.md`
- Produces: 스킬 이름 `experiment-report`. Task 6·7이 4단계에서 호출한다.

- [ ] **Step 1: 잘라낼 범위를 확인한다**

Run:
```bash
sed -n '89,93p;291,296p' plugins/experiment-loop/skills/experiment-loop/references/experiment.md
```
Expected: 91행이 `## Report`, 293행 근처가 HTML 게이트의 끝, 294행이 `**Done when:**`.
행 번호가 어긋나면 `grep -n "^## Report\|^## HTML rendering\|^\*\*Done when"`으로 다시 잡는다.

- [ ] **Step 2: 새 스킬 파일을 만든다**

frontmatter + 공통 원칙 블록 + 잘라낸 본문 순서로 쓴다.

```markdown
---
name: experiment-report
description: Writes the ML experiment reports - this loop's experiment report and the whole-project report, in markdown and then self-contained HTML. Use whenever the user asks for a report or a results write-up, in any phrasing - "보고서 써줘", "실험 보고서 작성해줘", "결과 정리해줘", "리포트 만들어줘", "결과 문서로 만들어줘", "프로젝트 보고서 갱신해줘" - and whenever stage 4 of the experiment loop reaches its reporting step. Covers the required sections, the two-pass fill-then-extend method, HTML rendering, and the verification gates for both. Always use this skill instead of writing a report directly.
---
```

그 다음 `shared/principles-inline.md` 전체를 그대로 넣고, 그 다음 본문을 넣는다:

```markdown
# Experiment Reports

**Purpose:** produce the two reports and verify them before the user sees them.

## Must read first

- this loop's `experiment-design.md` — the acceptance criteria and the serving
  targets in its Constraints, which the reports judge results against;
- this loop's `tech-design-spec.md` — the metrics and thresholds;
- the actual output files the numbers come from (metrics files, logs);
- for the project report: `docs/agent/knowledge/experiment-ledger.md`,
  `docs/agent/knowledge/long-term-plan.md` (if it exists), the PRD in
  `docs/human/raw/` including its Serving Requirements,
  `docs/agent/knowledge/decisions/`, the `docs/agent/knowledge/` topic docs
  (data/model/eval, and `serving.md` if it exists).
```

그 아래에 원본 91~293행을 붙이되 다음만 고친다:
- `templates/experiment-report.md` → `../../shared/templates/experiment-report.md`
- `templates/project-report.md` → `../../shared/templates/project-report.md`
- `references/verification-gate.md` → `../../shared/verification-gate.md`
- 원본의 `1.`~`7.` 번호는 그대로 둔다(절차 순서가 의미를 갖는다).
- 원본 맨 끝 `**Done when:**` 문장을 다음으로 바꾼다:

```markdown
**Done when:** both reports are written, both gates passed, and both HTML pages
render. Hand both to the user for review. If the experiment loop called this
skill, return control to stage 4 with `status: awaiting_user_review`.
```

- [ ] **Step 3: 원본에서 잘라낸 부분을 지우고 호출로 바꾼다**

`references/experiment.md`의 `## Report`부터 HTML 게이트 끝까지를 지우고 그 자리에 이것만 남긴다:

```markdown
## Report

This stage produces two reports — this loop's experiment report and the
whole-project report. **Invoke the `experiment-report` skill.** It owns the
sections, the writing method, the HTML rendering, and both verification gates.

Do not write a report from this file. There is deliberately no summary of the
procedure here: a summary would get followed instead of the skill, and it would
be the weaker of the two.

When the skill returns, both reports are written and gated.
```

- [ ] **Step 4: 4단계가 알맞은 크기로 줄었는지 확인한다**

Run:
```bash
wc -l plugins/experiment-loop/skills/experiment-loop/references/experiment.md
grep -n "^## " plugins/experiment-loop/skills/experiment-loop/references/experiment.md
```
Expected: 약 100줄. 절은 `Must read first` / `Execution` / `Monitor and continue` / `Report` 넷.

- [ ] **Step 5: 보고서 지시가 4단계에 남지 않았는지 확인한다**

Run:
```bash
grep -niE "tab|HTML|KPI|Error Analysis|two passes|fill the floor" \
  plugins/experiment-loop/skills/experiment-loop/references/experiment.md
```
Expected: 출력 없음. 하나라도 걸리면 지름길이 남은 것이다 — 지운다.

- [ ] **Step 6: 커밋한다**

```bash
git add plugins/experiment-loop/skills/experiment-report/SKILL.md \
        plugins/experiment-loop/skills/experiment-loop/references/experiment.md
git commit -m "feat(experiment-report): make report writing its own skill

Stage 4 keeps execution and monitoring and now only invokes the skill. No
summary of the report procedure is left behind - a summary would be followed
instead of the skill, and it would be the weaker copy."
```

---

### Task 6: experiment-loop SKILL.md를 다시 쓴다

**Files:**
- Modify: `plugins/experiment-loop/skills/experiment-loop/SKILL.md`

**Interfaces:**
- Consumes: 세 스킬 이름(`experiment-bootstrap`, `experiment-report`,
  `experiment-wiki`), `../../shared/state.md`, `../../shared/verification-gate.md`

- [ ] **Step 1: frontmatter를 고친다**

지금 description은 모든 것을 나열해 아무것에도 정확히 걸리지 않는다. 루프 진행에만 걸리게 좁힌다.

```markdown
---
name: experiment-loop
description: Runs and tracks the ML experiment loop - the dashboard and stages 1 through 5. Use when the user starts, resumes, or checks an experiment loop - "실험 루프 시작", "이어서 진행해줘", "지금 몇 단계야", "다음 단계 진행", "루프 상태 보여줘" - or when working through experiment design, tech design, implementation, running the experiment, or wrap-up. Reads state.json to find where the loop stands. For onboarding a new project use experiment-bootstrap; for writing reports use experiment-report; for recording anything into the wiki use experiment-wiki.
---
```

- [ ] **Step 2: 공통 원칙 블록으로 Shared Principles를 교체한다**

지금의 `## Shared Principles (all stages)` 절(45~124행) 전체를 지우고, 그 자리에 `shared/principles-inline.md` 전체를 그대로 넣는다.

- [ ] **Step 3: 루프 전용 원칙을 블록 뒤에 덧붙인다**

인라인 블록에 들어가지 않는, 루프 진행에만 해당하는 것들이다.

```markdown
## Loop control

- **state.json is the authority, not the conversation.** Whenever you need to
  know where the loop stands, re-read
  `docs/agent/loops/<loop-id>/state.json`. Do not rely on what the conversation
  remembers — in a long session that memory is the first thing to go. Field
  spec: `../../shared/state.md`.
- **Side requests do not move the loop.** If the user asks for something
  outside the current stage, do it without touching `state.json`. When it is
  done, say in one line where the loop stands. Do not resume on your own — the
  user decides when to continue.
- Update `state.json` on every stage transition, escalation, and job start.
```

- [ ] **Step 4: 대시보드와 단계표에서 세 스킬을 호출하도록 고친다**

`## On Invocation: Dashboard` 1번 항목:

```markdown
1. Check onboarding: if `docs/index.md` does not exist, the project is not
   onboarded. Explain stage 0 and **invoke the `experiment-bootstrap` skill**.
```

`## Stages` 표의 0단계 행:

```markdown
| 0 bootstrap (once per project) | `experiment-bootstrap` skill | Layout + index.md + PRD exist; user confirms |
```

- [ ] **Step 5: Project Layout & Wiki 절을 호출로 바꾼다**

지금 이 절(125~133행)은 위키 구조를 설명한다. 규칙 주인은 `experiment-wiki`다.

```markdown
## Project Layout & Wiki

The docs tree, the knowledge/guidance split, the `loop-id` convention, and the
rules for which document a fact belongs in all live in the `experiment-wiki`
skill. **Invoke it** when you need them — do not restate them here.
```

- [ ] **Step 6: Templates 절의 경로를 고친다**

`templates/` → `../../shared/templates/`로 바꾸고, 목록은 그대로 둔다.

- [ ] **Step 7: 확인한다**

Run:
```bash
grep -c "BEGIN shared-principles" plugins/experiment-loop/skills/experiment-loop/SKILL.md
grep -n "experiment-bootstrap\|experiment-report\|experiment-wiki" plugins/experiment-loop/skills/experiment-loop/SKILL.md
wc -l plugins/experiment-loop/skills/experiment-loop/SKILL.md
```
Expected: 마커 1개, 세 스킬 이름이 모두 등장, 약 110~130줄.

- [ ] **Step 8: 커밋한다**

```bash
git add plugins/experiment-loop/skills/experiment-loop/SKILL.md
git commit -m "refactor(experiment-loop): thin the entry skill and point it at the other three

Narrows the description to loop progression so it stops matching every request.
Adds the state.json-is-the-authority rule and the side-request rule, which are
what keep the loop's position from being lost mid-session."
```

---

### Task 7: 남은 reference에서 지름길을 없애고 경로를 고친다

**Files:**
- Modify: `plugins/experiment-loop/skills/experiment-loop/references/wrap-up.md`
- Modify: `plugins/experiment-loop/skills/experiment-loop/references/{experiment-design,tech-design,implementation,long-term-plan}.md`

- [ ] **Step 1: wrap-up의 위키 절을 호출로 바꾼다**

2절(LLM wiki update)과 3절(Promote)의 위키 부분을 지우고:

```markdown
## 2. Wiki update and promotion

**Invoke the `experiment-wiki` skill.** It runs the change-scope diff, the
parallel updater and verifier subagents, the gardening pass, and the promotion
of this loop's log into `knowledge/`, `knowledge/decisions/`, and
`guidance/human-feedback.md`. Do not run those steps from here.

Give it this loop's `start_commit` from `state.json` and the path to this
loop's `loop-log.md`.
```

**실험 대장(experiment-ledger.md) 갱신은 여기 남긴다** — 루프 진행의 일부다.
3절에 있던 대장 갱신 문단을 새 3절로 옮긴다:

```markdown
## 3. Append to the experiment ledger

Append one short row per experiment run this loop (a loop with several variants
gets several rows) to `docs/agent/knowledge/experiment-ledger.md`: loop id,
hypothesis, key setup, key result, outcome — citing this loop's report. Keep
cells short; detail stays in the report. This keeps the ledger the single
up-to-date index that stage 1 checks to avoid repeats.
```

- [ ] **Step 2: 절 번호와 완료 조건을 맞춘다**

wrap-up은 절이 5개였다. 위 변경으로 2·3절의 내용이 바뀌었을 뿐 개수는 그대로다. 맨 끝 문장이 아직 맞는지 확인한다:

Run:
```bash
grep -n "^## \|^\*\*Done when" plugins/experiment-loop/skills/experiment-loop/references/wrap-up.md
```
Expected: `## 1.`~`## 5.` 다섯 개와 `**Done when:** all five sections are complete.`

- [ ] **Step 3: 모든 reference의 경로를 고친다**

Run:
```bash
cd plugins/experiment-loop/skills/experiment-loop
grep -rn "references/verification-gate.md\|templates/\|references/llm-wiki.md\|references/bootstrap.md" references/ SKILL.md
```
찾은 것마다 바꾼다:
- `references/verification-gate.md` → `../../shared/verification-gate.md`
- `templates/x.md` → `../../shared/templates/x.md`
- `references/llm-wiki.md` → `the experiment-wiki skill`
- `references/bootstrap.md` → `the experiment-bootstrap skill`

- [ ] **Step 4: 확인한다**

Run:
```bash
cd /Users/zeroman0112/Projects/agentic_loop_factory/plugins/experiment-loop
grep -rn "references/verification-gate\|references/llm-wiki\|references/bootstrap" skills/ || echo "OK - 옛 경로 없음"
grep -rn "templates/" skills/ | grep -v "shared/templates" || echo "OK - 템플릿 경로 전부 수정됨"
```
Expected: 두 줄 다 `OK`.

- [ ] **Step 5: 커밋한다**

```bash
cd /Users/zeroman0112/Projects/agentic_loop_factory
git add plugins/experiment-loop/skills/experiment-loop/
git commit -m "refactor(experiment-loop): remove shortcuts and fix cross-skill paths

wrap-up delegates the wiki work to experiment-wiki and keeps only the ledger
append, which is loop progression rather than wiki upkeep."
```

---

### Task 8: 원본 프롬프트와 README를 고친다

이 저장소는 프롬프트와 스킬의 대응을 원칙으로 삼는다. 스킬만 바꾸면 원본과 어긋난다.

**Files:**
- Modify: `prompts/build-experiment-loop.md:12`
- Modify: `README.md`

- [ ] **Step 1: "스킬 1개만" 규칙을 고친다**

`prompts/build-experiment-loop.md` 12행:

지금:
```
- 스킬은 `experiment-loop` **1개만** 만든다. 단계별로 스킬을 나누지 않는다.
```

바꿀 내용 — 분할 기준을 남겨야 다음에 또 흔들리지 않는다:
```
- 스킬은 **단계별로 나누지 않는다.** 단계는 흐름으로 이어지므로 하나의 스킬 안에 references로 둔다.
- 다만 **사용자가 흐름과 무관하게 직접 요청하는 작업**은 별도 스킬로 분리한다: 보고서 작성(`experiment-report`), 위키 기록(`experiment-wiki`), 프로젝트 온보딩(`experiment-bootstrap`). 이런 요청은 단계 흐름을 걸어오지 않으므로, 절차가 단계 안에 묻혀 있으면 진입할 문이 없다.
- 분리한 절차는 단계 reference에 **요약조차 남기지 않는다.** 남으면 그쪽을 따라가고 스킬은 걸리지 않는다.
- 전체는 플러그인 하나로 묶는다. 공용 파일(검증 게이트·템플릿·공통 원칙)은 플러그인 루트의 `shared/`에 둔다.
```

- [ ] **Step 2: README의 저장소 구조를 고친다**

`## 저장소 구조`의 코드 블록을 실제 트리로 바꾼다:

```
prompts/
  build-experiment-loop.md   # experiment-loop의 요구사항 정의 (source of truth)
plugins/
  experiment-loop/           # ML 실험 자동화 루프 플러그인
    .claude-plugin/plugin.json
    shared/                  # 스킬들이 함께 쓰는 것: 검증 게이트, 템플릿 13종, 공통 원칙
    skills/
      experiment-loop/       # 대시보드 + 단계 1~5
      experiment-bootstrap/  # 0단계 온보딩 (프로젝트당 1회)
      experiment-report/     # 보고서 작성 (loop + 프로젝트, markdown + HTML)
      experiment-wiki/       # 위키 기록과 갱신
```

- [ ] **Step 3: README의 설치 안내를 고친다**

`## 사용 방법` 문단을 플러그인 설치로 바꾸고, 왜 넷으로 나눴는지 한 줄 남긴다:

```markdown
## 사용 방법

`plugins/experiment-loop/`를 Claude Code 플러그인으로 설치합니다. 설치하면 스킬 넷이 함께 들어옵니다.

- `/experiment-loop` — 루프 진행. 부르면 대시보드로 현재 상태를 보여줍니다
- `/experiment-bootstrap` — 프로젝트 온보딩 (처음 한 번)
- `/experiment-report` — 보고서 작성
- `/experiment-wiki` — 위키 기록

넷으로 나눈 이유는 진입점 때문입니다. 보고서 작성과 위키 기록은 사용자가 단계 흐름과 무관하게 직접 요청하는 일이라, 절차가 단계 안에 묻혀 있으면 그 절차를 타지 않고 그냥 처리해 버립니다.
```

- [ ] **Step 4: 확인한다**

Run:
```bash
grep -n "1개만" prompts/build-experiment-loop.md || echo "OK - 옛 규칙 제거됨"
grep -n "skills/experiment-loop/" README.md || echo "OK - 옛 경로 제거됨"
```
Expected: 두 줄 다 `OK`.

- [ ] **Step 5: 커밋한다**

```bash
git add prompts/build-experiment-loop.md README.md
git commit -m "docs: update the source prompt and README for the four-skill split

The prompt's 'build only one skill' rule is replaced with the actual split
criterion - stages stay together, user-invoked work gets its own skill - so the
reason survives and the decision does not get re-litigated."
```

---

### Task 9: 검증

코드가 없어 실행 테스트가 없다. 네 가지로 본다. 1~3은 기계적, 4는 사람이 한다.

**Files:**
- Create: `docs/superpowers/plans/2026-07-27-experiment-loop-skill-split-verification.md`

- [ ] **Step 1: 인라인 원칙 블록 네 벌을 대조한다**

Run:
```bash
cd /Users/zeroman0112/Projects/agentic_loop_factory/plugins/experiment-loop
for s in experiment-loop experiment-bootstrap experiment-report experiment-wiki; do
  awk '/BEGIN shared-principles/,/END shared-principles/' "skills/$s/SKILL.md" > "/tmp/pb-$s.txt"
  echo "$s: $(wc -l < /tmp/pb-$s.txt) lines"
done
for s in experiment-bootstrap experiment-report experiment-wiki; do
  diff -q /tmp/pb-experiment-loop.txt "/tmp/pb-$s.txt" && echo "$s: 같음"
done
```
Expected: 네 파일의 줄 수가 같고, `diff`가 셋 다 "같음". 하나라도 다르면 복사본이 어긋난 것이다 — `shared/principles-inline.md`에서 다시 복사한다.

- [ ] **Step 2: 끊긴 참조를 찾는다**

Run:
```bash
cd /Users/zeroman0112/Projects/agentic_loop_factory/plugins/experiment-loop
grep -rhoE '\.\./\.\./shared/[A-Za-z0-9/._-]+' skills/ | sort -u | while read p; do
  [ -e "shared/${p#../../shared/}" ] && echo "OK   $p" || echo "MISS $p"
done
```
Expected: 전부 `OK`. `MISS`가 나오면 그 파일이 없거나 경로를 잘못 썼다.

- [ ] **Step 3: 원본 요구사항과 대조한다**

`prompts/build-experiment-loop.md`의 각 요구사항이 네 스킬 중 어디로 갔는지 표로 만든다. 옮기다 빠진 것을 잡는 검사다.

`docs/superpowers/plans/2026-07-27-experiment-loop-skill-split-verification.md`에 쓴다:

```markdown
# 분할 후 검증 기록

## 요구사항 대응표

프롬프트의 각 절이 어느 스킬로 갔는지. 빈칸이 있으면 옮기다 빠진 것이다.

| 프롬프트 절 | 간 곳 | 확인 |
|---|---|---|
| 실행 메커니즘 > 루프 제어 | experiment-loop SKILL.md | |
| 실행 메커니즘 > 컨텍스트 로드 | 인라인 블록 (네 스킬 전부) | |
| 실행 메커니즘 > 결정·피드백 기록 | 인라인 블록 + experiment-wiki | |
| 실행 메커니즘 > 검증 게이트 | shared/verification-gate.md | |
| 0단계 bootstrap | experiment-bootstrap | |
| 0.5단계 long-term plan | experiment-loop references | |
| 1단계 Experiment Design | experiment-loop references | |
| 2단계 Tech Design | experiment-loop references | |
| 3단계 구현 | experiment-loop references | |
| 4단계 실험 (실행·모니터링) | experiment-loop references | |
| 4단계 실험 (보고서) | experiment-report | |
| 5단계 마무리 (GC·대장·tools) | experiment-loop references | |
| 5단계 마무리 (위키) | experiment-wiki | |
| LLM wiki 전체 | experiment-wiki | |
| 문서 템플릿 | shared/templates/ | |
| 주의사항 (언어) | 인라인 블록 | |
| 실험보고서 작성원칙·구성요소 | experiment-report | |
```

각 행을 실제로 열어보고 확인란을 채운다. 못 찾으면 그 자리에서 옮긴다.

- [ ] **Step 4: 행동 시험 목록을 남긴다**

같은 파일에 이어 쓴다. 이게 훅이 필요한지 판단하는 시험이다.

```markdown
## 행동 시험

긴 대화(최소 20~30 턴, 다른 주제 포함)를 만든 뒤 아래를 그대로 던진다.
스킬이 걸리면 통과다.

| # | 던질 말 | 걸려야 할 스킬 | 결과 |
|---|---|---|---|
| 1 | "실험보고서 작성해줘" | experiment-report | |
| 2 | "이거 문서에 기록해줘" | experiment-wiki | |
| 3 | 루프 4단계 중에 무관한 부탁 → 그 뒤 "지금 어디까지 했지?" | experiment-loop이 state.json을 다시 읽어 4단계라고 답함 | |

## 훅 판단

위 셋 중 **하나라도 실패하면 훅을 붙인다.** `UserPromptSubmit` 하나에 검사 둘 —
진행 중인 루프가 있으면 현재 단계를 한 줄 주입하고, 요청문이 보고서·기록으로
보이면 스킬 로드를 상기시킨다. 플러그인 구조라 `hooks/hooks.json`만 추가하면
되고 다른 것은 건드리지 않는다.

붙일 때 단어를 넓게 잡지 않는다. 넓게 잡으면 관계없는 대화에 매번 끼어들고,
매번 끼어들면 결국 무시하게 된다. 위 세 문장 같은 좁은 표현에 맞춘다.

셋 다 통과하면 훅 없이 간다.
```

- [ ] **Step 5: 커밋한다**

```bash
git add docs/superpowers/plans/2026-07-27-experiment-loop-skill-split-verification.md
git commit -m "docs: add verification record for the four-skill split

Includes the traceability table against the source prompt and the behavioural
test whose outcome decides whether hooks are needed."
```

---

## 자가 점검 결과

**설계 문서 대응.** 설계의 각 절을 태스크에 대응시켰다.

| 설계 절 | 태스크 |
|---|---|
| 새 구조 (플러그인 레이아웃) | 1 |
| 공통 원칙: 인라인 vs 공유 | 2 |
| 스킬별 책임 — wiki | 3 |
| 스킬별 책임 — bootstrap | 4 |
| 스킬별 책임 — report | 5 |
| 스킬별 책임 — loop | 6 |
| 이탈 장치 1 (description) | 3·4·5·6 각 Step 1 |
| 이탈 장치 2 (지름길 제거) | 5 Step 3·5, 7 Step 1 |
| 이탈 장치 3 (state.json 권위) | 6 Step 3 |
| 함께 고칠 것 (프롬프트·README) | 8 |
| 검증 1~4 | 9 |
| 훅 추가 판단 | 9 Step 4 |

빈 칸 없음.

**설계에서 벗어난 것 하나.** 설계는 인라인 블록을 "약 20~25줄"로 잡았는데, 실제로 써보니 **약 35줄**이 됐다. Template compliance의 상세 규칙을 `shared/template-compliance.md`로 빼내 압축했는데도 그렇다. 더 줄이면 원칙이 훼손된다고 판단해 35줄로 간다. 네 벌이면 140줄 중복이다.

**타입 일관성.** 스킬 이름 넷(`experiment-loop`, `experiment-bootstrap`, `experiment-report`, `experiment-wiki`)과 공유 파일 경로 넷(`../../shared/verification-gate.md`, `../../shared/state.md`, `../../shared/templates/`, `../../shared/template-compliance.md`)을 전 태스크에서 같은 철자로 썼다. 마커는 `<!-- BEGIN shared-principles -->` / `<!-- END shared-principles -->` 한 벌만 쓴다.
