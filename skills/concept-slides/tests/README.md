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
