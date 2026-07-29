# concept-slides 커리큘럼 기반 재작성 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `concept-slides` 스킬을 커리큘럼 기반으로 바꿔, 호출마다 학습목표가 척추인 챕터 하나(1~2시간 분량)를 만들게 한다.

**Architecture:** 설계는 `docs/superpowers/specs/2026-07-29-concept-slides-curriculum-design.md`에 있다. 핵심은 게이트가 재는 대상을 "장이 제 모양인가"에서 "목표 ↔ 설명 장 ↔ 퀴즈가 연결됐는가"로 바꾸는 것이다. `assets/deck.html`의 자기검사기를 먼저 갈아낸 뒤 문서를 그에 맞춘다. 검사기가 먼저인 이유는, 문서가 검사기의 메시지를 인용해야 하기 때문이다.

**Tech Stack:** 의존성 없는 단일 HTML(바닐라 JS + CSS), 테스트 조립은 Node 24 ESM 스크립트, 검증은 브라우저에서 `window.__deckCheck()` 호출(Playwright MCP 또는 사람이 직접).

## Global Constraints

- 작업 대상 폴더: `skills/concept-slides/`. 브랜치: `feat/concept-slides`.
- **`assets/deck.html`은 의존성 없는 단일 파일이어야 한다.** 외부 CSS·JS·폰트·이미지를 불러오지 않는다. 스킬이 이 파일을 복사해서 챕터를 만든다.
- 자료 기본 언어는 한국어. 기술 용어는 원어 병기(예: 파드(Pod)).
- 표시 형식은 한 화면에 한 장(16:9) 유지. 스크롤 문서로 바꾸지 않는다.
- 챕터 하나 = 파일 하나. 읽는 데 1~2시간, 학습목표 4~6개, 슬라이드 60~70장.
- 설명 순서는 `intro`(쉬운 설명) → `precise`(엄밀한 설명) → `example`(실제 예시). **순서만 강제하고 장 수는 강제하지 않는다.**
- **비유는 의무가 아니다.** 검사기는 비유가 있는지 묻지 않는다. `data-analogy`가 붙은 장에만 매핑표·깨지는 지점을 요구한다.
- 산문 하한은 **목표 단위 1200자** 하나. 장 단위 하한은 두지 않는다. 이 값을 올려서 다시 조이지 않는다.
- 챕터 열기 장(`opening`)만 예외로 산문 400자 하한을 둔다. 목표에 속하지 않아 목표 단위 하한이 닿지 않기 때문이다.
- 학습 시간 추정은 **알림**이고 위반이 아니다. `__deckCheck()`의 반환 배열에 넣지 않는다.
- 하한 집계는 `.prose` 클래스가 붙은 요소만 세고, `<details>` 내부는 펼쳐져 있어도 세지 않는다.
- 새 `data-kind` 값: `cover` `opening` `goal` `intro` `precise` `example` `pitfall` `closing`. 폐기: `define` `why` `analogy` `how` `real` `myth` `recap` `section`.
- 폐기 속성: `data-track`, `data-concept`.
- 목표 식별자는 챕터 안에서만 유효하며 `g1`부터 센다.
- 커밋 메시지는 저장소 관례를 따른다: `<type>(concept-slides): <영문 요약>`.

---

## File Structure

| 파일 | 책임 | 처리 |
|---|---|---|
| `skills/concept-slides/SKILL.md` | 워크플로우 두 갈래(커리큘럼 설계 / 챕터 작성), 게이트 요약 | 재작성 |
| `skills/concept-slides/references/curriculum-design.md` | 커리큘럼 세우는 법 — 목표 문장, 의존 순서, 분량 배분 | 신규 |
| `skills/concept-slides/references/chapter-anatomy.md` | 장별 목적·합격 기준·좋은 예/나쁜 예 | 신규 |
| `skills/concept-slides/references/seven-beat.md` | — | 삭제 |
| `skills/concept-slides/references/principles.md` | 게이트별 교육 설계 근거 | 갱신 |
| `skills/concept-slides/assets/deck.html` | 챕터 뼈대 + 자기검사기 + 예시 챕터 | 검사기 교체, UI 보강, 예시 교체 |
| `skills/concept-slides/assets/svg-kit.md` | 재사용 SVG 조각 | 그대로 |
| `skills/concept-slides/references/inspiration.md` | 참고 자료 | 그대로 |
| `skills/concept-slides/tests/build.mjs` | 슬라이드 조각을 `deck.html` 껍데기에 끼워 검사용 파일 생성 | 신규 |
| `skills/concept-slides/tests/slides-broken.html` | 게이트를 일부러 어기는 슬라이드 조각(음성 대조군) | 신규 |
| `skills/concept-slides/tests/README.md` | fixture 돌리는 법과 기대 위반 목록 | 신규 |
| `.gitignore` | `tests/out/` 제외 | 신규 |

**양성 대조군은 별도 fixture를 두지 않고 `assets/deck.html` 자신을 쓴다.** Task 12에서 예시 챕터를 새 구조로 갈아 끼우면, `deck.html`을 그냥 열었을 때 위반 0건이어야 한다. 같은 내용을 두 번 쓰지 않기 위한 결정이다.

**Task 3부터 Task 11까지 `deck.html`은 자기 검사를 통과하지 못한다.** 예시 슬라이드가 아직 옛 `data-kind`(`define`/`why`/…)를 쓰고 있기 때문이다. 정상이다. Task 12에서 맞춰진다.

---

### Task 1: 검사 발판 — fixture 조립 스크립트와 음성 대조군

**Files:**
- Create: `skills/concept-slides/tests/build.mjs`
- Create: `skills/concept-slides/tests/slides-broken.html`
- Create: `skills/concept-slides/tests/README.md`
- Create: `.gitignore`

**Interfaces:**
- Consumes: 없음
- Produces: `node tests/build.mjs broken` → `tests/out/broken.html`. 이후 모든 게이트 작업이 이 파일을 브라우저로 열어 `window.__deckCheck()`의 반환 배열로 검증한다.

- [ ] **Step 1: fixture 조립 스크립트를 만든다**

`skills/concept-slides/tests/build.mjs`:

```js
// 슬라이드 조각을 assets/deck.html 껍데기에 끼워 tests/out/<이름>.html 을 만든다.
// 껍데기(스타일·검사기·HUD)를 복사하지 않으므로 검사기가 갈라질 일이 없다.
//
//   node tests/build.mjs broken
//
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const OPEN = '<main class="stage" id="stage">';

const shell = await readFile(join(here, '..', 'assets', 'deck.html'), 'utf8');
const open = shell.indexOf(OPEN);
if (open < 0) throw new Error(`deck.html 에서 ${OPEN} 를 못 찾았다`);
const close = shell.indexOf('</main>', open);
if (close < 0) throw new Error('deck.html 에서 </main> 를 못 찾았다');

const head = shell.slice(0, open + OPEN.length);
const tail = shell.slice(close);

const names = process.argv.slice(2);
if (!names.length) throw new Error('조각 이름을 하나 이상 넘겨라 (예: broken)');

await mkdir(join(here, 'out'), { recursive: true });
for (const name of names) {
  const slides = await readFile(join(here, `slides-${name}.html`), 'utf8');
  const out = join(here, 'out', `${name}.html`);
  await writeFile(out, `${head}\n${slides}\n${tail}`);
  console.log(out);
}
```

- [ ] **Step 2: 음성 대조군 슬라이드 조각을 만든다**

`skills/concept-slides/tests/slides-broken.html`. **이 파일은 게이트를 일부러 어긴다.** 주석에 어긴 항목을 적어 둔다.

```html
<!-- 게이트를 일부러 어기는 조각. 기대 위반 목록은 tests/README.md 에 있다. -->

<section class="slide" data-kind="cover">
  <p class="eyebrow">2장</p>
  <h1 class="headline">깨진 챕터로 검사기를 시험한다</h1>
</section>

<!-- 어김: 목표 선언이 1개(하한 2), 어미가 "안다", 열기 장 산문이 400자 미만 -->
<section class="slide" data-kind="opening">
  <h2 class="headline">이번 챕터에서 배울 것</h2>
  <p class="prose">짧은 도입 한 줄.</p>
  <ul class="outcomes">
    <li data-goal="g1">이벤트 루프에 대해 안다</li>
  </ul>
</section>

<!-- 어김: data-goal 이 없다 -->
<section class="slide" data-kind="goal">
  <h2 class="headline">목표 1</h2>
</section>

<!-- 어김: 목표 g1 의 3박자 순서가 뒤집혔다 (example 이 precise 보다 앞) -->
<section class="slide" data-kind="intro" data-goal="g1">
  <h2 class="headline">줄 서서 기다리는 창구를 떠올려 보자</h2>
  <p class="prose">짧은 산문.</p>
</section>

<section class="slide" data-kind="example" data-goal="g1">
  <h2 class="headline">코드에서는 이렇게 보인다</h2>
  <div class="stack">
    <pre><code>setTimeout(f, 0)</code></pre>
  </div>
</section>

<section class="slide" data-kind="precise" data-goal="g1">
  <h2 class="headline">이벤트 루프의 구조</h2>
  <p class="prose">짧은 산문.</p>
</section>

<!-- 어김: 선언되지 않은 목표값 (미아) -->
<section class="slide" data-kind="intro" data-goal="g9">
  <h2 class="headline">미아 장이다</h2>
  <p class="prose">짧은 산문.</p>
</section>

<!-- 어김: 비유를 썼다고 표시했는데 매핑표와 깨지는 지점이 없다 -->
<section class="slide" data-kind="intro" data-goal="g1" data-analogy>
  <h2 class="headline">창구 비유를 이어서 쓴다</h2>
  <p class="prose">짧은 산문.</p>
</section>

<!-- 어김: 폐기된 data-kind, 폐기된 data-track/data-concept -->
<section class="slide" data-kind="myth" data-concept="이벤트 루프" data-track="full">
  <h2 class="headline">흔한 오해를 다룬다</h2>
  <p class="prose">짧은 산문.</p>
</section>

<!-- 어김: closing 에 g1 퀴즈가 없다. 그리고 closing 에 data-goal 을 붙였다
     (붙일 장이 아니다 — cover/opening/closing 은 목표에 속하지 않는다) -->
<section class="slide" data-kind="closing" data-goal="g1">
  <h2 class="headline">이해를 확인한다</h2>
  <details class="quiz">
    <summary>목표를 안 가리킨 퀴즈</summary>
    <p class="prose">답.</p>
  </details>
</section>
```

- [ ] **Step 3: 생성물을 git에서 제외한다**

저장소 최상위에 `.gitignore`를 만든다(현재 없다):

```
.DS_Store
skills/concept-slides/tests/out/
```

- [ ] **Step 4: 조립이 되는지 확인한다**

Run: `cd skills/concept-slides && node tests/build.mjs broken`
Expected: `.../tests/out/broken.html` 경로가 출력되고 파일이 만들어진다.

- [ ] **Step 5: 브라우저에서 검사기가 도는지 확인한다**

`tests/out/broken.html`을 `file://` 경로로 열고 `window.__deckCheck()`를 호출한다. Playwright MCP를 쓸 수 있으면 `browser_navigate` 뒤 `browser_evaluate`로 `() => window.__deckCheck()`를 실행한다.

Expected: **배열이 반환된다.** 지금은 옛 검사기이므로 위 위반 대부분을 못 잡는다. 이 단계에서 확인할 것은 "검사기가 예외 없이 배열을 돌려준다"까지다.

- [ ] **Step 6: 사용법 문서를 쓴다**

`skills/concept-slides/tests/README.md`:

````markdown
# 검사기 fixture

`assets/deck.html`의 자기검사기를 시험한다. 껍데기는 복사하지 않고 `deck.html`에서
끌어오므로 검사기가 갈라지지 않는다.

## 돌리는 법

```bash
cd skills/concept-slides
node tests/build.mjs broken
```

`tests/out/broken.html`을 브라우저로 열고 콘솔에서:

```js
__deckCheck()
```

## 대조군

| 파일 | 기대 |
|---|---|
| `tests/out/broken.html` | 아래 목록이 전부 잡힌다 |
| `assets/deck.html` (그대로 열기) | 위반 0건 |

## broken.html 에서 나와야 하는 위반

(Task 11에서 채운다. 게이트를 붙일 때마다 한 줄씩 늘린다.)
````

- [ ] **Step 7: 커밋**

```bash
git add .gitignore skills/concept-slides/tests
git commit -m "test(concept-slides): add checker fixture harness"
```

---

### Task 2: 옛 게이트를 걷어낸다

**Files:**
- Modify: `skills/concept-slides/assets/deck.html:591-694` (검사기 블록)

**Interfaces:**
- Consumes: Task 1의 `tests/out/broken.html`
- Produces: `check()`가 새 게이트를 받을 수 있게 비워진 상태. 뒤 작업이 쓰는 것 — `proseLen(root)` 도움 함수, `KNOWN_KINDS`, `GOAL_KINDS`, `BODY_KINDS`, `BEATS`, `NO_GOAL_KINDS` 상수.

- [ ] **Step 1: 지금 위반 개수를 기록한다**

`node tests/build.mjs broken` 후 브라우저에서 `__deckCheck()`를 호출하고 반환 배열을 적어 둔다. Step 4에서 이것과 비교한다.

- [ ] **Step 2: 폐기 대상 상수와 검사를 지운다**

`deck.html`에서 아래를 **삭제**한다.

- `FULL_BEATS`, `CONCEPT_BEATS`, `FLOOR` 상수 선언 (591~599행 부근)
- `data-concept` 없음 검사 (`'개념 장인데 data-concept가 없다 …'`)
- `data-track` 모르는 값 검사 (`'…는 모르는 값이다 — full 또는 light …'`)
- 장별 산문 하한 블록 (`const floor = (FLOOR[track] || {})[kind] ?? 0;` 부터 그 `if` 끝까지)
- `how` 장 `.steps` 3개 검사
- `recap` 장 `.quiz` 검사
- `analogy` 장 `.map`/`.caveat` 검사
- 함수 끝의 7단 완결성 블록 (`const byConcept = {};` 부터 `Object.keys(byConcept).forEach(...)` 끝까지)
- `const track = s.dataset.track || 'full';` 줄

- [ ] **Step 3: 남길 상수와 도움 함수를 정리한다**

`TOPIC_TITLE` 바로 아래를 다음으로 만든다:

```js
  const TOPIC_TITLE = /(개요|소개|이란|이란\?|란\?|의 구조|의 특징|의 종류|의 장점|정리하면)\s*$/;
  const KNOWN_KINDS = ['cover', 'opening', 'goal', 'intro', 'precise', 'example', 'pitfall', 'closing'];
  const GOAL_KINDS  = ['goal', 'intro', 'precise', 'example', 'pitfall'];
  const BODY_KINDS  = ['intro', 'precise', 'example', 'pitfall'];   // 목표를 실제로 설명하는 장
  const BEATS       = ['intro', 'precise', 'example'];              // 이 순서를 지켜야 한다
  const NO_GOAL_KINDS = ['cover', 'opening', 'closing'];

  // 하한 집계는 .prose 만 센다. <details> 내부는 펼쳐져 있어도 세지 않는다.
  const proseLen = (root) => [...root.querySelectorAll('.prose')]
    .filter(e => !e.closest('details'))
    .map(e => e.textContent.replace(/\s+/g, ' ').trim())
    .join(' ').length;
```

- [ ] **Step 4: 남겨야 하는 검사가 그대로 있는지 확인한다**

아래는 **지우지 않는다.** Step 2에서 실수로 함께 지웠으면 되살린다.

- 세로·가로 넘침 (`s.scrollHeight - s.clientHeight`, `s.scrollWidth - s.clientWidth`)
- 코드 가로 스크롤바 (`p.scrollWidth - p.clientWidth`)
- `<pre>`가 `.slide` 직속이면 위반
- `<pre>`와 같은 부모 안에 `.prose` 해설
- 제목(`.headline` 또는 `.lede`) 존재
- 주제어 제목 금지 (`TOPIC_TITLE`)
- 이모지 2개 상한
- 불릿 상한 — `recap` 분기를 없애고 모든 장 6개로 바꾼다:

```js
      const bullets = s.querySelectorAll('.pain li, .takeaways li').length;
      if (bullets > 6) add(`불릿 ${bullets}개 (한계 6)`);
```

- [ ] **Step 5: 걷어낸 만큼 위반이 줄었는지 확인한다**

Run: `node tests/build.mjs broken` 후 브라우저에서 `__deckCheck()`
Expected: Step 1의 목록에서 옛 게이트 항목이 사라졌다. 남는 것은 넘침·제목·코드·이모지 계열뿐이다. `myth` 장이 남아 있어도 아무 위반이 안 난다 — 아직 모르는 `data-kind` 검사를 안 붙였기 때문이다.

- [ ] **Step 6: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "refactor(concept-slides): drop the fixed-beat and per-slide floor gates"
```

---

### Task 3: 모르는 `data-kind`를 잡는다

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (`check()` 안 슬라이드 순회)

**Interfaces:**
- Consumes: `KNOWN_KINDS`
- Produces: 옛 `data-kind`가 남아 있으면 잡히므로, 이후 작업이 이전 마크업을 조용히 통과시키지 않는다.

- [ ] **Step 1: 검사를 넣는다**

슬라이드 순회 안 `const at = ...` 다음에 넣는다:

```js
      if (!KNOWN_KINDS.includes(kind))
        add(`data-kind="${kind}"는 모르는 값이다 — ${KNOWN_KINDS.join(' / ')} 중 하나여야 한다`);
```

- [ ] **Step 2: 잡히는지 확인한다**

Run: `node tests/build.mjs broken` 후 `__deckCheck()`
Expected: `9번(myth): data-kind="myth"는 모르는 값이다 …`가 포함된다. (장 번호는 조각 순서에 따르므로 다를 수 있다. `myth` 장이 잡히는지만 본다.)

- [ ] **Step 3: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): reject unknown data-kind values"
```

---

### Task 4: 학습목표 선언 게이트

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (`check()` — 슬라이드 순회 **뒤**)

**Interfaces:**
- Consumes: `proseLen`
- Produces: `outcomeItems()`와 `declaredGoals()` — 목표 선언을 읽는 도움 함수. Task 5~7의 게이트와 Task 9의 HUD 표시가 쓴다. **`check()` 밖**에 만든다.

- [ ] **Step 1: 목표 목록을 읽는 도움 함수를 만든다**

`proseLen` 정의 아래에 넣는다. `check()` 밖이다 — Task 9의 HUD가 같은 목록을 쓴다.

```js
  // 챕터 열기 장의 .outcomes 가 목표 선언이다. 나머지 검사가 이 목록을 기준으로 집계한다.
  const outcomeItems = () => [...document.querySelectorAll('.slide[data-kind="opening"] .outcomes li')];
  const declaredGoals = () => outcomeItems().map(li => li.dataset.goal).filter(Boolean);
```

- [ ] **Step 2: 선언 게이트를 넣는다**

슬라이드 `forEach` 순회가 끝난 **직후**, `document.body.className = cw;` 앞에 넣는다:

```js
    // ── 챕터 열기 장 ─────────────────────────────────────
    const openings = slides.filter(s => s.dataset.kind === 'opening');
    if (!openings.length) issues.push('챕터 열기 장(data-kind="opening")이 없다 — 독자가 뭘 배우는지 모른다');

    const items = outcomeItems();
    const withGoal = items.filter(li => li.dataset.goal);
    if (withGoal.length < 2)
      issues.push(`학습목표 선언 ${withGoal.length}개 (하한 2) — 열기 장에 <ul class="outcomes"><li data-goal="g1">…</li> 를 둬라`);

    items.forEach((li, n) => {
      const text = li.textContent.replace(/\s+/g, ' ').trim();
      if (!li.dataset.goal)
        issues.push(`학습목표 ${n + 1}번에 data-goal이 없다 — 이 목표는 아무 장에도 연결되지 않는다`);
      if (!/수 있다\s*\.?$/.test(text))
        issues.push(`학습목표 ${n + 1}번이 "할 수 있게 되는 것"이 아니다 ("${text.slice(0, 24)}…") — "…할 수 있다"로 써라. 퀴즈로 확인할 수 없는 목표는 목표가 아니다`);
    });

    const seen = new Set();
    declaredGoals().forEach(g => {
      if (seen.has(g)) issues.push(`학습목표 "${g}"가 두 번 선언됐다`);
      seen.add(g);
    });

    openings.forEach(s => {
      const chars = proseLen(s);
      if (chars < 400)
        issues.push(`열기 장 산문 ${chars}자 (하한 400) — 왜 이걸 배우는지, 건너뛰면 뒤에서 무엇이 막히는지 문단으로 써라`);
    });
```

- [ ] **Step 3: 잡히는지 확인한다**

Run: `node tests/build.mjs broken` 후 `__deckCheck()`
Expected: 아래 셋이 포함된다.

```
학습목표 선언 1개 (하한 2) — …
학습목표 1번이 "할 수 있게 되는 것"이 아니다 ("이벤트 루프에 대해 안다…") — …
열기 장 산문 11자 (하한 400) — …
```

- [ ] **Step 4: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): gate learning-outcome declarations"
```

---

### Task 5: 목표와 장의 연결 게이트

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (`check()` — 슬라이드 순회 안 + 순회 뒤)

**Interfaces:**
- Consumes: `GOAL_KINDS`, `NO_GOAL_KINDS`, `BODY_KINDS`, `declaredGoals()`
- Produces: 목표별 장 묶음. Task 6~8이 같은 방식으로 다시 모은다.

- [ ] **Step 1: 슬라이드 단위 검사를 넣는다**

Task 3의 `data-kind` 검사 바로 아래에 넣는다:

```js
      if (GOAL_KINDS.includes(kind) && !s.dataset.goal)
        add('설명 장인데 data-goal이 없다 — 어느 목표에 속하는지 알 수 없어 3박자·퀴즈 검사에서 통째로 빠진다');
      if (NO_GOAL_KINDS.includes(kind) && s.dataset.goal)
        add(`data-goal="${s.dataset.goal}"을 붙일 장이 아니다 — ${kind} 장은 목표에 속하지 않는다`);
```

- [ ] **Step 2: 미아와 빈 목표 검사를 넣는다**

Task 4가 넣은 블록 아래에 이어 붙인다:

```js
    // ── 목표 ↔ 장 연결 ───────────────────────────────────
    const goals = declaredGoals();
    const bodyOf = (g) => slides.filter(s => s.dataset.goal === g && BODY_KINDS.includes(s.dataset.kind));

    slides.forEach((s, n) => {
      const g = s.dataset.goal;
      if (g && !goals.includes(g))
        issues.push(`${n + 1}번(${s.dataset.kind}): data-goal="${g}"가 열기 장에 선언되지 않았다 — 미아 장이다`);
    });

    goals.forEach(g => {
      if (!bodyOf(g).length)
        issues.push(`학습목표 "${g}": 설명하는 장이 하나도 없다 — 선언만 하고 안 가르쳤다`);
    });
```

- [ ] **Step 3: 잡히는지 확인한다**

Run: `node tests/build.mjs broken` 후 `__deckCheck()`
Expected: 아래가 포함된다.

```
3번(goal): 설명 장인데 data-goal이 없다 — …
…번(intro): data-goal="g9"가 열기 장에 선언되지 않았다 — 미아 장이다
…번(closing): data-goal="g1"을 붙일 장이 아니다 — closing 장은 목표에 속하지 않는다
```

- [ ] **Step 4: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): gate goal-to-slide wiring"
```

---

### Task 6: 3박자 순서 게이트

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (`check()` — Task 5 블록 아래)

**Interfaces:**
- Consumes: `BEATS`, `goals`, `slides`
- Produces: 없음(게이트만)

**규칙:** 목표 구역에서 첫 `intro`가 첫 `precise`보다 앞, 첫 `precise`가 첫 `example`보다 앞이면 통과한다. **그 뒤 되풀이는 허용한다** — `intro precise example intro precise example`도 통과다. 장 수는 세지 않는다.

- [ ] **Step 1: 검사를 넣는다**

```js
    // ── 3박자 순서: 쉬운 설명 → 엄밀한 설명 → 실제 예시 ──
    const BEAT_LABEL = { intro: '쉬운 설명', precise: '엄밀한 설명', example: '실제 예시' };
    goals.forEach(g => {
      const firstAt = {};
      slides.forEach((s, n) => {
        if (s.dataset.goal !== g) return;
        const k = s.dataset.kind;
        if (BEATS.includes(k) && firstAt[k] === undefined) firstAt[k] = n;
      });
      const missing = BEATS.filter(k => firstAt[k] === undefined);
      if (missing.length) {
        issues.push(`학습목표 "${g}": ${missing.map(k => BEAT_LABEL[k]).join(', ')} 장이 없다 — 쉬운 설명 → 엄밀한 설명 → 실제 예시가 각각 최소 한 장 필요하다`);
        return;
      }
      for (let a = 0; a < BEATS.length - 1; a++) {
        const [x, y] = [BEATS[a], BEATS[a + 1]];
        if (firstAt[x] > firstAt[y])
          issues.push(`학습목표 "${g}": "${BEAT_LABEL[y]}" 장이 "${BEAT_LABEL[x]}" 장보다 먼저 나온다 (${firstAt[y] + 1}번 < ${firstAt[x] + 1}번) — 쉬운 설명부터 시작해라`);
      }
    });
```

메시지가 라벨을 따옴표로 감싸고 뒤에 "장"을 붙인다. `BEAT_LABEL` 값마다 붙을 조사가 달라지는데(예시**가** / 설명**이**) 템플릿으로는 맞출 수 없으므로, 조사가 필요 없는 문장으로 짰다.

- [ ] **Step 2: 잡히는지 확인한다**

Run: `node tests/build.mjs broken` 후 `__deckCheck()`
Expected: 다음이 포함된다.

```
학습목표 "g1": "실제 예시" 장이 "엄밀한 설명" 장보다 먼저 나온다 (…번 < …번) — 쉬운 설명부터 시작해라
```

- [ ] **Step 3: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): gate the intro-precise-example ordering"
```

---

### Task 7: 목표별 퀴즈와 목표 단위 산문 하한

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (`check()` — Task 6 블록 아래)

**Interfaces:**
- Consumes: `proseLen`, `goals`, `slides`
- Produces: 없음(게이트만)

**퀴즈 위치는 안 따진다.** `data-goal`만 본다. 그래서 닫기 장에 모아도 되고 목표 구역 끝에 둬도 통과한다.

- [ ] **Step 1: 검사를 넣는다**

```js
    // ── 목표별 퀴즈와 산문 총량 ──────────────────────────
    goals.forEach(g => {
      const quizzes = document.querySelectorAll(`.quiz[data-goal="${g}"]`).length;
      if (!quizzes)
        issues.push(`학습목표 "${g}": 확인 퀴즈가 없다 — <details class="quiz" data-goal="${g}"> 를 하나 이상 둬라. 목표를 세웠으면 확인해야 한다`);

      const chars = slides
        .filter(s => s.dataset.goal === g)
        .reduce((n, s) => n + proseLen(s), 0);
      if (chars < 1200)
        issues.push(`학습목표 "${g}": 산문 ${chars}자 (하한 1200) — 말로 보충해야 이해되는 상태다. 장을 늘려도 되고 한 장을 길게 써도 된다`);
    });
```

- [ ] **Step 2: 잡히는지 확인한다**

Run: `node tests/build.mjs broken` 후 `__deckCheck()`
Expected: 아래 둘이 포함된다.

```
학습목표 "g1": 확인 퀴즈가 없다 — …
학습목표 "g1": 산문 …자 (하한 1200) — …
```

- [ ] **Step 3: 하한이 목표 단위로 합쳐지는지 확인한다**

`tests/slides-broken.html`의 `g1` 장들에 `.prose` 문단을 더해 합계를 1200자 넘긴다(각 장은 여전히 짧게 둔다 — 장 단위 하한이 없다는 것을 확인하는 것이 목적이다).

Run: `node tests/build.mjs broken` 후 `__deckCheck()`
Expected: `학습목표 "g1": 산문 …자 (하한 1200)`이 **사라진다.** 짧은 장이 여러 개여도 통과한다.

확인했으면 더한 문단을 되돌린다 — 이 fixture는 음성 대조군이라 위반이 남아 있어야 한다.

- [ ] **Step 4: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): gate per-goal quizzes and prose volume"
```

---

### Task 8: 비유 무결성과 학습 시간 알림

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (`check()` 슬라이드 순회 안 + 함수 끝, 그리고 자동 실행 블록)

**Interfaces:**
- Consumes: `proseLen`
- Produces: `window.__deckStats` — `{ minutes, prose, codeLines, figures, quizzes }`. 사람이 분량을 검산할 때 쓴다.

- [ ] **Step 1: 비유 무결성 검사를 넣는다**

슬라이드 순회 안, `TOPIC_TITLE` 검사 아래에 넣는다. **`data-analogy`가 붙은 장에만 적용한다** — 비유 자체는 의무가 아니다.

```js
      if (s.hasAttribute('data-analogy')) {
        if (!s.querySelector('.map')) add('비유를 썼다고 표시했는데 매핑표(.map)가 없다 — Y의 어느 부분이 X의 무엇인지 밝혀라');
        if (!s.querySelector('.caveat')) add('비유를 썼다고 표시했는데 "깨지는 지점"(.caveat)이 없다 — 독자가 비유를 사실로 믿는다');
      }
```

- [ ] **Step 2: 학습 시간 추정을 넣는다**

`check()` 끝의 `render();` **다음**, `return issues;` **앞**에 넣는다:

```js
    // ── 학습 시간 추정 (위반이 아니다. issues 에 넣지 않는다) ──
    const proseAll = slides.reduce((n, s) => n + proseLen(s), 0);
    const codeLines = [...document.querySelectorAll('.slide pre')]
      .reduce((n, p) => n + p.textContent.trim().split('\n').length, 0);
    const figures = document.querySelectorAll('.slide svg').length;
    const quizzes = document.querySelectorAll('.quiz').length;
    const minutes = Math.round(proseAll / 400 + codeLines * 0.1 + figures * 0.5 + quizzes);
    window.__deckStats = { minutes, prose: proseAll, codeLines, figures, quizzes };
```

`codeLines * 0.1`은 한 줄당 6초다. `figures * 0.5`는 그림당 30초, `quizzes`는 하나당 1분이다. 어림값이다.

- [ ] **Step 3: 자동 실행 블록에서 알린다**

파일 끝의 자동 실행 부분을 다음으로 바꾼다:

```js
  window.__deckCheck = check;
  const found = check();
  const st = window.__deckStats;
  console.info(`[concept-slides] 슬라이드 ${slides.length}장 · 추정 학습 시간 약 ${st.minutes}분 (산문 ${st.prose}자, 코드 ${st.codeLines}줄, 그림 ${st.figures}개, 퀴즈 ${st.quizzes}개)`);
  if (st.minutes < 50 || st.minutes > 140)
    console.warn(`[concept-slides] 추정 학습 시간 ${st.minutes}분 — 목표는 60~120분이다. 위반은 아니지만 커리큘럼의 챕터 분할을 다시 봐라`);
  if (found.length) console.warn('[concept-slides] 품질 게이트 위반 ' + found.length + '건:\n' + found.map(s => ' • ' + s).join('\n'));
  else console.info('[concept-slides] 품질 게이트 통과');
```

- [ ] **Step 4: 확인한다**

Run: `node tests/build.mjs broken` 후 `__deckCheck()`와 `__deckStats`
Expected:
- 위반 목록에 `비유를 썼다고 표시했는데 매핑표(.map)가 없다 …`와 `… "깨지는 지점"(.caveat)이 없다 …`가 포함된다.
- `__deckStats.minutes`가 숫자다. broken은 산문이 거의 없으므로 50분 미만 경고가 콘솔에 뜬다.
- **위반 배열에 학습 시간 항목이 없다.** 알림은 issues에 들어가면 안 된다.

- [ ] **Step 5: 비유 표시가 없으면 안 묻는지 확인한다**

`tests/slides-broken.html`의 `data-analogy` 속성을 잠시 지운다.

Run: `node tests/build.mjs broken` 후 `__deckCheck()`
Expected: 매핑표·깨지는 지점 위반 둘이 **사라진다.** 비유가 의무가 아님을 확인하는 단계다. 확인 후 속성을 되돌린다.

- [ ] **Step 6: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): gate analogy integrity only when declared, report study time"
```

---

### Task 9: 뼈대 UI — 이어서 읽기와 현재 목표 표시

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (HUD 마크업, `<style>`, `render()`/`go()` 주변, 키 처리)

**Interfaces:**
- Consumes: `declaredGoals()`
- Produces: 없음(읽기 경험만)

- [ ] **Step 1: HUD에 목표 표시 칸을 만든다**

`<div class="hud">` 안, `<span class="hint">` 앞에 넣는다:

```html
  <span class="goalnow" id="goalnow"></span>
```

- [ ] **Step 2: 이어서 읽기 배너 마크업을 넣는다**

`<div class="hud">` **앞**에 넣는다:

```html
<div id="resume" hidden>
  <span id="resume-text"></span>
  <button type="button" id="resume-go">이어 보기</button>
  <button type="button" id="resume-restart">처음부터</button>
</div>
```

- [ ] **Step 3: CSS를 더한다**

`<style>` 안, `.hud` 규칙 아래에 넣는다:

```css
.hud .goalnow { color: var(--ink-2); opacity: .8; font-variant-numeric: tabular-nums; }

#resume {
  position: fixed; left: 50%; top: 1.1em; transform: translateX(-50%);
  z-index: 30; display: flex; align-items: center; gap: .7em;
  padding: .55em .9em; border: 1px solid var(--line); border-radius: 10px;
  background: var(--bg); box-shadow: 0 6px 24px rgb(0 0 0 / .18);
  font-size: .82em;
}
#resume[hidden] { display: none; }
#resume button {
  font: inherit; cursor: pointer; padding: .3em .7em;
  border: 1px solid var(--line); border-radius: 6px;
  background: transparent; color: var(--ink);
}
#resume button:hover { border-color: var(--accent); color: var(--accent); }
@media print { #resume { display: none !important; } }
```

`--bg` `--ink` `--ink-2` `--line` `--accent`는 파일 위쪽 `:root`에 이미 있다. 없는 이름을 쓰면 안 된다.

- [ ] **Step 4: 목표 표시를 `render()`에 붙인다**

`render()` 안 `fill.style.width = …` 다음에 넣는다:

```js
    const s = slides[i], g = s.dataset.goal;
    const KIND_LABEL = {
      cover: '', opening: '이번 챕터 목표', goal: '목표 시작',
      intro: '쉬운 설명', precise: '엄밀한 설명', example: '실제 예시',
      pitfall: '함정과 오해', closing: '이해 확인',
    };
    const label = KIND_LABEL[s.dataset.kind] ?? '';
    if (g) {
      const all = declaredGoals();
      const at = all.indexOf(g);
      goalnow.textContent = at < 0 ? label : `목표 ${at + 1}/${all.length}${label ? ' · ' + label : ''}`;
    } else {
      goalnow.textContent = label;
    }
```

`render()` 위쪽 `const cur = …` 줄에 `goalnow`를 함께 잡아 둔다:

```js
  const cur = document.getElementById('cur'), fill = document.getElementById('fill');
  const goalnow = document.getElementById('goalnow');
```

- [ ] **Step 5: 마지막 장을 기억한다**

`go()`의 `history.replaceState(...)` 다음에 넣는다:

```js
    try { localStorage.setItem(RESUME_KEY, String(i + 1)); } catch { /* 시크릿 모드 */ }
```

`RESUME_KEY`는 `const slides = …` 근처에 만든다. 챕터 파일마다 따로 기억해야 하므로 경로를 섞는다:

```js
  const RESUME_KEY = 'concept-slides:' + location.pathname;
```

- [ ] **Step 6: 열 때 배너를 띄운다**

파일 끝의 `go((parseInt(location.hash.slice(1), 10) || 1) - 1, false);` 줄을 다음으로 바꾼다:

```js
  const hashAt = parseInt(location.hash.slice(1), 10);
  go((hashAt || 1) - 1, false);

  // 주소에 장 번호가 있으면 그게 이긴다. 없을 때만 이어 보기를 제안한다.
  if (!hashAt) {
    let saved = 0;
    try { saved = parseInt(localStorage.getItem(RESUME_KEY) || '0', 10); } catch { /* 무시 */ }
    if (saved > 1 && saved <= slides.length) {
      const box = document.getElementById('resume');
      document.getElementById('resume-text').textContent = `지난번 ${saved}번 장까지 봤다`;
      box.hidden = false;
      document.getElementById('resume-go').onclick = () => { go(saved - 1); box.hidden = true; };
      document.getElementById('resume-restart').onclick = () => { go(0); box.hidden = true; };
    }
  }
```

- [ ] **Step 7: 도움말에 한 줄 더한다**

`#help` 안 마지막 `<div>` 앞에 넣는다:

```html
  <div><kbd>Esc</kbd>이어 보기 알림 닫기</div>
```

그리고 `Escape` 키 처리에 배너 닫기를 더한다. `document.body.classList.remove('help-on');` 다음 줄:

```js
      const rb = document.getElementById('resume');
      if (rb) rb.hidden = true;
```

- [ ] **Step 8: 손으로 확인한다**

Run: `node tests/build.mjs broken` 후 브라우저로 `tests/out/broken.html`을 연다.
Expected:
- HUD 오른쪽에 `목표 1/1 · 쉬운 설명` 같은 표시가 뜨고, 화살표로 넘길 때 바뀐다.
- 5번 장쯤으로 넘긴 뒤 **새로고침 없이 주소의 `#5`를 지우고** 다시 열면 "지난번 5번 장까지 봤다" 배너가 뜬다.
- "이어 보기"를 누르면 그 장으로 가고, "처음부터"를 누르면 1번으로 간다.
- `Esc`로 배너가 닫힌다.

- [ ] **Step 9: 검사기가 안 깨졌는지 확인한다**

Run: 브라우저에서 `__deckCheck()`
Expected: Task 8 끝의 위반 목록과 같다. **새 위반이 늘지 않았다.** 배너와 HUD는 `.slide` 밖이므로 넘침 검사에 영향이 없어야 한다.

- [ ] **Step 10: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): add resume-reading and current-goal indicator"
```

---

### Task 10: `.outcomes`와 `.progress-note` 스타일

**Files:**
- Modify: `skills/concept-slides/assets/deck.html` (`<style>`)

**Interfaces:**
- Consumes: 없음
- Produces: `.outcomes`, `.progress-note` — Task 12의 예시 챕터와 모든 챕터의 열기 장이 쓴다.

- [ ] **Step 1: 스타일을 더한다**

`.takeaways` 규칙 아래에 넣는다. `.takeaways`의 번호 매기기 방식을 그대로 따라간다.

```css
/* 챕터 열기 장 — 이 챕터가 끝나면 할 수 있게 되는 것 */
.outcomes { margin: 0; padding: 0; list-style: none; counter-reset: o; display: grid; gap: .55em; }
.outcomes li {
  counter-increment: o; position: relative; padding-left: 2em;
  font-size: 1.08em; font-weight: 600;
}
.outcomes li::before {
  content: counter(o); position: absolute; left: 0; top: .1em;
  width: 1.4em; height: 1.4em; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--accent); color: var(--bg);
  font-size: .72em; font-weight: 700;
}
.progress-note { color: var(--ink-2); font-size: .85em; }
.progress-note a { color: var(--accent); }
```

- [ ] **Step 2: 눈으로 확인한다**

`tests/slides-broken.html`의 열기 장에 `<p class="progress-note">전체 6챕터 중 2번째</p>`를 잠시 넣고 조립해서 연다.

Run: `node tests/build.mjs broken`
Expected: 목표 목록에 번호 원이 붙고, 진도 문단이 흐린 작은 글씨로 나온다. 넘치지 않는다. 확인 후 되돌린다.

- [ ] **Step 3: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "style(concept-slides): add outcomes list and progress note"
```

---

### Task 11: 기대 위반 목록을 문서로 굳힌다

**Files:**
- Modify: `skills/concept-slides/tests/README.md`

**Interfaces:**
- Consumes: Task 3~8이 넣은 게이트
- Produces: 회귀 확인 기준. 이후 검사기를 고칠 때 이 목록과 대조한다.

- [ ] **Step 1: 실제 출력을 받아 적는다**

Run: `node tests/build.mjs broken` 후 브라우저에서 `__deckCheck()`
반환 배열을 그대로 복사한다. **손으로 짓지 말고 실제 출력을 쓴다.**

- [ ] **Step 2: README를 채운다**

`tests/README.md`의 "broken.html 에서 나와야 하는 위반" 절을 실제 출력으로 바꾼다. 게이트 이름과 메시지를 표로 짝지어 둔다:

```markdown
## broken.html 에서 나와야 하는 위반

| 게이트 | 메시지 (앞부분) |
|---|---|
| 모르는 data-kind | `data-kind="myth"는 모르는 값이다` |
| 목표 선언 수 | `학습목표 선언 1개 (하한 2)` |
| 목표 어미 | `학습목표 1번이 "할 수 있게 되는 것"이 아니다` |
| 열기 장 산문 | `열기 장 산문 11자 (하한 400)` |
| data-goal 없음 | `설명 장인데 data-goal이 없다` |
| 붙일 곳이 아닌 data-goal | `data-goal="g1"을 붙일 장이 아니다` |
| 미아 목표값 | `data-goal="g9"가 열기 장에 선언되지 않았다` |
| 3박자 순서 | `"실제 예시" 장이 "엄밀한 설명" 장보다 먼저 나온다` |
| 목표별 퀴즈 | `학습목표 "g1": 확인 퀴즈가 없다` |
| 목표 산문 하한 | `학습목표 "g1": 산문 …자 (하한 1200)` |
| 비유 무결성 | `비유를 썼다고 표시했는데 매핑표(.map)가 없다` |

총 위반 <실제 개수>건. 학습 시간 알림은 **위반이 아니다** — 콘솔에만 나오고
`__deckCheck()` 배열에는 없어야 한다.
```

`<실제 개수>`는 Step 1에서 센 숫자로 채운다.

- [ ] **Step 3: 커밋**

```bash
git add skills/concept-slides/tests/README.md
git commit -m "test(concept-slides): record expected checker violations"
```

---

### Task 12: 예시 챕터를 새 구조로 갈아 끼운다 (양성 대조군)

**Files:**
- Modify: `skills/concept-slides/assets/deck.html:284-492` (`<main class="stage">` 안 슬라이드 전체)

**Interfaces:**
- Consumes: Task 3~10의 게이트와 스타일 전부
- Produces: **`deck.html`을 그대로 열면 위반 0건.** 이게 양성 대조군이고, 스킬이 복사할 견본이다.

**주제:** 자바스크립트의 이벤트 루프. 개발자 학습자료답고, 비유가 잘 맞는 목표와 안 맞는 목표가 섞여 있어 `data-analogy`를 쓰는 경우와 안 쓰는 경우를 둘 다 보여줄 수 있다.

**분량:** 견본이므로 목표 **2개**만 넣는다. 실제 챕터는 4~6개지만, 견본은 구조를 보여주는 것이 목적이다. 목표당 산문 1200자는 채워야 게이트를 통과한다.

- [ ] **Step 1: 옛 예시를 지우고 표지와 열기 장을 쓴다**

`<main class="stage" id="stage">`와 `</main>` 사이를 전부 새로 쓴다. 먼저 두 장:

```html
  <section class="slide" data-kind="cover">
    <p class="eyebrow">자바스크립트 실행 모델 · 3장</p>
    <h1 class="headline">한 줄씩만 돌리는 언어가 <span class="hl">기다리지 않는</span> 법</h1>
    <p class="meta">읽는 데 약 90분 · 학습목표 2개</p>
  </section>

  <section class="slide" data-kind="opening">
    <h2 class="headline">이 장을 지나면 "왜 순서가 이렇게 나오죠"를 스스로 답할 수 있다</h2>
    <div class="split wide-left">
      <div class="stack">
        <p class="prose">…</p>
        <p class="prose">…</p>
      </div>
      <div class="stack">
        <ul class="outcomes">
          <li data-goal="g1">setTimeout 0과 Promise.resolve().then 중 무엇이 먼저 실행되는지 근거를 들어 고를 수 있다</li>
          <li data-goal="g2">화면이 멈추는 코드와 안 멈추는 코드를 구분할 수 있다</li>
        </ul>
        <p class="progress-note">전체 8장 중 3번째 · 앞: 함수 호출과 콜 스택 · 다음: async/await가 풀리는 순서</p>
      </div>
    </div>
  </section>
```

`.prose` 두 문단에 쓸 내용을 못 박는다. **합쳐서 400자 이상**이어야 한다.

- 첫 문단: 콘솔 출력 순서가 코드 순서와 달라서 겪는 구체적 혼란 하나. "왜 이게 나중에 찍히지"에서 멈춘 경험을 되살린다.
- 둘째 문단: 이걸 모르면 뒤에서 무엇이 막히는지. async/await, 렌더링 끊김, 경쟁 상태 디버깅으로 이어진다는 것. **"건너뛰면 뒤에서 뭐가 막히는가"가 이 장의 핵심이다.**

- [ ] **Step 2: 목표 1의 3박자를 쓴다**

`goal` 구분 장 하나 + `intro` → `precise` → `example` 각 한 장. `intro`에는 비유를 쓰므로 `data-analogy`를 붙이고 `.map`과 `.caveat`을 둔다.

```html
  <section class="slide" data-kind="goal" data-goal="g1">
    <p class="eyebrow">학습목표 1</p>
    <h2 class="headline">먼저 줄 선 일이 먼저 처리되는 게 아니다</h2>
  </section>

  <section class="slide" data-kind="intro" data-goal="g1" data-analogy>
    <h2 class="headline">창구 하나에 줄이 두 개 있는 은행을 떠올려 보자</h2>
    <div class="split wide-left">
      <div class="stack">
        <p class="prose">…</p>
        <div class="caveat"><b>이 비유가 깨지는 지점</b>…</div>
      </div>
      <table class="map">
        <thead><tr><th>은행</th><th>자바스크립트</th></tr></thead>
        <tbody>
          <tr><td>창구 직원 한 명</td><td>단일 스레드</td></tr>
          <tr><td>일반 줄</td><td>매크로태스크 큐</td></tr>
          <tr><td>우대 줄</td><td>마이크로태스크 큐</td></tr>
          <tr><td>손님 한 명을 끝낸 직후</td><td>태스크 하나가 끝난 직후</td></tr>
        </tbody>
      </table>
    </div>
  </section>
```

- `.prose`: 창구가 하나뿐이라 동시에 두 손님을 못 받는다는 것, 그리고 한 손님을 끝낼 때마다 **우대 줄을 먼저 비운다**는 규칙. 매핑표가 대응만 보여주므로, 산문은 표가 못 하는 말(왜 그 규칙이 필요한가)을 한다.
- `.caveat`: 은행 직원은 지치고 손님은 순서를 양보할 수 있지만 큐는 그렇지 않다. 그리고 우대 줄이 끝없이 늘면 일반 줄이 영원히 밀린다 — 실제로 마이크로태스크 무한 생성이 화면을 멈추는 원인이다. **비유가 오히려 이 위험을 감춘다는 것을 밝힌다.**

```html
  <section class="slide" data-kind="precise" data-goal="g1">
    <h2 class="headline">태스크 하나가 끝나면 마이크로태스크 큐를 <span class="hl">전부</span> 비운다</h2>
    <ol class="steps">
      <li><b>콜 스택이 빈다</b><span class="prose why">…</span></li>
      <li><b>마이크로태스크 큐를 비운다</b><span class="prose why">…</span></li>
      <li><b>필요하면 렌더링한다</b><span class="prose why">…</span></li>
      <li><b>매크로태스크 하나를 꺼낸다</b><span class="prose why">…</span></li>
    </ol>
  </section>
```

각 `<span class="prose why">`에 **왜 그 순서여야 하는가**를 쓴다. 단계 이름만 나열하면 안 된다. 특히 2번은 "하나만"이 아니라 "전부"인 이유(중간에 렌더링이 끼면 Promise 체인이 화면 상태와 어긋난다)를 쓴다.

```html
  <section class="slide" data-kind="example" data-goal="g1">
    <h2 class="headline">이 여섯 줄의 출력 순서가 규칙을 그대로 보여준다</h2>
    <div class="split">
      <div class="stack">
        <pre><code>console.log('1');
setTimeout(() =&gt; console.log('2'), 0);
Promise.resolve().then(() =&gt; console.log('3'));
console.log('4');</code></pre>
        <p class="prose">…</p>
      </div>
      <div class="stack">
        <pre><code>1
4
3
2</code></pre>
        <p class="prose">…</p>
      </div>
    </div>
  </section>
```

- 코드는 **전체 폭 기준 70칸, 2단 배치 기준 40칸**을 넘기지 않는다. 가로 스크롤바가 생기면 위반이다.
- `<pre>`는 `.slide` 직속이면 위반이다. 위처럼 `.stack`으로 감싼다. **같은 `.stack` 안에** `.prose` 해설이 있어야 한다.
- 왼쪽 `.prose`: 1과 4가 먼저 나오는 이유(동기 코드는 콜 스택이 비기 전에 끝난다).
- 오른쪽 `.prose`: 3이 2보다 앞인 이유. `setTimeout(…, 0)`의 0이 "즉시"가 아니라 "매크로태스크 큐에 넣어라"라는 뜻임을 짚는다.

**목표 1의 `.prose` 합계가 1200자를 넘어야 한다.** 모자라면 `precise` 장의 `.why`를 늘리거나 `pitfall` 장을 한 장 더한다. 물을 타지 말고 설명을 더한다.

- [ ] **Step 3: 목표 2의 3박자를 쓴다**

같은 구조로 `goal` → `intro` → `precise` → `example`. **목표 2의 `intro`에는 `data-analogy`를 붙이지 않는다.** 비유 없이 구체적 상황(버튼을 눌렀는데 스피너가 안 도는 화면)으로 쉽게 들어간다. 비유가 의무가 아님을 견본으로 보여주는 것이 이 목표의 역할이다.

```html
  <section class="slide" data-kind="goal" data-goal="g2">
    <p class="eyebrow">학습목표 2</p>
    <h2 class="headline">화면이 멈추는 건 코드가 느려서가 아니라 큐를 안 놓아줘서다</h2>
  </section>

  <section class="slide" data-kind="intro" data-goal="g2">
    <h2 class="headline">버튼을 눌렀는데 스피너가 돌지 않는 화면부터 보자</h2>
    <div class="split wide-left">
      <div class="stack">
        <p class="prose">…</p>
        <p class="prose">…</p>
      </div>
      <ul class="pain">
        <li>버튼을 누르면 스피너를 켜는 코드를 먼저 넣었다.</li>
        <li>바로 뒤에서 큰 배열을 정렬한다.</li>
        <li>스피너는 정렬이 끝난 뒤에야 한 번 깜빡이고 사라진다.</li>
      </ul>
    </div>
  </section>
```

`.pain` 불릿은 6개를 넘기면 위반이다. 불릿은 **하한에 세어지지 않는다** — `.prose`가 인과를 져야 한다.

`precise` 장은 렌더링이 왜 태스크 사이에만 끼는지, `example` 장은 같은 정렬을 `setTimeout`으로 쪼개면 스피너가 도는 코드를 보여준다.

- [ ] **Step 4: 닫기 장을 쓴다**

```html
  <section class="slide" data-kind="closing">
    <h2 class="headline">답을 펴 보기 전에 스스로 말로 해 보자</h2>
    <div class="stack">
      <details class="quiz" data-goal="g1">
        <summary>…</summary>
        <p class="prose">…</p>
      </details>
      <details class="quiz" data-goal="g2">
        <summary>…</summary>
        <p class="prose">…</p>
      </details>
    </div>
  </section>
```

**퀴즈는 앞 장 문장을 그대로 묻지 않는다. 적용을 묻는다.** 예를 들어 g1은 `setTimeout` 안에서 `Promise`를 만드는 코드의 출력 순서를 묻고, g2는 "정렬을 몇 조각으로 쪼개면 되는가"가 아니라 "왜 쪼개면 스피너가 도는가"를 묻는다. 목표만 읽고 풀리는 퀴즈면 자료가 필요 없는 퀴즈다.

`<details>` 내부는 하한에 세어지지 않는다. 답을 길게 써도 산문 총량은 안 늘어난다.

- [ ] **Step 5: 위반 0건이 될 때까지 고친다**

브라우저에서 `assets/deck.html`을 직접 열고 `__deckCheck()`를 호출한다.

Expected: `[]` (빈 배열). 콘솔에 `품질 게이트 통과`가 찍힌다.

**넘침이 나오면 글을 깎지 말고 레이아웃을 고친다.** `.split`으로 2단으로 나누거나 장을 하나 더 쪼갠다. 목표당 장 수에는 제한이 없다.

- [ ] **Step 6: 학습 시간 알림을 확인한다**

Run: 브라우저 콘솔의 `__deckStats`
Expected: 견본은 목표 2개짜리라 90~120분에 못 미친다. **50분 미만 경고가 떠도 괜찮다** — 견본은 구조를 보여주는 것이 목적이고, 알림은 위반이 아니다. 이 사실을 `deck.html` 최상단 주석에 한 줄 적어 둔다:

```html
<!-- 이 파일은 견본이다. 학습목표 2개짜리라 학습 시간 알림이 뜬다.
     실제 챕터는 목표 4~6개, 60~70장, 60~120분이다. -->
```

- [ ] **Step 7: 커밋**

```bash
git add skills/concept-slides/assets/deck.html
git commit -m "feat(concept-slides): replace the sample deck with a goal-driven chapter"
```

---

### Task 13: `SKILL.md` 재작성

**Files:**
- Modify: `skills/concept-slides/SKILL.md` (전체)

**Interfaces:**
- Consumes: Task 3~12의 게이트 메시지와 마크업 계약
- Produces: `references/curriculum-design.md`와 `references/chapter-anatomy.md`를 가리키는 진입점. Task 14~15가 그 파일들을 만든다.

- [ ] **Step 1: frontmatter를 새로 쓴다**

`description`은 스킬이 언제 불릴지를 정한다. 지금 것은 "개념을 남에게 설명하는 자료"라서 커리큘럼 요청에 안 걸린다. 다음을 담는다.

- 걸려야 할 요청: 프로그래밍 언어·프레임워크·소프트웨어·AI를 **스스로 공부할** 학습자료, 학습 커리큘럼 설계, "챕터별로 만들어줘", 사내 온보딩 학습 과정
- 스킬의 성격: 커리큘럼을 먼저 세우고 **호출마다 챕터 하나**를 만든다. 혼자 읽어서 이해되는 자료이고 발표 슬라이드가 아니다.
- 걸리지 말아야 할 것: 발표용 슬라이드 요청. 그건 이 스킬이 만드는 것과 다르다는 것을 한 줄로 밝힌다.

- [ ] **Step 2: 워크플로우를 두 갈래로 쓴다**

문서 첫머리에 갈림길을 둔다. **이게 이번 재작성의 핵심이다.**

```markdown
## 어느 쪽인지 먼저 가른다

출력 폴더에 `curriculum.md`가 있는가?

- **없다** → "A. 커리큘럼 설계"로 간다. **HTML은 만들지 않는다.**
- **있다** → "B. 챕터 작성"으로 간다. 챕터 하나만 만든다.
```

**A. 커리큘럼 설계** 절에 담을 것:

1. 인터뷰 — 질문 4개를 한 번에 묻는다: ① 주제 ② 독자가 **이미 아는 것** ③ 과정 도달점 ④ 출력 폴더
2. `references/curriculum-design.md`를 읽고 챕터를 나눈다
3. `curriculum.md`를 쓴다 (형식은 설계 문서의 것을 그대로 옮긴다)
4. **사용자 승인을 받고 끝낸다.** 이어서 챕터를 만들지 않는다. 승인받은 뒤 "이제 1장부터 만들까요"라고 묻는다

**B. 챕터 작성** 절에 담을 것:

1. `curriculum.md`를 읽는다. "다음 챕터"는 `상태: 대기`인 첫 챕터다
2. 선수 챕터가 아직 `대기`면 사용자에게 알리고 그래도 진행할지 묻는다 — 앞 챕터 내용을 모르면 "앞에서 배운 것"을 쓸 수 없다
3. `references/chapter-anatomy.md`를 읽는다
4. `assets/deck.html`을 **복사해서** 슬라이드만 채운다. 뼈대 CSS/JS를 다시 쓰지 않는다. 시각자료는 `assets/svg-kit.md`의 조각을 복붙해 라벨만 바꾼다
5. `__deckCheck()` 위반이 0건이 될 때까지 고친다
6. `curriculum.md`의 상태를 `완성`으로 바꾼다 — **게이트 통과 뒤에** 바꾼다
7. 파일 경로와 조작키를 알려준다

- [ ] **Step 3: 마크업 계약 절을 쓴다**

설계 문서의 "마크업 계약"을 옮긴다. 담을 것:

- `data-kind` 여덟 값과 각각의 뜻
- `data-goal` — `goal`/`intro`/`precise`/`example`/`pitfall`에 필수, `cover`/`opening`/`closing`에는 붙이지 않음
- `data-analogy` — 비유를 쓴 장에만. **붙이면 매핑표와 깨지는 지점을 요구받는다**
- `.prose`로 써야 하한에 세어진다는 규칙, 그리고 세어지지 않는 것 목록(불릿·표 셀·코드·SVG 라벨·제목·`.caveat`·`<details>` 내부)
- 열기 장 마크업 예시, 닫기 장 마크업 예시

**폐기된 값(`define` `why` `analogy` `how` `real` `myth` `recap` `section`, `data-track`, `data-concept`)을 한 줄로 적어 둔다.** 옛 자료를 고치는 사람이 있을 수 있다.

- [ ] **Step 4: 품질 게이트 표를 쓴다**

Task 11의 `tests/README.md` 표를 기준으로, 게이트 이름 · 조건 · 못 채웠을 때 할 일을 표로 쓴다. **검사기의 실제 메시지와 어긋나면 안 된다.** 특히 다음을 명시한다.

- 산문 하한은 **목표 단위 1200자**이고 장 단위 하한은 없다
- 열기 장만 400자 별도 하한
- 학습 시간은 **알림이고 위반이 아니다**
- 비유는 검사하지 않는다. `data-analogy`를 붙였을 때만 검사한다

그 아래 "사람이 판단해야 하는 것"을 남긴다. 지금 SKILL.md의 것을 살리되 새 구조에 맞춘다.

- 말로 보충해야 이해되는 문장이 남아 있지 않은가
- 제목이 완결된 문장인가
- SVG 라벨을 본문에서 되풀이하지 않는가
- **비유가 억지가 아닌가 — 억지면 아예 빼라.** 검사기가 안 묻으므로 빼는 게 자유롭다
- 정의가 순환하지 않는가
- **퀴즈를 목표만 읽고 풀 수 있는가.** 그러면 자료가 필요 없는 퀴즈다

- [ ] **Step 5: 흔한 실패 표를 갱신한다**

지금 표에서 7단 전제인 줄("2장(왜 필요한가)을 건너뜀" 등)을 새 구조에 맞게 고친다. 새로 넣을 항목:

| 증상 | 원인 | 처방 |
|---|---|---|
| 목표는 4개인데 자료가 30분에 끝난다 | 목표를 너무 크게 잡아 각각을 얕게 썼다 | 커리큘럼으로 돌아가 목표를 쪼갠다 |
| 퀴즈가 앞 장 문장을 그대로 묻는다 | 회상이 아니라 재확인 | 적용을 묻는다 |
| 비유가 억지스럽다 | 안 맞는데 억지로 넣었다 | `data-analogy`를 떼고 구체적 상황으로 바꾼다 |
| 목표 하한이 안 채워진다 | 트랙이 아니라 이해가 얕다 | 물 타지 말고 `example`을 하나 더 쓴다 |

- [ ] **Step 6: 참고 파일 목록을 고친다**

`seven-beat.md`를 지우고 `curriculum-design.md`, `chapter-anatomy.md`를 넣는다.

- [ ] **Step 7: 사실 확인**

`SKILL.md`에 적은 게이트 조건·하한 숫자·메시지가 `deck.html`의 실제 코드와 맞는지 대조한다. `grep`으로 하한 숫자를 확인한다.

Run: `grep -n "1200\|400\|하한" skills/concept-slides/assets/deck.html`
Expected: `SKILL.md`에 쓴 숫자와 일치한다.

- [ ] **Step 8: 커밋**

```bash
git add skills/concept-slides/SKILL.md
git commit -m "docs(concept-slides): rewrite SKILL.md around curriculum and chapters"
```

---

### Task 14: `references/curriculum-design.md` 신규

**Files:**
- Create: `skills/concept-slides/references/curriculum-design.md`

**Interfaces:**
- Consumes: Task 13의 "A. 커리큘럼 설계"가 이 파일을 읽으라고 가리킨다
- Produces: `curriculum.md` 형식의 유일한 정의

- [ ] **Step 1: `curriculum.md` 형식을 못 박는다**

설계 문서의 `curriculum.md` 형식 블록을 그대로 옮긴다. 항목마다 왜 필요한지 한 줄씩 붙인다. 특히 **`상태:`가 호출 사이의 기억이라는 것**과 **목표 식별자가 챕터 안에서만 유효하고 챕터마다 `g1`부터 다시 센다는 것**을 밝힌다.

- [ ] **Step 2: 학습목표 쓰는 법을 쓴다**

이 절이 이 파일의 핵심이다. 담을 것:

- 형식: `<대상>을 <어떻게> 할 수 있다`
- **검사 방법 하나: 이 목표로 퀴즈를 만들 수 있는가.** 못 만들면 목표가 아니다
- 나쁜 예와 왜 나쁜지 — "리액트를 이해한다"(확인 불가), "훅에 대해 배운다"(배우는 건 수단이지 도달점이 아니다), "useState, useEffect, useMemo를 안다"(목표 세 개를 뭉쳤다)
- 좋은 예 — "어떤 상태 변경이 리렌더를 일으키고 어떤 게 안 일으키는지 구분할 수 있다", "의존성 배열을 잘못 써서 생기는 무한 루프를 코드만 보고 찾아낼 수 있다"
- **동사 고르기** — 구분한다 / 고른다 / 찾아낸다 / 예측한다 / 설명한다는 확인할 수 있다. 안다 / 이해한다 / 익숙해진다 / 살펴본다는 확인할 수 없다. 검사기가 "…수 있다" 어미를 요구하는 이유가 이것이다

- [ ] **Step 3: 챕터로 나누는 법을 쓴다**

- **의존 순서로 정렬한다.** A를 모르면 B를 설명할 수 없으면 A가 앞이다
- **한 챕터는 목표 4~6개.** 목표 하나에 15~25분이고 챕터는 1~2시간이다
- 목표가 7개 넘게 나오면 챕터를 쪼갠다. 2개 이하면 앞뒤 챕터와 합친다
- **선수 챕터를 적는다.** 챕터 열기 장의 "앞에서 배운 것"이 여기서 나온다
- 독자가 이미 아는 것에 걸어야 하므로, 1장은 독자가 아는 것에 가장 가까운 챕터로 잡는다

- [ ] **Step 4: 분량 검산 방법을 쓴다**

챕터를 다 만든 뒤 `__deckStats.minutes`로 검산한다. 60~120분에서 벗어나면 **커리큘럼으로 돌아간다.** 자료를 늘리거나 깎아서 맞추는 게 아니다. 추정 공식(산문 ÷ 400자, 코드 줄 × 6초, 그림 × 30초, 퀴즈 × 1분)도 적어 어림값임을 밝힌다.

- [ ] **Step 5: 커밋**

```bash
git add skills/concept-slides/references/curriculum-design.md
git commit -m "docs(concept-slides): add curriculum design reference"
```

---

### Task 15: `references/chapter-anatomy.md` 신규, `seven-beat.md` 삭제

**Files:**
- Create: `skills/concept-slides/references/chapter-anatomy.md`
- Delete: `skills/concept-slides/references/seven-beat.md`

**Interfaces:**
- Consumes: Task 13의 "B. 챕터 작성"이 이 파일을 읽으라고 가리킨다
- Produces: 장별 합격 기준의 유일한 정의

**`seven-beat.md`에서 살릴 것** — 이 내용은 7단과 무관하게 여전히 옳다. 새 파일의 해당 절로 옮긴다.

- "이 자료는 발표 보조물이 아니다" 절 전체 (상한 폐기, 하한을 거는 이유, 불릿은 요약이지 설명이 아니라는 것)
- 순환 정의 금지와 `X는 [상위 카테고리]인데 [결정적 차이]다` 형식
- 하한이 세어지지 않는 것 목록
- 고통 시나리오를 이야기로 쓰는 법 (상황 → 전개 → 여파, "왜 어긋났나"까지)
- 코드 해설을 같은 부모에 두는 이유 (Spatial Contiguity)
- 완결된 문장 제목 대 주제어 제목의 좋은 예/나쁜 예

**버릴 것** — 7단·트랙 전제인 부분 전부. 장별 하한 표, `data-track`, `data-concept`, Full/Light 배정, 7장 목록.

- [ ] **Step 1: 챕터 골격 절을 쓴다**

`cover` → `opening` → (`goal` → `intro` → `precise` → `example` → 선택 `pitfall`) × 목표 수 → `closing`. **장 수는 안 정한다는 것을 못 박는다.** 3박자는 순서만 강제하고, 되풀이(`intro precise example intro precise example`)도 허용한다는 것을 밝힌다.

- [ ] **Step 2: 장별 절을 쓴다 — 여덟 개**

각 절에 **목적 / 형식 / 합격 기준 / 나쁜 예와 왜 나쁜지 / 좋은 예**를 둔다. `seven-beat.md`가 쓰던 방식이고 그건 잘 작동했다.

- **`cover`** — 챕터 번호·제목·추정 시간. 제목은 주제어가 아니라 완결 문장
- **`opening`** — 이 챕터가 끝나면 할 수 있는 것 + 왜 배우나 + 진도. **산문 400자 하한.** "건너뛰면 뒤에서 무엇이 막히는가"가 빠지면 동기가 안 생긴다
- **`goal`** — 목표 구분 장. 짧다. 목표를 완결 문장 제목으로 다시 말한다
- **`intro`** — 쉬운 첫 설명. **비유는 선택이다.** 비유·친숙한 사례·대비(A vs B)·축소 모형·구체적 문제 상황 중 그 개념에 맞는 것을 고른다. 비유를 쓰면 `data-analogy`를 붙이고 매핑표와 깨지는 지점을 둔다. **억지 비유는 오개념을 심으므로 안 맞으면 빼라**
- **`precise`** — 엄밀한 설명. `intro`에서 흐렸던 것을 여기서 정확히 한다. `intro`가 참이 아닌 단순화를 했으면 **여기서 명시적으로 고친다.** `.steps`로 인과 사슬을 쓸 때 단계마다 "왜 그 순서여야 하는가"를 쓴다
- **`example`** — 실제 예시. 코드·화면·명령. `<pre>`는 `.stack` 같은 컨테이너로 감싸고 같은 부모에 `.prose` 해설을 둔다. 코드 폭은 전체 폭 70칸, 2단 배치 40칸
- **`pitfall`** — 선택. 그럴듯한 오해를 쓴다. 훈계가 되면 안 되고, 자기가 처음 배울 때 틀렸던 것을 쓴다
- **`closing`** — 목표마다 퀴즈. `data-goal`을 붙인다. **앞 장 문장을 그대로 묻지 않고 적용을 묻는다.** 여러 장으로 나눠도 된다

- [ ] **Step 3: 시각자료 판단 절을 옮긴다**

지금 `SKILL.md`의 "시각자료는 규칙이 아니라 판단이다" 절(필수/불필요 표 포함)을 이 파일로 옮긴다. 판단 기준 한 줄("글로만 읽었을 때 독자가 머릿속에 그림을 그려야 하는가")은 그대로 살린다.

- [ ] **Step 4: "하한을 못 채울 때" 절을 쓴다**

목표 단위 1200자를 못 채우는 경우다. 원인 셋과 처방:

- **목표를 너무 잘게 쪼갰다** → 앞뒤 목표와 합친다
- **기제를 아직 모른다** → `precise` 장을 쓸 수 없는 상태다. 공부하고 온다
- **예시가 하나뿐이다** → `example`을 하나 더 쓴다. 되는 예 하나와 안 되는 예 하나가 붙으면 이해가 선명해진다

**물을 타면 안 된다는 것을 명시한다.** 하한은 넘기라고 있는 게 아니다.

- [ ] **Step 5: `seven-beat.md`를 지운다**

```bash
git rm skills/concept-slides/references/seven-beat.md
```

- [ ] **Step 6: 끊긴 링크를 찾는다**

Run: `grep -rn "seven-beat\|data-track\|data-concept\|Full 트랙\|Light 트랙\|7단" skills/concept-slides/`
Expected: **아무것도 안 나온다.** 나오면 그 파일을 고친다. `deck.html`의 옛 예시는 Task 12에서 이미 갈았으므로 남아 있으면 안 된다.

- [ ] **Step 7: 커밋**

```bash
git add skills/concept-slides/references/chapter-anatomy.md
git rm --cached skills/concept-slides/references/seven-beat.md 2>/dev/null || true
git commit -m "docs(concept-slides): replace seven-beat with chapter-anatomy"
```

---

### Task 16: `references/principles.md` 갱신

**Files:**
- Modify: `skills/concept-slides/references/principles.md`

**Interfaces:**
- Consumes: Task 3~8의 게이트 목록
- Produces: 게이트마다 왜 그게 있는지. 나중에 게이트를 고치려는 사람이 근거를 알 수 있다

- [ ] **Step 1: 지금 파일을 읽고 살릴 것과 버릴 것을 가른다**

Run: `cat skills/concept-slides/references/principles.md`

살릴 근거 — retrieval practice, worked example, Spatial Contiguity, Assertion-Evidence, Coherence. 버릴 것 — 7단 배열과 Full/Light 트랙에 붙은 근거.

- [ ] **Step 2: 새 게이트에 근거를 짝지운다**

표로 만든다. 게이트 · 근거 · 한 줄 설명.

| 게이트 | 근거 |
|---|---|
| 학습목표 선언 + "…수 있다" 어미 | backward design — 도달점을 먼저 정하고 거기서 자료를 거꾸로 짠다. 확인할 수 없는 목표는 자료를 안 정해준다 |
| 목표별 퀴즈 | retrieval practice — 읽고 넘긴 것은 남지 않는다. 꺼내 본 것이 남는다 |
| `intro` → `precise` 순서 | concreteness fading — 구체적인 것에서 시작해 점점 추상으로 옮긴다. 반대로 하면 걸 곳이 없다 |
| `example` 필수 | worked example — 처음 배울 때는 풀린 예를 보는 것이 스스로 푸는 것보다 빠르다 |
| 목표 단위 산문 하한 | 이 자료엔 말해줄 사람이 없다. 페이지에 없는 것은 독자에게 영영 없다 |
| **장 단위 하한을 안 두는 것** | 장마다 하한을 걸면 물을 탄다. 총량만 재면 어디를 짧게 쓸지 작성자가 고를 수 있다 |
| 코드 해설을 같은 부모에 | Spatial Contiguity — 눈을 멀리 옮기면 둘을 못 잇는다 |
| 완결 문장 제목 | Assertion-Evidence — 제목이 주장을 하고 본문이 근거를 댄다 |
| 이모지 2개 | Coherence — 학습에 안 쓰이는 장식은 학습을 방해한다 |
| **비유를 검사하지 않는 것** | 부정확한 비유는 오개념을 심는다. 그걸 나중에 되돌리는 비용이 처음 제대로 가르치는 비용보다 크다. 그래서 비유를 **요구하지 않고**, 썼다고 밝힌 경우에만 매핑과 한계를 요구한다 |
| 학습 시간을 위반으로 안 삼는 것 | 정독 속도는 주제마다 다르다. 추정으로 자료를 깎게 만들면 안 된다 |

**"무엇을 버렸는지"도 적는다** — 발표용 상한(120자), 7단 고정, Full/Light 트랙, 모든 개념에 비유 의무. 각각 왜 버렸는지 한 줄. 되살리려는 사람이 같은 실수를 안 하게 한다.

- [ ] **Step 3: 커밋**

```bash
git add skills/concept-slides/references/principles.md
git commit -m "docs(concept-slides): repoint principles at the new gates"
```

---

### Task 17: 끝단 검증 — 실제 챕터 하나를 만들어 본다

**Files:**
- Create: 스크래치패드 폴더 아래 `verify/` (저장소 밖에 둔다 — 시범 산출물을 커밋하지 않는다)
- Modify: `docs/superpowers/plans/2026-07-29-concept-slides-curriculum.md` (결과 기록)

**Interfaces:**
- Consumes: Task 13~16의 문서와 Task 3~12의 뼈대
- Produces: 스킬이 실제로 도는지에 대한 증거

- [ ] **Step 1: 스킬을 처음부터 따라 커리큘럼을 세운다**

`SKILL.md`만 읽고 그대로 따른다. 주제는 **`git`의 스테이징 영역과 커밋**으로 한다 — 견본(이벤트 루프)과 다른 주제여야 문서가 견본에 기대고 있는지 드러난다.

Expected: `curriculum.md`가 만들어지고 **HTML은 안 만들어진다.** 챕터가 4개 안팎, 챕터마다 목표 4~6개.

- [ ] **Step 2: 1장을 만든다**

Expected: 슬라이드 60~70장짜리 HTML 하나. `__deckCheck()`가 `[]`. `__deckStats.minutes`가 60~120.

- [ ] **Step 3: 문서가 부족했던 곳을 적는다**

만들면서 막힌 곳, `SKILL.md`나 `chapter-anatomy.md`를 다시 읽어야 했던 곳, 게이트 메시지만 보고 뭘 고쳐야 할지 몰랐던 곳을 적는다.

- [ ] **Step 4: 부족했던 곳을 고친다**

Step 3의 목록대로 문서를 고친다. **여기서 나온 수정이 이 계획의 진짜 산출물이다** — 스킬을 실제로 돌려보지 않으면 안 드러나는 것들이다.

- [ ] **Step 5: 회귀 확인**

Run: `cd skills/concept-slides && node tests/build.mjs broken`, 그리고 브라우저에서 `tests/out/broken.html`의 `__deckCheck()`
Expected: `tests/README.md`의 표와 위반 목록이 일치한다.

Run: 브라우저에서 `assets/deck.html`의 `__deckCheck()`
Expected: `[]`

- [ ] **Step 6: 계획 문서에 결과를 적는다**

이 파일 맨 아래에 "검증 결과" 절을 붙인다. 실제로 만든 챕터의 장 수, 추정 시간, 위반 0건 확인 여부, 그리고 Step 4에서 고친 것 목록.

- [ ] **Step 7: 커밋**

```bash
git add skills/concept-slides docs/superpowers/plans/2026-07-29-concept-slides-curriculum.md
git commit -m "docs(concept-slides): fix gaps found by building a real chapter"
```

---

## 마무리

- [ ] `git log --oneline main..HEAD`로 커밋을 훑는다
- [ ] `grep -rn "seven-beat\|data-track\|data-concept\|7단\|Full 트랙" skills/concept-slides/`가 아무것도 안 낸다
- [ ] `superpowers:finishing-a-development-branch`로 병합 방식을 정한다
