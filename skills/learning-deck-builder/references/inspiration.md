# 참고할 만한 설명자료

비유·시각화가 잘 된 자료들. 막혔을 때 "이 사람들은 이걸 어떻게 그렸을까"를 보러 온다.
각 항목에 **무엇을 훔칠지**를 적었다.

## 시각적 설명의 최고 수준

### Bartosz Ciechanowski — [ciechanow.ski](https://ciechanow.ski/)
물리·공학 개념을 인터랙티브 시각화로 설명한다. 1년에 3~4편만 낸다.
- [Gears](https://ciechanow.ski/gears/) — 기어비를 만지면서 이해하게 만듦
- [Mechanical Watch](https://ciechanow.ski/mechanical-watch/) — 복잡한 기계를 부품 단위로 쌓아올림
- [Bicycle](https://ciechanow.ski/bicycle/), [GPS](https://ciechanow.ski/gps/)

**훔칠 것:** 복잡한 시스템을 설명하는 순서. 완성품을 먼저 안 보여준다. 부품 하나에서
시작해 하나씩 더한다. 각 단계마다 "왜 이게 부족한가"를 보여주고 다음 부품을 정당화한다.
→ 2장(왜 필요한가)을 개념마다 반복하는 구조.

### 3Blue1Brown — [3blue1brown.com](https://www.3blue1brown.com/)
수학·신경망을 애니메이션으로 설명. 공식 암기가 아니라 직관 구축이 목표.

**훔칠 것:** 항상 "왜"를 먼저 준다. 그리고 하나의 시각적 은유를 영상 전체에서
일관되게 유지한다(예: 선형변환 = 격자 왜곡). 비유를 중간에 갈아타지 않는다.
→ 자료 전체에서 비유 하나를 끝까지 쓴다.

### Distill — [distill.pub](https://distill.pub/)
머신러닝 개념의 인터랙티브 논문. (현재 신규 발행 중단, 아카이브는 유효)

**훔칠 것:** 다이어그램에 항상 "지금 무엇을 보고 있는지" 라벨이 있다. 독자가
그림을 해독하느라 인지자원을 쓰지 않게 한다.

## 개념을 친근하게 만드는 방식

### Julia Evans — [jvns.ca](https://jvns.ca/), [Wizard Zines](https://wizardzines.com/)
프로그래밍·시스템 개념을 손그림 zine으로. "짧고 참인 문장" 원칙.

**훔칠 것:** 정의문 쓰는 법. "파이프는 파일 디스크립터 2개다" 같은, 짧으면서
기술적으로 정확한 문장. 쉽게 만들려고 틀리게 말하지 않는다.
→ 1장 한 줄 정의.

### The Illustrated Children's Guide to Kubernetes (CNCF)
- [PDF 원문](https://www.cncf.io/wp-content/uploads/2020/08/The-Illustrated-Childrens-Guide-to-Kubernetes.pdf)
- [CNCF 페이지](https://www.cncf.io/phippy/the-childrens-illustrated-guide-to-kubernetes/) · [Phippy & Friends](https://www.cncf.io/phippy/)

Matt Butcher가 딸에게 쿠버네티스를 설명하려고 만든 것. 파이피(기린 = PHP 앱),
캡틴 큐브 등 캐릭터로 개념을 서사화. CC-BY-4.0.

**훔칠 것:** 캐릭터에 개념을 고정시키는 기법. 개념이 여러 개 나올 때 각각에
얼굴을 주면 청중이 헷갈리지 않는다. 그리고 관계를 대화로 설명한다.
**주의:** 이 방식은 개념 5개 이상일 때 유리하고, 하나를 깊게 팔 때는 산만해진다.

### Maggie Appleton — [maggieappleton.com/essays](https://maggieappleton.com/essays/)
설명용 일러스트가 붙은 에세이. 완성도별로 씨앗/새싹/상록수로 분류.

**훔칠 것:** 손그림 느낌의 다이어그램이 "이건 정확한 명세가 아니라 개념 모델"이라는
신호를 준다. 깔끔한 박스 다이어그램은 청중이 문자 그대로 받아들이게 만든다.
→ 비유 슬라이드는 느슨하게, 실제 모습 슬라이드는 정확하게 그린다.

## 큐레이션 · 이론

- [awesome-explanations](https://github.com/BHSPitMonkey/awesome-explanations) — 인터랙티브 설명자료 모음
- [Andy Matuschak — Explorable explanations](https://notes.andymatuschak.org/zRXEyTA5YxgqiBP3UE3C6si) — 왜 인터랙티브가 효과적인지, 그리고 한계
- [Simon Willison, explorables 태그](https://simonwillison.net/tags/explorables/) — 새 사례 계속 수집됨

## 이 스킬이 만드는 것에 가까운 자료

이 문서 위쪽에 든 사례들이 **전부 읽기 자료**라는 점을 보라. 발표 슬라이드는
하나도 없다. 2026-07-28 개정 전까지 이 스킬은 발표용 게이트를 걸고 있었는데,
정작 훔쳐올 대상은 처음부터 읽기 자료였다.

- [Wizard Zines](https://wizardzines.com/) — 한 페이지에 한 개념, 그림과 글이
  같은 밀도로 있다. 우리 페이지 구성의 직접적 모델
- [Distill](https://distill.pub/) — 다이어그램마다 "지금 무엇을 보고 있는지"
  라벨. 4장 메커니즘 그림에 그대로 적용

## 반례 — 참고하지 말 것

슬라이드 템플릿 판매 사이트(slideteam, slidegeeks, slideegg 등)의 "technical
presentation template"류. 시각적으로 화려하지만 Coherence 원칙 위반의 전시장이다.
아이콘·그라데이션·3D 도형이 내용과 무관하게 채워져 있다. 예쁜 것과 이해되는 것은
다르다.
