# experiment-loop을 스킬 넷으로 나누기 — 설계

작성일: 2026-07-27

## 왜 나누는가

문제는 정리 정돈이 아니라 **지시 이행률**이다. 사용자가 겪은 증상은 셋이다.

1. 루프 진행 중에 다른 부탁을 하면, 그 뒤부터 스킬 규칙이 사실상 무시된다.
2. "실험보고서 작성해줘"라고 하면 스킬 절차대로 처리하지 않는다.
3. "문서에 기록해줘"라고 하면 스킬 절차대로 처리하지 않는다.

원인은 둘이다.

**원인 1 — 절차에 들어가는 문이 없다.** 보고서 쓰는 법은
`references/experiment.md`의 4단계 절차 한가운데 있다. 문서 기록하는 법은
`references/llm-wiki.md`와 `SKILL.md`의 "Capture durable facts on the spot"에
흩어져 있다. 둘 다 **단계 흐름을 걸어와야 닿는 자리**다. 사용자가 직접
"보고서 써줘"라고 하면 그 파일을 열 이유가 없다. 그래서 그냥 쓴다.

**원인 2 — 루프 위치를 대화가 기억한다.** `state.json`이 있지만, 실제로 지금
몇 단계인지는 대화 맥락이 붙들고 있다. 다른 부탁이 끼어들면 밀려난다.

## 결정 사항

| 항목 | 결정 | 이유 |
|---|---|---|
| 서브에이전트 역할 | **검증 전용.** 실행은 메인 세션이 유지 | 서브에이전트는 사용자에게 되물을 수 없고, 실행 작업에는 컨텍스트를 새로 채우는 비용이 과하다 |
| 스킬 분할 | 넷 — loop / bootstrap / report / wiki | 사용자가 겪은 실패 지점에 1:1로 대응. 단계별로 자르지 않는다 |
| 배포 형태 | 플러그인 하나 | 공유 파일을 둘 자리가 생기고, 설치가 한 번이며, 나중에 훅을 붙일 자리가 이미 있다 |
| 훅 | **이번에는 넣지 않는다** | 먼저 스킬 분리와 description만으로 해보고, 이탈이 남으면 그때 붙인다 (판단 기준은 아래 "훅 추가 판단" 참조) |

## 새 구조

```
plugins/experiment-loop/              (지금의 skills/experiment-loop/ 자리)
  .claude-plugin/plugin.json
  shared/
    verification-gate.md              # 네 스킬 공용
    state.md                          # state.json 스펙
    templates/                        # 13개
  skills/
    experiment-loop/
      SKILL.md                        # 대시보드, 단계 1~5 진행, 공통 원칙
      references/
        long-term-plan.md
        experiment-design.md
        tech-design.md
        implementation.md
        experiment.md                 # 실행·모니터링만 (295줄 → 약 100줄)
        wrap-up.md
    experiment-bootstrap/SKILL.md
    experiment-report/SKILL.md
    experiment-wiki/SKILL.md
```

공유 파일은 스킬 디렉터리 기준 `../../shared/`로 참조한다. 스킬은 로드될 때
자기 디렉터리의 절대 경로를 받으므로 경로가 풀린다.

이름은 플러그인 `experiment-loop`, 스킬 `experiment-loop` /
`experiment-bootstrap` / `experiment-report` / `experiment-wiki`로 둔다.
`/experiment-loop:experiment-loop`이 다소 겹쳐 보이지만, 스킬이 걸리는 건
이름이 아니라 description이라 실질적 문제가 없다.

## 스킬별 책임

### experiment-loop
루프 본체. 대시보드(현재 상태 보여주고 선택지 제시), 단계 1~5 진행, 공통 원칙,
`state.json` 관리.

**대시보드가 하는 일 중 바뀌는 것**: 0단계를 고르면 `experiment-bootstrap`을
호출한다. 절차를 여기 두지 않는다.

### experiment-bootstrap
0단계 온보딩. 프로젝트당 한 번. 문서 재구조화, 위키 시드, `code-map.md`,
`artifact-map.md`, `experiment-ledger.md`, `CLAUDE.md`, PRD 가이드, MCP 안내.

출처: 현재 `references/bootstrap.md` 107줄 전체.

**위키 배치 규칙은 여기 두지 않는다.** `experiment-wiki`가 갖는다. bootstrap은
그 규칙을 참조해 초기 문서를 채운다. 규칙이 두 벌로 갈라지지 않게 하기 위해서다.

### experiment-report
보고서 작성 전용. loop 보고서 + 프로젝트 보고서 + 각각의 HTML 렌더링 +
보고서 검증 게이트.

출처: 현재 `references/experiment.md`의 "Report" 절과 "HTML rendering" 절
(약 200줄), `templates/experiment-report.md`, `templates/project-report.md`.

들어오는 문이 둘이다 — 4단계가 호출하거나, 사용자가 직접 요청하거나. 어느
쪽이든 같은 절차를 탄다.

### experiment-wiki
문서 기록 전용. 어디에 무엇을 두는지("Which bucket?"), 그 자리에서 즉시 기록,
wrap-up의 위키 갱신, always-read core 관리, gardening.

출처: 현재 `references/llm-wiki.md` 154줄, `SKILL.md`의 "Capture durable facts
on the spot"과 "Repeating yourself is a bug signal", `references/wrap-up.md`의
2절(위키 갱신)과 3절(승격).

wrap-up은 자기 체크리스트를 유지하되 2·3절 실행을 이 스킬에 넘긴다.

## 이탈을 막는 장치

훅을 뺐으므로 아래 셋이 짐을 모두 진다.

### 1. description을 사용자의 말로 쓴다

지금 `experiment-loop`의 description은 실험 설계·기술 설계·실행·마무리를 모두
나열한다. 전부에 걸리는 설명은 아무것에도 정확히 걸리지 않는다.

새 스킬의 description에는 **사용자가 실제로 쓰는 표현**을 넣는다.

- `experiment-report`: "보고서 써줘", "실험 결과 정리해줘", "리포트 만들어줘",
  "결과 문서로 만들어줘"
- `experiment-wiki`: "이거 기록해둬", "문서에 남겨줘", "위키 갱신해줘",
  "이 사실 저장해줘"
- `experiment-bootstrap`: "이 프로젝트 온보딩해줘", "실험 루프 세팅해줘"

훅이 없는 지금, 스킬이 걸리는지는 전적으로 여기에 달렸다. 이 문장들을
대충 쓰면 나머지 설계는 작동하지 않는다.

### 2. 지름길을 없앤다

**단계 reference에 보고서 쓰는 법을 한 줄도 남기지 않는다.** 요약이라도 남으면
가까이 있는 그쪽을 따라가고, 스킬은 영영 걸리지 않는다. 그리고 요약은 원본보다
허술하다.

4단계 `experiment.md`에는 이것만 남긴다:

> 보고서를 쓸 때는 `experiment-report` 스킬을 호출한다. 절차는 그 스킬에 있다.

wrap-up의 위키 갱신도 같다.

### 3. state.json을 권위로 삼는다

`experiment-loop`의 SKILL.md 앞부분에 규칙을 못 박는다.

- 루프 위치를 판단할 때는 대화 기억이 아니라 `state.json`을 다시 읽는다.
- 단계 밖 요청(사용자가 중간에 시킨 다른 일)은 `state.json`을 건드리지 않는다.
- 그 일을 마치면 루프가 어디 서 있는지 한 줄로 알린다. 자동으로 이어가지
  않는다 — 이어갈지는 사용자가 정한다.

## 공통 원칙: 어디에 둘 것인가

정석은 공유 파일이다. 그런데 지금 고치려는 문제가 "읽어야 할 걸 안 읽는다"다.
**읽을 수도 있는 파일에 있는 원칙은, 항상 로드되는 SKILL.md에 적힌 원칙보다
약하다.** 그래서 무게로 나눈다.

현재 `SKILL.md`의 Shared Principles 12개를 다음과 같이 나눈다.

| 내용 | 어디에 | 이유 |
|---|---|---|
| 코드 그라운딩 / claim 단위 출처 / 템플릿 준수 / always-read core 읽기 / 작업 전 human-feedback 읽기 / 에스컬레이션 / 사용자 선택은 loop-log에 기록 / 언어 규칙과 쉬운 한국어 | **네 SKILL.md에 각각 인라인** (약 20~25줄) | 어느 스킬로 들어오든 지켜져야 하고, 절대 빠지면 안 된다. 중복을 감수한다 |
| 검증 게이트 절차 (91줄) | `shared/verification-gate.md` | 길고, 쓸 때만 필요. 인라인 블록에는 "결과물은 이 파일의 절차로 검증한다" 한 줄만 둔다 |
| Capture durable facts on the spot / Repeating yourself is a bug signal / 위키 배치 규칙 | `experiment-wiki` 스킬 | 셋 다 "무엇을 어디에 기록하는가"의 문제라 주인이 하나다 |
| 대시보드, 단계표, 단계 전이, state.json 관리 | `experiment-loop` 스킬에만 | 루프 진행에만 해당한다. 다른 셋은 알 필요가 없다 |
| state.json 스펙 / 템플릿 13개 | `shared/` | 참조용 |

20~25줄을 네 번 복사하는 것은 의도한 선택이다. 대신 복사본이 어긋나지 않도록
같은 마커로 감싸고 검증 항목을 둔다(아래 검증 1번).

## 함께 고칠 것

- **`prompts/build-experiment-loop.md`** — 12행의 "스킬은 `experiment-loop`
  1개만 만든다. 단계별로 스킬을 나누지 않는다"를 고친다. 이 저장소는 프롬프트와
  스킬의 대응을 원칙으로 삼으므로, 스킬만 바꾸면 원본과 어긋난다. 새 규칙은
  "단계별로 나누지 않되, 사용자가 직접 요청하는 작업(보고서·기록·온보딩)은
  별도 스킬로 분리한다"로 쓴다 — 분할 기준을 남겨야 다음에 또 흔들리지 않는다.
- **`README.md`** — 저장소 구조 설명과 설치 안내를 플러그인 방식으로 고친다.

## 검증

코드가 아니라 프롬프트라서 실행 테스트가 없다. 넷으로 본다.

1. **인라인 원칙 대조** — 네 SKILL.md의 공통 원칙 블록이 서로 같은지 확인한다.
   기계적으로 비교할 수 있게 블록을 같은 마커로 감싼다.
2. **끊긴 참조 찾기** — 파일을 옮긴 뒤 `references/`, `templates/`,
   `../../shared/` 경로가 모두 실제 파일을 가리키는지 확인한다.
3. **원본 요구사항 대조** — `prompts/build-experiment-loop.md`의 각 요구사항이
   네 스킬 중 어디에 갔는지 표로 대조한다. 옮기다 빠진 것을 잡는 검사다.
4. **행동 시험** — 진짜 시험이다. 대화를 길게 만든 세션에서 아래 세 문장을
   그대로 던지고, 해당 스킬이 걸리는지 본다.
   - "실험보고서 작성해줘"
   - "이거 문서에 기록해줘"
   - (루프 중간에) 관계없는 부탁을 한 뒤 → 루프 위치를 잃지 않는지

## 훅 추가 판단

검증 4번이 곧 판단 기준이다.

세 문장 중 **하나라도 스킬이 걸리지 않으면 훅을 붙인다.** 붙일 훅은
`UserPromptSubmit` 하나에 검사 둘이다 — 진행 중인 루프가 있으면 현재 단계를
한 줄 주입하고, 요청문이 보고서·기록으로 보이면 스킬 로드를 상기시킨다.
플러그인 구조라 `hooks/hooks.json`을 추가하면 되고, 다른 것은 건드리지 않는다.

훅의 한계도 미리 적어둔다: 단어로 걸리는 방식이라 넓게 잡으면 관계없는 대화에
매번 끼어들고, 매번 끼어들면 결국 무시하게 된다. 붙일 때는 위 세 문장 같은
좁은 표현에 맞춘다.

## 하지 않는 것

- **단계별 스킬 분할** — 실험 설계·기술 설계·구현에서는 이탈이 보고되지 않았다.
  단계 흐름으로만 닿는 자리라 문이 없어서 생기는 문제가 없다.
- **검증 게이트를 스킬로** — 사용자가 직접 부르는 것이 아니라 각 스킬이 내부에서
  쓰는 절차다. 공유 파일로 둔다.
- **서브에이전트에게 실행 위임** — 되물을 수 없고 컨텍스트 비용이 과하다.
  검증 전용을 유지한다.
- **훅** — 이번에는 넣지 않는다. 위 판단 기준에 걸리면 그때.
