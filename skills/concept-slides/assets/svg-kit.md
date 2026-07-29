# SVG 조각 모음

복붙해서 라벨과 좌표만 바꿔 쓴다. 모두 `deck.html`의 테마 변수를 쓰므로 라이트/다크
자동 대응된다.

## 규칙

- `viewBox`만 지정하고 `width`/`height`는 CSS(`.figure svg`)가 처리한다.
- 색은 세 가지만 쓴다: `currentColor`(기본 잉크), `var(--accent)`(주목), `var(--warn)`(문제·경고).
  - 배경 채움은 `var(--accent-soft)` / `var(--warn-soft)`.
  - 여기서 벗어나면 Coherence 위반이다. 색은 의미가 있을 때만 늘린다.
- 보조 요소(컨테이너 테두리, 배경 그리드)는 `opacity=".35"~".45"`로 뒤로 물린다.
- 폰트 크기는 `viewBox` 단위로 9~11을 유지한다. 본문이 18px로 작아졌으므로
  그림 라벨이 상대적으로 커 보인다. 그림을 크게 그리기보다 **본문 옆에 좁게**
  두고, 라벨은 짧게 쓴다.
- **`role="img"` + `aria-label` 필수.** 그림이 설명하는 내용을 한 문장으로.
- 텍스트에 `text-anchor="middle"`을 쓰고 박스 중앙 x를 넣으면 정렬이 쉽다.
- **라벨은 SVG 안에 넣는다.** 아래 별도 텍스트로 설명하면 Spatial Contiguity 위반이다.

---

## 1. 노드 박스 (구성요소 하나)

```html
<g fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5">
  <rect x="20" y="40" width="90" height="40" rx="5"/>
</g>
<text x="65" y="64" font-size="10" fill="var(--accent)" text-anchor="middle">이름</text>
```

강조하지 않는 노드는 `fill="none" stroke="currentColor" opacity=".45"`.

## 2. 화살표

`<defs>`에 마커를 한 번 정의하고 여러 선에서 재사용한다.

```html
<defs>
  <marker id="a" viewBox="0 0 10 10" refX="9" refY="5"
          markerWidth="6" markerHeight="6" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/>
  </marker>
</defs>

<!-- 단방향 -->
<path d="M110 60 H180" stroke="currentColor" stroke-width="1.5" marker-end="url(#a)"/>
<!-- 양방향 -->
<path d="M110 60 H180" stroke="currentColor" stroke-width="1.5"
      marker-start="url(#a)" marker-end="url(#a)"/>
<!-- 끊긴 연결 (문제 상황) -->
<path d="M110 60 H150 M170 60 H210" stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="4 3"/>
<path d="M152 52 L168 68 M168 52 L152 68" stroke="var(--warn)" stroke-width="2"/>
```

화살표 위 라벨: 선 중앙 위쪽에 `font-size="9" opacity=".7"`.

## 3. 계층 중첩 (무엇이 무엇 안에 있나)

바깥에서 안으로, 테두리만. 안쪽으로 갈수록 진하게.

```html
<svg viewBox="0 0 300 160" role="img" aria-label="클러스터 안에 노드, 노드 안에 Pod, Pod 안에 컨테이너가 있는 중첩 구조">
  <rect x="6"  y="16" width="288" height="136" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".3"/>
  <rect x="26" y="36" width="248" height="100" rx="7" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".5"/>
  <rect x="46" y="56" width="208" height="62"  rx="6" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  <g fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5">
    <rect x="62" y="72" width="82" height="30" rx="4"/>
    <rect x="156" y="72" width="82" height="30" rx="4"/>
  </g>
  <g font-size="9" fill="currentColor" opacity=".65">
    <text x="12" y="28">클러스터</text><text x="32" y="48">노드</text>
  </g>
  <g font-size="9" fill="var(--accent)">
    <text x="52" y="68">Pod</text>
    <text x="103" y="91" text-anchor="middle">app</text>
    <text x="197" y="91" text-anchor="middle">sidecar</text>
  </g>
</svg>
```

## 4. 비포-애프터 대조 (시간순 변화 · 문제→해결)

가운데 구분선을 두고 좌우로. 왼쪽은 `--warn`, 오른쪽은 `--accent`.

```html
<svg viewBox="0 0 320 150" role="img" aria-label="개별 배치는 연결이 끊기고, Pod으로 묶으면 붙어 있다는 대조">
  <line x1="160" y1="12" x2="160" y2="138" stroke="currentColor" stroke-width="1" stroke-dasharray="3 4" opacity=".35"/>
  <text x="78"  y="20" font-size="10" fill="var(--warn)"   text-anchor="middle">따로 띄우면</text>
  <text x="242" y="20" font-size="10" fill="var(--accent)" text-anchor="middle">Pod으로 묶으면</text>
  <!-- 왼쪽: 갈라진 상태 -->
  <g fill="var(--warn-soft)" stroke="var(--warn)" stroke-width="1.5">
    <rect x="16" y="44" width="54" height="28" rx="4"/>
    <rect x="88" y="96" width="54" height="28" rx="4"/>
  </g>
  <!-- 오른쪽: 하나의 경계 안 -->
  <rect x="182" y="40" width="120" height="86" rx="7" fill="none" stroke="var(--accent)" stroke-width="1.5"/>
  <g fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5">
    <rect x="196" y="54" width="92" height="26" rx="4"/>
    <rect x="196" y="88" width="92" height="26" rx="4"/>
  </g>
</svg>
```

## 5. 흐름 / 파이프라인 (요청이 어디를 지나나)

단계마다 번호를 붙인다. 번호가 있으면 독자가 "3번 단계"를 글과 그림에서 같이
찾을 수 있다.

```html
<svg viewBox="0 0 340 90" role="img" aria-label="요청이 인그레스, 서비스, Pod을 차례로 지나는 흐름">
  <defs><marker id="f" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker></defs>
  <g fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5">
    <rect x="8"   y="30" width="86" height="34" rx="5"/>
    <rect x="127" y="30" width="86" height="34" rx="5"/>
    <rect x="246" y="30" width="86" height="34" rx="5"/>
  </g>
  <g font-size="10" fill="var(--accent)" text-anchor="middle">
    <text x="51" y="51">Ingress</text><text x="170" y="51">Service</text><text x="289" y="51">Pod</text>
  </g>
  <g stroke="currentColor" stroke-width="1.5" marker-end="url(#f)">
    <path d="M96 47 H123"/><path d="M215 47 H242"/>
  </g>
  <g font-size="9" fill="currentColor" opacity=".55" text-anchor="middle">
    <text x="51" y="24">①</text><text x="170" y="24">②</text><text x="289" y="24">③</text>
  </g>
</svg>
```

## 5b. 번호 붙은 세로 단계 (`precise` 장 전용)

4장 본문의 `.steps` 번호와 그림의 번호를 **일치시킨다.** 독자가 "2번 단계"를
글과 그림에서 같이 찾을 수 있어야 한다.

```html
<svg viewBox="0 0 200 170" role="img" aria-label="세 단계가 위에서 아래로 이어지는 흐름">
  <defs><marker id="v" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
    <path d="M0 0 L10 5 L0 10 z" fill="currentColor"/></marker></defs>
  <g fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5">
    <rect x="34" y="10" width="132" height="30" rx="5"/>
    <rect x="34" y="66" width="132" height="30" rx="5"/>
    <rect x="34" y="122" width="132" height="30" rx="5"/>
  </g>
  <g font-size="10" fill="var(--accent)" text-anchor="middle">
    <text x="100" y="29">첫 단계</text><text x="100" y="85">둘째 단계</text>
    <text x="100" y="141">셋째 단계</text>
  </g>
  <g font-size="9" fill="var(--accent)" text-anchor="middle">
    <text x="22" y="29">①</text><text x="22" y="85">②</text><text x="22" y="141">③</text>
  </g>
  <g stroke="currentColor" stroke-width="1.5" marker-end="url(#v)" opacity=".6">
    <path d="M100 40 V62"/><path d="M100 96 V118"/>
  </g>
</svg>
```

`id="v"`는 문서 전체에서 유일해야 한다. 슬라이드가 한 DOM에 다 들어가므로
`id="v-루프"`처럼 접미사를 붙인다.

## 6. 스택 레이어 (추상화 계층)

아래에서 위로 쌓는다. 설명하는 층만 `--accent`, 나머지는 물린다.

```html
<svg viewBox="0 0 200 150" role="img" aria-label="하드웨어 위에 OS, 컨테이너 런타임, 컨테이너가 쌓인 계층">
  <g stroke="currentColor" stroke-width="1.5" fill="none" opacity=".4">
    <rect x="20" y="112" width="160" height="26" rx="4"/>
    <rect x="20" y="82"  width="160" height="26" rx="4"/>
  </g>
  <rect x="20" y="52" width="160" height="26" rx="4" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.5"/>
  <rect x="20" y="22" width="160" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
  <g font-size="10" text-anchor="middle">
    <text x="100" y="130" fill="currentColor" opacity=".65">하드웨어</text>
    <text x="100" y="100" fill="currentColor" opacity=".65">호스트 OS</text>
    <text x="100" y="70"  fill="var(--accent)">컨테이너 런타임</text>
    <text x="100" y="40"  fill="currentColor" opacity=".65">컨테이너</text>
  </g>
</svg>
```

## 7. 타임라인 (상태 전이)

```html
<svg viewBox="0 0 320 70" role="img" aria-label="Pending에서 Running을 거쳐 Succeeded로 가는 상태 전이">
  <line x1="20" y1="40" x2="300" y2="40" stroke="currentColor" stroke-width="1.5" opacity=".35"/>
  <g fill="var(--accent)">
    <circle cx="30" cy="40" r="5"/><circle cx="160" cy="40" r="5"/><circle cx="290" cy="40" r="5"/>
  </g>
  <g font-size="10" fill="currentColor" text-anchor="middle">
    <text x="30" y="26">Pending</text><text x="160" y="26">Running</text><text x="290" y="26">Succeeded</text>
  </g>
  <g font-size="9" fill="currentColor" opacity=".55" text-anchor="middle">
    <text x="95" y="58">스케줄 완료</text><text x="225" y="58">작업 종료</text>
  </g>
</svg>
```

## 8. 강조 배지 (한 곳을 짚을 때)

```html
<circle cx="250" cy="60" r="14" fill="none" stroke="var(--warn)" stroke-width="2" stroke-dasharray="3 3"/>
<text x="250" y="88" font-size="9" fill="var(--warn)" text-anchor="middle">여기가 문제</text>
```

---

## 이모지 픽토그램

가벼운 시각 시그니파이어로만. **슬라이드당 최대 2개.** 라벨 대신 쓰지 말고, 라벨과
같이 쓴다.

```html
<text x="65" y="64" font-size="16" text-anchor="middle">📦</text>
```

쓸모 있는 것: 📦 컨테이너 · 🖥 노드/서버 · 🗂 볼륨 · 🔀 라우팅 · 🔒 시크릿 ·
⚙️ 설정 · 🚦 헬스체크 · ⚠️ 문제

**하지 말 것:** 슬라이드마다 이모지 붙이기, 불릿 대신 이모지 쓰기, 🚀✨💡 같은
의미 없는 장식. Coherence 원칙 위반이고 자료가 유치해 보인다.

## 그리기 전 확인

1. 이 그림이 없으면 독자가 머릿속에 무언가를 그려야 하는가? 아니면 그리지 않는다.
2. 라벨이 그림 안에 있는가?
3. 본문 텍스트가 이 그림과 같은 말을 하고 있지 않은가?
4. 색이 세 가지 이내인가? 각 색에 의미가 있는가?
5. `aria-label`을 썼는가?
