# Agentic Loop Factory

코딩 에이전트(Claude Code)로 반복 작업을 자동화하는 **에이전틱 루프**를 만들고 관리하는 저장소입니다.

각 루프는 다음 패턴으로 만들어집니다:

1. **프롬프트 작성** (`prompts/`) — 루프의 운영 원칙, 워크플로우, 완료조건을 정의한 요구사항 문서
2. **스킬 빌드** (`plugins/`) — 프롬프트를 기반으로 구현한 Claude Code 스킬. 프롬프트의 모든 요구사항이 스킬에 반영되었는지 traceability를 검증하며 유지보수합니다.

## 저장소 구조

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

## experiment-loop

ML 실험을 설계 → 구현 → 실행 → 정리까지 반복 수행하는 루프입니다.

- **단계**: 0 bootstrap(프로젝트 온보딩, 최초 1회, `experiment-bootstrap` 스킬) → 0.5 long-term plan(필요 시) → 1 실험 설계 → 2 기술 설계 → 3 구현(TDD) → 4 실험 수행 및 보고(`experiment-report` 스킬로 작성) → 5 마무리(GC, wiki 갱신(`experiment-wiki` 스킬), tools/hooks 리뷰)
- **루프 제어**: 메인 세션이 진행을 담당하고, 검증은 subagent 게이트로 분리. 진행 상황은 `docs/agent/loops/<loop-id>/state.json`에 기록되어 중단 후 재개와 다음 루프 인계를 지원
- **검증 게이트**: 이슈를 Critical/Major/Minor로 분류(실험 유효성·재현성 기준), 최대 3회 자동 수정 후 에스컬레이션
- **설계 원칙**: 에이전트에게 "무엇을, 왜"를 전달하고 "어떻게"는 위임 / 코드 그라운딩 필수 / claim 단위 출처 명시 / 점진적 컨텍스트 로드

## 사용 방법

이 저장소를 마켓플레이스로 등록하고 플러그인을 설치합니다.

```
/plugin marketplace add hoholam0112/agentic_loop_factory
/plugin install experiment-loop@agentic-loop-factory
```

설치하면 스킬 넷이 함께 들어옵니다. 각 스킬은 기본적으로 **설명(description) 매칭으로
자동 호출**됩니다 — 사용자가 "실험 루프 시작", "보고서 써줘", "이거 문서에 기록해줘"처럼
말하면 에이전트가 알아서 맞는 스킬을 찾아 씁니다. 슬래시 커맨드로 직접 부르는 것도 됩니다.

- `experiment-loop` (`/experiment-loop`) — 루프 진행. 부르면 대시보드로 현재 상태를 보여줍니다
- `experiment-bootstrap` (`/experiment-bootstrap`) — 프로젝트 온보딩 (처음 한 번)
- `experiment-report` (`/experiment-report`) — 보고서 작성
- `experiment-wiki` (`/experiment-wiki`) — 위키 기록

넷으로 나눈 이유는 진입점 때문입니다. 보고서 작성과 위키 기록은 사용자가 단계 흐름과 무관하게 직접 요청하는 일이라, 절차가 단계 안에 묻혀 있으면 그 절차를 타지 않고 그냥 처리해 버립니다.

## 새 루프 추가하기

1. `prompts/build-<loop-name>.md`에 요구사항 프롬프트를 작성합니다 (목적·원칙 / 실행 메커니즘 / 워크플로우 / 주의사항).
2. 프롬프트를 기반으로 `plugins/<loop-name>/`에 플러그인을 빌드합니다. 단계는 하나의 스킬 안에 references로 묶고, 사용자가 흐름과 무관하게 직접 요청하는 작업(보고서 작성, 기록 등)만 별도 스킬로 분리합니다. 각 스킬의 SKILL.md는 얇게 유지합니다.
3. 프롬프트의 모든 요구사항이 스킬에 반영되었는지 대조 검토하고, 루프 종료 조건(둠루프 방지)과 crash-resume 안전성을 점검합니다.

## 언어 규칙

- `prompts/`의 요구사항 문서: 한국어
- `plugins/`의 모든 스킬 파일: 영어 (Claude Code 스킬 규약)
