# 분할 후 검증 기록

코드가 없는 프롬프트/마크다운 저장소라 실행 테스트가 없다. 아래 네 가지로 검증한다.
1~2는 명령 하나로 끝나는 기계적 검사, 3은 원본 프롬프트와 대조하는 수동 검사,
4는 사람이 긴 대화에서 실제로 던져봐야 하는 행동 시험이다.

## 검증 1: 인라인 원칙 블록 네 벌 대조

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

결과:

```
experiment-loop:       45 lines
experiment-bootstrap:       45 lines
experiment-report:       45 lines
experiment-wiki:       45 lines
experiment-bootstrap: 같음
experiment-report: 같음
experiment-wiki: 같음
```

**판정: 통과.** 네 파일 모두 45줄(`<!-- BEGIN -->`/`<!-- END -->` 마커 포함)로 같고,
`diff -q` 세 벌 전부 차이 없음("같음" 출력). 설계 문서의 자가 점검에는 "약 35줄"로
적혀 있었는데 실제로는 마커 두 줄을 포함해 45줄이다 — 줄 수 표기가 실제보다 적게
적힌 것뿐이고, 네 파일이 서로 다른 것은 아니므로 복사 오류는 아니다.

## 검증 2: 끊긴 참조 검사

Run:

```bash
cd /Users/zeroman0112/Projects/agentic_loop_factory/plugins/experiment-loop
grep -rhoE '\.\./\.\./shared/[A-Za-z0-9/._-]+' skills/ | sort -u | while read p; do
  [ -e "shared/${p#../../shared/}" ] && echo "OK   $p" || echo "MISS $p"
done
```

결과 (검사한 경로 16개, 전부 OK):

```
OK   ../../shared/state.md
OK   ../../shared/template-compliance.md
OK   ../../shared/templates/
OK   ../../shared/templates/artifact-map.md
OK   ../../shared/templates/code-map.md
OK   ../../shared/templates/decision-record.md
OK   ../../shared/templates/experiment-design-doc.md
OK   ../../shared/templates/experiment-ledger.md
OK   ../../shared/templates/experiment-report.md
OK   ../../shared/templates/human-feedback.md
OK   ../../shared/templates/implementation-plan.md
OK   ../../shared/templates/loop-log.md
OK   ../../shared/templates/prd.md
OK   ../../shared/templates/project-report.md
OK   ../../shared/templates/task-spec.md
OK   ../../shared/templates/tech-design-spec.md
OK   ../../shared/verification-gate.md
```

**판정: 통과.** `skills/` 아래에서 `../../shared/...` 형태로 쓰인 경로 16개 전부
실제 파일/디렉토리로 존재한다. `principles-inline.md`는 `../../shared/...` 참조로
쓰이지 않으므로(내용만 복사해 넣는 원본이라 skills에서 경로로 참조하지 않음) 이 표에
안 나오는 것이 맞다.

## 요구사항 대응표

프롬프트의 각 절이 어느 스킬로 갔는지. 빈칸이 있으면 옮기다 빠진 것이다.
각 행은 실제로 목적지 파일을 열어서 절·문구 단위로 대조했다. "확인" 칸에는 어떤
파일의 어느 절/줄에서 무엇을 확인했는지 적었다.

| 프롬프트 절 | 간 곳 | 확인 |
|---|---|---|
| 실행 메커니즘 > 루프 제어 | experiment-loop SKILL.md | `SKILL.md` 8-9줄(메인세션이 진행, 검증은 subagent), 12-28줄 "On Invocation: Dashboard"(state 확인→진행상황 설명→선택지, 온보딩 전 bootstrap 안내, 온보딩 후에도 항상 bootstrap 선택지 포함하고 재구조화 전 의도 확인 — 원문 18줄과 문장 구조까지 대응), 91-102줄 "Loop control"(state.json이 권위, 부수 요청은 state 안 건드림, 전환마다 갱신). "스킬은 단계별로 나누지 않는다"·"분리한 절차는 요약도 안 남긴다"는 이 파일 자체가 아니라 실행 결과로 확인 — `references/experiment.md` 89-91줄에 "There is deliberately no summary of the procedure here"로 명시. state.json 필드를 에이전트가 정한다는 부분은 `shared/state.md` 24줄"Extend fields as needed; keep these as the minimum"에서 확인. "플러그인 하나로 묶는다"는 `.claude-plugin/plugin.json`이 skills 4개를 한 플러그인으로 감싸는 구조로 확인. |
| 실행 메커니즘 > 컨텍스트 로드 | 인라인 블록 (네 스킬 전부) | 인라인 블록 "Always-read core" 항목(`shared/principles-inline.md` 19-23줄, 네 SKILL.md에 동일하게 복사됨) — glossary.md·index.md·always-read core·human-feedback.md를 매번 읽는다. 각 단계 reference 파일들도 "Must read first"에서 같은 always-read core를 반복 지시(예: `experiment-design.md` 8-10줄). |
| 실행 메커니즘 > 결정·피드백 기록 | 인라인 블록 + experiment-wiki | 인라인 블록 "Log human input"(68-70줄)·"Durable facts go to the wiki immediately"(71-76줄). wrap-up에서의 정리는 `skills/experiment-wiki/SKILL.md` "Update procedure" 5단계(197-217줄, loop-log를 decisions/ADR·guidance/human-feedback·knowledge로 분류해 반영)에서 확인. |
| 실행 메커니즘 > 검증 게이트 | shared/verification-gate.md | `shared/verification-gate.md` 전체. Critical/Major/Minor 분류(71-80줄), 최대 3회 자동수정(20줄 "At most 3 fix-and-reverify rounds"), Minor만 남으면 통과·Major 이상 남으면 에스컬레이션(23-24줄), 판단이 필요한 이슈는 decision_needed로 즉시 에스컬레이션(14-15줄), 게이트 통과 후 사용자에게 쉬운 말로 요약(25-28줄). |
| 0단계 bootstrap | experiment-bootstrap | `skills/experiment-bootstrap/SKILL.md` 전체. 프로젝트 분석(60-65줄, 절차 1), 문서 재구조화(69-70, 71-133 Deliverables/절차 2-3), LLM wiki 초기화와 실험대장(81-94줄, code-map·artifact-map·experiment-ledger 각각 named), CLAUDE.md 작성(107-109줄, 142-143줄), MCP 안내(119-120, 144-147줄), PRD 가이드(110-118, 148-150줄), "최초 1회" 원칙(54-55줄 "Run only when docs/index.md does not exist", 그리고 experiment-loop SKILL.md 27줄 "It normally runs once per project"). |
| 0.5단계 long-term plan | experiment-loop references | `references/long-term-plan.md` 전체(23줄, 짧음). 1-4줄에서 "Entered from stage 1 when the user's requirement doesn't fit a single loop. If unsure whether it fits, ask the user"로 원문 62-63줄과 동일한 조건. Deliverable(19-24줄)이 `long-term-plan.md`. |
| 1단계 Experiment Design | experiment-loop references | `references/experiment-design.md` 전체. 외부조사(42-45줄), 지난 에러 되돌아보기(46-50줄), 중복실험방지/ledger 대조(51-55줄), 2-3 선택지 제안(56-60줄), 탐색공간을 사용자와 설계(61-72줄), Design Doc 작성 및 섹션별 질문(86-88줄), 검증 게이트 기준(89-107줄, 중복 실험·탐색공간·서빙 항목 포함). |
| 2단계 Tech Design | experiment-loop references | `references/tech-design.md` 전체. AS-IS/TO-BE(1-10, 22-27줄), 성공조건 기술적 재정의(26-27줄), 진행상황 모니터링 설계(35-39줄), Implementation Plan/Task spec(40-44줄), 검증 게이트(46-61줄). |
| 3단계 구현 | experiment-loop references | `references/implementation.md` 전체. TDD 절차(16-27줄), 검증 게이트(36-46줄). |
| 4단계 실험 (실행·모니터링) | experiment-loop references | `references/experiment.md`. 데이터준비→학습→평가→서빙측정(24-31줄), 백그라운드 실행과 job 기록(32-39줄), artifact 등록(42-46줄), 모니터링 표(62-69줄) — "PID alive, no new progress line for ~30 min → Stalled"가 원문 91줄의 "약 30분"과 정확히 일치. |
| 4단계 실험 (보고서) | experiment-report | `skills/experiment-report/SKILL.md` 전체. markdown 먼저 쓰고 HTML로 렌더(69-70, 148-156줄), 검증 게이트(89-110, 253-270줄, 독립성·충분한 깊이·자리표시자 없음 포함), 6개 탭(185-219줄 — 개요/데이터/모델/실험히스토리/에러분석은 원문 그대로, Serving & Cost는 원문에 없던 추가 항목). |
| 5단계 마무리 (GC·대장·tools) | experiment-loop references | `references/wrap-up.md`. GC(20-37줄, git diff 대신 artifact 지도 기준), 실험 대장 추가(49-55줄), tools & hooks(57-61줄 — "필요가 이번 루프에서 최소 두 번 있었을 때만" 원문의 "자주 쓰는 꼭 필요한 것만" 요건을 구체화), 루프 종료(63-68줄). |
| 5단계 마무리 (위키) | experiment-wiki | `references/wrap-up.md` 39-47줄이 "Invoke the experiment-wiki skill"로 위임. 실제 절차는 `skills/experiment-wiki/SKILL.md` "Update procedure" 171-217줄: 변경범위 diff(173-175), 디렉토리별 병렬 업데이터/검증 subagent(176-184), gardening(185-195), loop-log 승격(197-217). |
| LLM wiki 전체 | experiment-wiki | `skills/experiment-wiki/SKILL.md` 전체. 작성원칙(57-68줄), 디렉토리 구조(86-105줄, 원문 118-133줄의 트리와 사람/에이전트/공유 구분이 동일), knowledge/guidance/decisions 구분 규칙(145-158줄, 원문 135-141줄과 동일한 판별 순서), always-read core(162-169줄). |
| 문서 템플릿 | shared/templates/ | `shared/templates/` 13개 파일 확인(prd, experiment-design-doc, tech-design-spec, task-spec, implementation-plan, experiment-report, experiment-ledger, code-map, artifact-map, decision-record, human-feedback, loop-log, project-report). 원문(113줄)이 나열한 12개 전부 존재. `project-report.md`(115줄)는 원문에 없던 항목 — 이후 커밋(92ed961, whole-project report 추가)에서 늘어난 것으로, 옮기다 빠진 것이 아니라 의도된 확장. 다만 원문은 "skill 디렉토리 templates"라고 했는데 실제로는 스킬 4개가 공유하는 `shared/templates/`로 배치됨 — 이 역시 스킬을 넷으로 나누며 필요해진 의도된 구조 변경. |
| 주의사항 (언어) | 인라인 블록 | 인라인 블록 "Language"(83-84줄: 모든 문서·코드는 영어, glossary.md는 예외, 사용자와는 한국어+전문용어 영어)·"Plain language"(85-88줄: 어려운 말 지양). `CLAUDE.md`를 영어로 쓰라는 항목은 `experiment-bootstrap/SKILL.md` 107-109줄에서 별도로 확인. 다만 원문의 "`.claude`의 모든 파일은 영어로 작성한다"는 대상 프로젝트의 `.claude/` 디렉토리 전반을 가리키는데, bootstrap이 `.claude/` 하위에 실제로 무엇을 쓰는지는 명시돼 있지 않아 이 부분만 부분 확인. |
| 실험보고서 작성원칙·구성요소 | experiment-report | `skills/experiment-report/SKILL.md` "Writing principles"(164-182줄)와 `shared/templates/experiment-report.md`(4-28줄 주석)가 원문 174-181줄(쉽게·독립적으로·자리표시자 없이·그래프 활용·단일 HTML·탭 구성)과 176-188줄(구성요소: 개요·데이터·모델·실험히스토리·에러분석)을 그대로 대응. 에러분석 "20-30개" 수치도 `experiment-report.md` 템플릿 56-57줄과 SKILL.md 207줄에 그대로 유지. |

## 옮기다 빠진 것

- **"사용자가 쓴 용어의 의미가 명확하지 않으면 되묻는다" (원문 22줄).** 컨텍스트 로드
  절의 이 문장 — glossary.md를 읽는 것만이 아니라, 용어 뜻이 불분명하면 사용자에게
  되물어야 한다는 지시 — 이 네 스킬 어디에도 없다. `grep -rniE
  'clarif|ambiguous'`로 전체를 훑어도 걸리는 게 없다(`long-term-plan.md`의
  "Clarify the overall requirement with the user"는 0.5단계 전용이라 이 규칙과
  무관). glossary.md를 항상 읽는다는 지시는 인라인 블록에 남았지만, 뜻이 안 맞을 때
  되묻는 절차는 옮기는 과정에서 빠졌다.

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
