# 🛸 스틸 텅드럼 연주 웹앱 — 통합 바이브코딩 프롬프트 (11키·15키)

> 이 문서는 첨부된 **칼림바 연주 웹앱 통합 프롬프트**의 장점인 **9:16 풀스크린, 원본 이미지 무왜곡, 투명 오버레이 연주 영역, `event.code` 기반 키보드 매핑, 순수 함수 테스트, Web Audio 합성 사운드, 접근성 체크리스트**를 스틸 텅드럼에 맞게 재구성한 프롬프트입니다.
>
> 핵심 변경점:
> - 칼림바의 좌→우 금속 키 배열 → **스틸 텅드럼의 원형/방사형 텅 배열**
> - 17키·21키 칼림바 → **11키·15키 스틸 텅드럼**
> - 칼림바 금속 어택 → **스틸 텅드럼의 부드럽고 긴 공명, 둥근 금속 울림**
> - 숫자키 규칙은 유지: **숫자키 단독=중간음 / Shift+숫자=C5 이상 높은음 / Ctrl+숫자=B3 이하 낮은음**

---

## 0. 이 문서 사용법 & 이미지 자산 준비 (먼저 읽기 ★)

1. 이 마크다운 전체를 복사해 AI 코딩 도구(Claude, Cursor, v0, Bolt, Lovable, Replit Agent, Gemini 등)에 붙여넣습니다.
2. 다음처럼 요청합니다.
   > 위 명세대로 **단일 `index.html` + `assets/` 폴더** 구조의 11키/15키 스틸 텅드럼 연주 웹앱을 완성해줘. 외부 라이브러리 없이 HTML/CSS/Vanilla JS와 Web Audio API만 사용해줘.
3. 결과물을 받은 뒤 **16번 완성 체크리스트**로 검수하고, 어긋나는 항목을 다시 수정 요청합니다.

### 이미지 자산 파일명 규칙

실제 이미지가 있다면 아래처럼 단순 영문 파일명으로 바꿔 `assets/` 폴더에 넣고 코드에서는 이 이름만 참조하세요. 한글·공백·날짜가 들어간 파일명은 배포 환경에서 경로 오류가 생기기 쉽습니다.

| 준비할 원본 이미지 | 코드에서 쓸 파일명 | 용도 |
|---|---|---|
| 귀여운 11키 스틸 텅드럼 캐릭터 또는 아이콘 | `assets/char-11.png` | **선택 화면** 11키 카드 |
| 귀여운 15키 스틸 텅드럼 캐릭터 또는 아이콘 | `assets/char-15.png` | **선택 화면** 15키 카드 |
| 11키 스틸 텅드럼 실물 사진/일러스트 | `assets/play-11.png` | **연주 화면** 11키 본체 |
| 15키 스틸 텅드럼 실물 사진/일러스트 | `assets/play-15.png` | **연주 화면** 15키 본체 |

**중요 이미지 규칙**
- 이미지가 제공되면 **절대 새로 그리거나 대체하지 말고 원본 그대로 사용**합니다.
- 이미지가 아직 없다면 앱이 깨지지 않도록 **CSS/SVG 기반 원형 텅드럼 fallback**을 만들어 둡니다. 단, 실제 이미지가 `assets/play-11.png`, `assets/play-15.png`로 들어오면 자동으로 원본 이미지를 우선 표시합니다.
- 연주 오버레이는 이미지 위에 얹는 투명 버튼이며, 이미지 자체는 클릭/연주 효과 때문에 찌그러지거나 잘리거나 변형되면 안 됩니다.

---

## 1. 프로젝트 개요 & 핵심 요구사항

브라우저에서 **키보드와 마우스/터치로 스틸 텅드럼을 연주**하는 인터랙티브 웹앱을 만든다.

- **화면 1 — 선택 화면**: `11키 스틸 텅드럼` / `15키 스틸 텅드럼` 중 하나를 선택한다.
- **화면 2 — 연주 화면**: 선택한 스틸 텅드럼 이미지가 9:16 화면에 크게 표시되고, 이미지 위의 투명 텅 영역과 키보드로 연주한다.
- **입력 규칙 핵심**:
  - `숫자키` 단독 → C4~B4 중간음
  - `Shift + 숫자키` → C5 이상 높은음
  - `Ctrl + 숫자키` → B3 이하 낮은음
- **튜닝 기준**:
  - 11키: C Major, `G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5`
  - 15키: C Major, `E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5`
- **사운드**: Web Audio API 합성. mp3 없이 동작하되, 나중에 샘플 파일로 쉽게 교체 가능한 구조.
- **톤앤매너**: 명상적이고 따뜻한 분위기. 둥근 금속 질감, 부드러운 글로우, 힐링 악기 느낌.

---

## 2. 기술 스택 & 결과물 형태

### 기본 결과물

- **단일 `index.html`**
  - HTML + CSS + Vanilla JS를 한 파일 안에 작성
  - 별도 빌드 도구 없이 더블클릭으로 실행 가능
- **`assets/` 폴더**
  - `char-11.png`, `char-15.png`, `play-11.png`, `play-15.png`
- **사운드**
  - Web Audio API: `AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, optional noise buffer
- **외부 라이브러리 금지**
  - React, jQuery, Tone.js, Howler.js 없이 구현
  - 단, 부록 B에 React+TypeScript 구조를 선택 옵션으로 제공

### 코드 품질 원칙

- 음 데이터는 반드시 `NOTE`, `DRUMS`, `MAP` 같은 **데이터 객체로 분리**한다.
- 키 입력 → 음 변환은 반드시 `resolveShortcut()` 같은 **테스트 가능한 순수 함수**로 만든다.
- UI 클릭과 키보드 입력은 모두 동일한 `playNote(noteId)` 경로를 사용한다.
- DOM 생성, 오디오 엔진, 상태 관리, 키 매핑 로직을 함수 단위로 나눈다.
- 접근성: `role`, `aria-label`, `aria-live`, 포커스 링, 키보드 조작 가능성을 반드시 반영한다.

---

## 3. ★ 화면/레이아웃 규격 — 9:16 풀스크린

앱은 **세로 9:16 비율의 한 화면**을 기준으로 하고, 뷰포트 안에서 가능한 한 크게 표시한다.

- 앱 루트 `#app`은 항상 9:16 비율을 유지한다.
- 모바일 세로 화면에서는 화면을 거의 꽉 채운다.
- 데스크톱/가로 화면에서는 9:16 패널이 중앙에 크게 표시되고, 바깥은 어두운 레터박스 배경으로 채운다.
- 모바일 주소창 변화 대응을 위해 `100dvh`를 사용한다.
- 화면 1과 화면 2는 `#app` 안에서 `position:absolute; inset:0;`로 겹쳐 두고 `hidden`으로 토글한다.
- 앱 내부에 빈 흰 여백이 보이면 안 된다. 남는 공간은 크림/그라데이션/패턴 배경으로 채운다.

### 레퍼런스 CSS

```css
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; }
body {
  display: grid;
  place-items: center;
  min-height: 100dvh;
  background: radial-gradient(circle at top, #2c2924 0%, #12100d 60%);
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;
  color: var(--ink);
}
#app {
  --bg: #FBF6EE;
  --cream-2: #F4E6D2;
  --teal: #5AA7A0;
  --teal-dark: #367C76;
  --brown: #5A4034;
  --metal: #DADCE3;
  --metal-dark: #8E939C;
  --glow: #FFD66B;
  --ink: #3A2E28;

  position: relative;
  width: min(100vw, calc(100dvh * 9 / 16));
  height: min(100dvh, calc(100vw * 16 / 9));
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 15%, rgba(255, 214, 107, .28), transparent 28%),
    linear-gradient(180deg, #FFF9F0 0%, var(--bg) 48%, #F3E2CD 100%);
  box-shadow: 0 20px 60px rgba(0,0,0,.38);
  isolation: isolate;
}
.screen {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.screen[hidden] { display: none; }
```

---

## 4. ★ 이미지 자산 사용 규칙 — 원본 무왜곡

스틸 텅드럼 이미지는 앱의 핵심 비주얼이다. 반드시 아래 원칙을 지킨다.

- 모든 이미지는 **종횡비를 변경하지 않는다**.
- `width`와 `height`를 따로 강제로 늘려 찌그러뜨리지 않는다.
- 기본 표시는 `object-fit: contain`이다.
- `object-fit: cover`는 가장자리가 잘릴 수 있으므로 연주 화면 본체에는 쓰지 않는다.
- 연주 화면 본체 이미지는 9:16 안에서 가능한 한 크게 표시하되, 이미지 전체가 보여야 한다.
- 이미지가 차지하고 남는 공간은 테마 배경과 부드러운 장식 패턴으로 채운다.

### 원형 텅드럼 이미지 + 투명 오버레이 정렬 방법

스틸 텅드럼은 보통 원형 이미지이므로, 사진과 같은 비율의 `.drum-stage` 래퍼를 만들고 그 안에 투명 텅 버튼을 백분율 좌표로 배치한다.

```css
.drum-wrap {
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  padding: clamp(8px, 3cqw, 18px);
}
.drum-stage {
  position: relative;
  width: min(92%, 58vh);
  max-width: 100%;
  aspect-ratio: 1 / 1; /* 실제 이미지가 정사각이 아니면 DRUMS[type].aspect로 조정 */
  display: grid;
  place-items: center;
}
.drum-photo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 22px 24px rgba(80,50,25,.24));
}
.tongue-layer {
  position: absolute;
  inset: 0;
}
.tongue-hit {
  position: absolute;
  transform: translate(-50%, -50%) rotate(var(--rot));
  width: var(--w);
  height: var(--h);
  border: 0;
  border-radius: 999px;
  background: rgba(255,255,255,.001); /* 투명하지만 터치 가능 */
  cursor: pointer;
  touch-action: manipulation;
}
.tongue-hit::after {
  content: "";
  position: absolute;
  inset: 8%;
  border-radius: inherit;
  opacity: 0;
  background: radial-gradient(circle, rgba(255,214,107,.82), rgba(255,214,107,.18) 58%, transparent 72%);
  box-shadow: 0 0 28px rgba(255,214,107,.75);
  transition: opacity .16s ease, transform .16s ease;
}
.tongue-hit.is-playing::after {
  opacity: 1;
  transform: scale(1.12);
}
```

> 실제 사진마다 텅 위치가 다르므로, 버튼 좌표는 `DRUMS[type].positions` 한 곳에서만 조정할 수 있게 만든다. 사진이 바뀌어도 앱 전체 코드를 고치지 말고 좌표 객체만 수정한다.

---

## 5. 공통 디자인 시스템

스틸 텅드럼의 이미지는 **명상·힐링·금속 공명** 느낌을 살린다.

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#FBF6EE` | 앱 배경, 따뜻한 크림색 |
| `--cream-2` | `#F4E6D2` | 카드/패널 배경 보조 |
| `--teal` | `#5AA7A0` | 선택 라벨, 주요 버튼 |
| `--teal-dark` | `#367C76` | 버튼 hover, 강조 텍스트 |
| `--brown` | `#5A4034` | 본문 텍스트, 따뜻한 악기 톤 |
| `--metal` | `#DADCE3` | 금속 느낌 보조 |
| `--metal-dark` | `#8E939C` | 금속 그림자 |
| `--glow` | `#FFD66B` | 연주 시 하이라이트 |
| `--ink` | `#3A2E28` | 기본 텍스트 |

### 스타일 원칙

- 카드와 버튼은 18~28px 이상의 큰 라운드.
- 그림자는 강하지 않게, 부드러운 확산형.
- 선택 화면은 귀엽고 친근하게, 연주 화면은 차분하고 몰입감 있게.
- 클릭/터치 시 살짝 눌리는 `scale(.98)`과 연주 시 노란 글로우.
- 화면 전환은 0.25~0.35초 페이드/슬라이드.
- `prefers-reduced-motion: reduce`이면 큰 움직임을 줄이고 opacity 변화 정도만 남긴다.

---

## 6. [화면 1] 선택 화면 — 11키 / 15키 카드

### 레이아웃

- 상단: 앱 타이틀
  - 예: `🛸 스틸 텅드럼 연주하기`
- 부제:
  - 예: `연주할 텅드럼을 골라주세요`
- 본문: 2개의 큰 카드
  - **11키 스틸 텅드럼** 카드
    - 이미지: `assets/char-11.png`
    - 라벨: `11키 스틸 텅드럼`
    - 설명: `G3~C5 · C Major · 가볍게 연주하기`
  - **15키 스틸 텅드럼** 카드
    - 이미지: `assets/char-15.png`
    - 라벨: `15키 스틸 텅드럼`
    - 설명: `E3~E5 · C Major · 넓은 음역`

### 상호작용

- hover/focus:
  - `transform: translateY(-4px) scale(1.025)`
  - 카드 그림자 강화
  - 이미지가 살짝 떠오르는 느낌
- 클릭/Enter/Space:
  1. 선택 카드 강조
  2. 반대 카드 opacity 0.45
  3. 클릭 지점에 ripple 생성
  4. 약 0.25~0.4초 후 연주 화면으로 전환
- 접근성:
  - 카드: `button` 또는 `role="button" tabindex="0"`
  - `aria-label="11키 스틸 텅드럼 선택"`
  - 포커스 링은 눈에 잘 보여야 함

### 선택 화면 카드 CSS 예시

```css
.select-title {
  margin: clamp(18px, 5cqw, 34px) 20px 8px;
  text-align: center;
  font-size: clamp(24px, 7cqw, 38px);
  color: var(--brown);
}
.select-subtitle {
  margin: 0 20px clamp(12px, 4cqw, 24px);
  text-align: center;
  color: rgba(58,46,40,.72);
  font-size: clamp(13px, 3.6cqw, 18px);
}
.drum-card-list {
  flex: 1;
  display: grid;
  grid-template-rows: 1fr 1fr;
  gap: clamp(12px, 3.5cqw, 22px);
  padding: 0 clamp(18px, 5cqw, 34px) clamp(22px, 6cqw, 42px);
}
.drum-card {
  border: 0;
  border-radius: 28px;
  background: rgba(255,255,255,.76);
  box-shadow: 0 16px 34px rgba(80,50,25,.14);
  padding: clamp(12px, 4cqw, 22px);
  display: grid;
  grid-template-columns: 42% 1fr;
  align-items: center;
  gap: clamp(10px, 3cqw, 18px);
  cursor: pointer;
  transition: transform .22s ease, box-shadow .22s ease, opacity .22s ease;
}
.drum-card:hover,
.drum-card:focus-visible {
  transform: translateY(-4px) scale(1.025);
  box-shadow: 0 22px 42px rgba(80,50,25,.22);
}
.drum-card img {
  width: 100%;
  height: 100%;
  max-height: 24vh;
  object-fit: contain;
}
.card-label {
  display: inline-flex;
  width: fit-content;
  padding: .6em 1em;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--teal), var(--teal-dark));
  color: white;
  font-weight: 800;
}
```

---

## 7. [화면 2] 연주 화면 — 원형 텅드럼 + 투명 텅 오버레이

### 레이아웃

- **상단 바**
  - 왼쪽: `← 다시 선택`
  - 가운데: 선택된 악기 이름 (`11키 스틸 텅드럼` 또는 `15키 스틸 텅드럼`)
  - 오른쪽: 볼륨 아이콘 또는 볼륨 슬라이더
- **중앙 메인 영역**
  - `.drum-stage` 안에 선택된 악기 이미지 표시
  - 이미지 위 `.tongue-layer`에 투명 버튼 배치
  - 텅 버튼은 실제 텅 모양에 맞춰 타원/캡슐 형태로 배치
- **하단 안내 패널**
  - 한 줄 요약: `숫자=중간음 · Shift+숫자=높은음 · Ctrl+숫자=낮은음`
  - 최근 연주음 배지: 예 `도(C4)` / `낮은 솔(G3)` / `높은 미(E5)`
  - 매핑표 토글 버튼: `키 안내 보기`

### 오버레이 렌더링 규칙

- `DRUMS[type].notes` 배열의 모든 음에 대해 버튼을 만든다.
- 각 버튼의 좌표는 `DRUMS[type].positions[noteId]`에서 읽는다.
- 좌표는 퍼센트 기준이다.
  - `x`: stage 왼쪽 기준 %
  - `y`: stage 위쪽 기준 %
  - `w`: 버튼 너비 %
  - `h`: 버튼 높이 %
  - `rot`: 회전 각도, 예 `-35deg`
- 버튼은 투명하지만 hover/focus 시 아주 옅은 윤곽을 보여도 된다.
- 연주 중에는 `.is-playing` 클래스를 짧게 붙여 노란 글로우를 표시한다.
- 사진 자체는 절대 흔들거나 확대하지 않는다. 연주 효과는 오버레이에서만 처리한다.

### 오버레이 생성 코드 예시

```js
function renderTongues(type) {
  const config = DRUMS[type];
  const layer = document.querySelector(".tongue-layer");
  layer.innerHTML = "";

  config.notes.forEach(noteId => {
    const p = config.positions[noteId];
    if (!p) return;

    const btn = document.createElement("button");
    btn.className = "tongue-hit";
    btn.dataset.note = noteId;
    btn.type = "button";
    btn.style.left = `${p.x}%`;
    btn.style.top = `${p.y}%`;
    btn.style.setProperty("--w", `${p.w}%`);
    btn.style.setProperty("--h", `${p.h}%`);
    btn.style.setProperty("--rot", p.rot || "0deg");
    btn.setAttribute("aria-label", `${labelOf(noteId)}, 단축키 ${shortcutLabelOf(noteId, type)}`);

    btn.addEventListener("pointerdown", ev => {
      ev.preventDefault();
      triggerNote(noteId);
    });

    layer.appendChild(btn);
  });
}
```

---

## 8. 키보드 입력 규칙 (핵심 ★)

세 음역을 수식키로 구분한다.

| 입력 | 음역 | 예시 |
|---|---|---|
| `숫자키` 단독 | 중간음 C4~B4 | `1=C4`, `5=G4`, `7=B4` |
| `Shift + 숫자키` | 높은음 C5 이상 | `Shift+1=C5`, `Shift+2=D5`, `Shift+3=E5` |
| `Ctrl + 숫자키` | 낮은음 B3 이하 | `Ctrl+3=E3`, `Ctrl+7=B3` |

### 설계 원칙 — 같은 숫자키 = 같은 계이름

숫자 1~7은 계이름을 뜻한다.

| 숫자 | 계이름 | 음 이름 |
|---|---|---|
| 1 | 도 | C |
| 2 | 레 | D |
| 3 | 미 | E |
| 4 | 파 | F |
| 5 | 솔 | G |
| 6 | 라 | A |
| 7 | 시 | B |

따라서 수식키는 옥타브만 결정한다.

- `3` = E4
- `Ctrl+3` = E3, 단 선택한 악기에 E3이 있을 때만 재생
- `Shift+3` = E5, 단 선택한 악기에 E5가 있을 때만 재생
- `5` = G4
- `Ctrl+5` = G3
- `Shift+5` = G5이지만 이번 11키/15키 명세에는 G5가 없으므로 무음

### 모델별 유효 키

#### 11키 스틸 텅드럼 (`G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5`)

| 입력 | 음 |
|---|---|
| `1` | C4 |
| `2` | D4 |
| `3` | E4 |
| `4` | F4 |
| `5` | G4 |
| `6` | A4 |
| `7` | B4 |
| `Shift+1` | C5 |
| `Ctrl+5` | G3 |
| `Ctrl+6` | A3 |
| `Ctrl+7` | B3 |

- `Shift+2`, `Shift+3`은 D5/E5인데 11키에는 없으므로 무음.
- `Ctrl+3`, `Ctrl+4`는 E3/F3인데 11키에는 없으므로 무음.
- `8/9/0` 단독은 무음.

#### 15키 스틸 텅드럼 (`E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5`)

| 입력 | 음 |
|---|---|
| `1` | C4 |
| `2` | D4 |
| `3` | E4 |
| `4` | F4 |
| `5` | G4 |
| `6` | A4 |
| `7` | B4 |
| `Shift+1` | C5 |
| `Shift+2` | D5 |
| `Shift+3` | E5 |
| `Ctrl+3` | E3 |
| `Ctrl+4` | F3 |
| `Ctrl+5` | G3 |
| `Ctrl+6` | A3 |
| `Ctrl+7` | B3 |

- `Shift+4~0`은 이번 15키 악기에 F5 이상 음이 없으므로 무음.
- `Ctrl+1`, `Ctrl+2`, `Ctrl+8~0`은 무음.
- `8/9/0` 단독은 무음.

---

## 9. 음 데이터 (11키 / 15키)

본 명세는 **C Major 기준**으로 고정한다. 실물 텅드럼이 다른 튜닝이라면 아래 `NOTE`, `DRUMS[type].notes`, `MAP`만 바꾸면 된다.

### 음 배열

```js
// 11키 C Major: G3~C5
const NOTES_11 = [
  "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
  "C5"
];

// 15키 C Major: E3~E5
const NOTES_15 = [
  "E3", "F3", "G3", "A3", "B3",
  "C4", "D4", "E4", "F4", "G4", "A4", "B4",
  "C5", "D5", "E5"
];
```

### 주파수와 숫자악보

```js
const NOTE = {
  // noteId: { freq, midi, num, ko }
  E3: { freq: 164.81, midi: 52, num: ".3", ko: "낮은 미" },
  F3: { freq: 174.61, midi: 53, num: ".4", ko: "낮은 파" },
  G3: { freq: 196.00, midi: 55, num: ".5", ko: "낮은 솔" },
  A3: { freq: 220.00, midi: 57, num: ".6", ko: "낮은 라" },
  B3: { freq: 246.94, midi: 59, num: ".7", ko: "낮은 시" },

  C4: { freq: 261.63, midi: 60, num: "1", ko: "도" },
  D4: { freq: 293.66, midi: 62, num: "2", ko: "레" },
  E4: { freq: 329.63, midi: 64, num: "3", ko: "미" },
  F4: { freq: 349.23, midi: 65, num: "4", ko: "파" },
  G4: { freq: 392.00, midi: 67, num: "5", ko: "솔" },
  A4: { freq: 440.00, midi: 69, num: "6", ko: "라" },
  B4: { freq: 493.88, midi: 71, num: "7", ko: "시" },

  C5: { freq: 523.25, midi: 72, num: "1'", ko: "높은 도" },
  D5: { freq: 587.33, midi: 74, num: "2'", ko: "높은 레" },
  E5: { freq: 659.25, midi: 76, num: "3'", ko: "높은 미" }
};

function freqFromMidi(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
```

---

## 10. 텅드럼 데이터 모델 & 시각 좌표

스틸 텅드럼은 사진마다 텅 위치가 다르므로, 아래 좌표는 **시작값**이다. 실제 이미지와 어긋나면 `positions`만 수정한다.

### 데이터 모델

```js
const MAP = {
  MID:  { 1:"C4", 2:"D4", 3:"E4", 4:"F4", 5:"G4", 6:"A4", 7:"B4" },
  HIGH: { 1:"C5", 2:"D5", 3:"E5" },
  LOW:  { 3:"E3", 4:"F3", 5:"G3", 6:"A3", 7:"B3" }
};

const DRUMS = {
  "11": {
    type: "11",
    name: "11키 스틸 텅드럼",
    range: "G3~C5",
    scale: "C Major",
    charImage: "assets/char-11.png",
    playImage: "assets/play-11.png",
    fallbackClass: "fallback-drum-11",
    aspect: "1 / 1",
    notes: NOTES_11,
    positions: POS_11
  },
  "15": {
    type: "15",
    name: "15키 스틸 텅드럼",
    range: "E3~E5",
    scale: "C Major",
    charImage: "assets/char-15.png",
    playImage: "assets/play-15.png",
    fallbackClass: "fallback-drum-15",
    aspect: "1 / 1",
    notes: NOTES_15,
    positions: POS_15
  }
};
```

### 11키 기본 좌표 — 원형/방사형 배치

```js
const POS_11 = {
  // x, y, w, h는 .drum-stage 기준 %. rot는 CSS 회전값.
  // 중앙/하단 쪽 저음이 더 크고, 바깥쪽 고음이 더 작게 느껴지도록 배치한다.
  G3: { x: 50, y: 55, w: 23, h: 18, rot: "0deg" },
  A3: { x: 35, y: 64, w: 19, h: 13, rot: "-34deg" },
  B3: { x: 65, y: 64, w: 19, h: 13, rot: "34deg" },

  C4: { x: 50, y: 34, w: 17, h: 23, rot: "0deg" },
  D4: { x: 34, y: 39, w: 14, h: 21, rot: "-34deg" },
  E4: { x: 66, y: 39, w: 14, h: 21, rot: "34deg" },
  F4: { x: 24, y: 53, w: 13, h: 19, rot: "-72deg" },
  G4: { x: 76, y: 53, w: 13, h: 19, rot: "72deg" },
  A4: { x: 31, y: 78, w: 13, h: 17, rot: "-130deg" },
  B4: { x: 69, y: 78, w: 13, h: 17, rot: "130deg" },
  C5: { x: 50, y: 82, w: 13, h: 16, rot: "180deg" }
};
```

### 15키 기본 좌표 — 중앙 저음 + 외곽 고음

```js
const POS_15 = {
  E3: { x: 50, y: 55, w: 24, h: 18, rot: "0deg" },
  F3: { x: 38, y: 62, w: 20, h: 13, rot: "-28deg" },
  G3: { x: 62, y: 62, w: 20, h: 13, rot: "28deg" },
  A3: { x: 36, y: 73, w: 17, h: 12, rot: "-55deg" },
  B3: { x: 64, y: 73, w: 17, h: 12, rot: "55deg" },

  C4: { x: 50, y: 32, w: 16, h: 22, rot: "0deg" },
  D4: { x: 36, y: 36, w: 14, h: 20, rot: "-32deg" },
  E4: { x: 64, y: 36, w: 14, h: 20, rot: "32deg" },
  F4: { x: 25, y: 48, w: 12, h: 18, rot: "-72deg" },
  G4: { x: 75, y: 48, w: 12, h: 18, rot: "72deg" },
  A4: { x: 23, y: 64, w: 11, h: 17, rot: "-104deg" },
  B4: { x: 77, y: 64, w: 11, h: 17, rot: "104deg" },

  C5: { x: 30, y: 83, w: 11, h: 15, rot: "-138deg" },
  D5: { x: 70, y: 83, w: 11, h: 15, rot: "138deg" },
  E5: { x: 50, y: 87, w: 11, h: 15, rot: "180deg" }
};
```

> 좌표는 “정답”이 아니라 “시작점”이다. 실제 이미지의 텅 각도와 위치에 맞게 개발자가 조정한다. 중요한 것은 음 데이터와 키보드 매핑이 정확히 동작하는 것이다.

---

## 11. 키 입력 처리 로직 (순수 함수 + 엣지케이스 + 테스트)

### 반드시 지킬 규칙

1. `event.key`가 아니라 **`event.code`** 를 사용한다.
   - `Shift+1`을 누르면 일부 키보드에서 `event.key`가 `!`가 되므로 숫자 판별이 깨진다.
2. `Digit1~Digit0`과 `Numpad1~Numpad0`을 모두 지원한다.
3. `Alt` 또는 `Meta`가 눌린 경우 무음 처리한다.
   - OS/브라우저 단축키 충돌 방지.
4. `Ctrl+Shift` 동시 입력은 무음 처리한다.
5. `event.repeat`은 무시한다.
   - 꾹 누르고 있을 때 자동 연타되지 않게 한다.
6. 단, 같은 키를 손으로 빠르게 여러 번 누르는 것은 매번 재생한다.
7. 매핑된 유효 키에서만 `preventDefault()`를 호출한다.
8. 포커스가 `input`, `textarea`, `select`, `[contenteditable="true"]` 내부에 있으면 연주하지 않는다.
9. `resolveShortcut()`은 선택된 악기 타입의 `notes`에 실제로 존재하는 음만 반환한다.

### 순수 함수 레퍼런스 구현

```js
function digitOf(code) {
  const match = /^(?:Digit|Numpad)([0-9])$/.exec(code);
  return match ? match[1] : null;
}

function isEditableTarget(target) {
  if (!target || !(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

function resolveShortcut(e, type) {
  if (e.altKey || e.metaKey) return null;
  if (e.shiftKey && e.ctrlKey) return null;

  const d = digitOf(e.code);
  if (d === null) return null;

  let noteId = null;
  if (e.shiftKey) noteId = MAP.HIGH[d] ?? null;
  else if (e.ctrlKey) noteId = MAP.LOW[d] ?? null;
  else noteId = MAP.MID[d] ?? null;

  if (!noteId) return null;
  return DRUMS[type].notes.includes(noteId) ? noteId : null;
}
```

### 전역 keydown 처리

```js
window.addEventListener("keydown", event => {
  if (event.repeat) return;
  if (isEditableTarget(event.target)) return;
  if (!state.currentType) return;

  const noteId = resolveShortcut(event, state.currentType);
  if (!noteId) return;

  event.preventDefault();
  triggerNote(noteId);
});
```

### 필수 테스트 케이스

```js
console.assert(resolveShortcut({code:"Digit1", shiftKey:false, ctrlKey:false, altKey:false, metaKey:false}, "11") === "C4");
console.assert(resolveShortcut({code:"Digit7", shiftKey:false, ctrlKey:false, altKey:false, metaKey:false}, "15") === "B4");
console.assert(resolveShortcut({code:"Digit8", shiftKey:false, ctrlKey:false, altKey:false, metaKey:false}, "15") === null);

console.assert(resolveShortcut({code:"Digit1", shiftKey:true, ctrlKey:false, altKey:false, metaKey:false}, "11") === "C5");
console.assert(resolveShortcut({code:"Digit2", shiftKey:true, ctrlKey:false, altKey:false, metaKey:false}, "11") === null);
console.assert(resolveShortcut({code:"Digit2", shiftKey:true, ctrlKey:false, altKey:false, metaKey:false}, "15") === "D5");
console.assert(resolveShortcut({code:"Digit3", shiftKey:true, ctrlKey:false, altKey:false, metaKey:false}, "15") === "E5");
console.assert(resolveShortcut({code:"Digit4", shiftKey:true, ctrlKey:false, altKey:false, metaKey:false}, "15") === null);

console.assert(resolveShortcut({code:"Digit5", shiftKey:false, ctrlKey:true, altKey:false, metaKey:false}, "11") === "G3");
console.assert(resolveShortcut({code:"Digit3", shiftKey:false, ctrlKey:true, altKey:false, metaKey:false}, "11") === null);
console.assert(resolveShortcut({code:"Digit3", shiftKey:false, ctrlKey:true, altKey:false, metaKey:false}, "15") === "E3");
console.assert(resolveShortcut({code:"Digit7", shiftKey:false, ctrlKey:true, altKey:false, metaKey:false}, "15") === "B3");

console.assert(resolveShortcut({code:"Digit4", shiftKey:true, ctrlKey:true, altKey:false, metaKey:false}, "15") === null);
console.assert(resolveShortcut({code:"Digit1", shiftKey:false, ctrlKey:false, altKey:true, metaKey:false}, "15") === null);
console.assert(resolveShortcut({code:"Digit1", shiftKey:false, ctrlKey:false, altKey:false, metaKey:true}, "15") === null);
console.assert(resolveShortcut({code:"Numpad1", shiftKey:false, ctrlKey:false, altKey:false, metaKey:false}, "11") === "C4");

console.assert(NOTES_11.length === 11);
console.assert(NOTES_15.length === 15);
console.assert(NOTES_11.every(n => NOTE[n]));
console.assert(NOTES_15.every(n => NOTE[n]));
```

---

## 12. 사운드 엔진 — Web Audio 합성

### 목표 음색

스틸 텅드럼은 칼림바보다 더 둥글고 오래 울리는 금속 공명이 특징이다. 목표 음색은 다음과 같다.

- 부드러운 말렛 어택
- 긴 잔향과 공명
- 너무 날카롭지 않은 금속성 배음
- 낮은 음은 더 길고 풍부하게, 높은 음은 더 짧고 맑게
- 빠른 연속 연주와 동시 연주가 가능한 폴리포니

### 필수 구조

- `AudioContext`는 앱 전체에서 1번만 생성하고 재사용한다.
- 첫 사용자 입력 시 `ctx.resume()`을 호출한다.
- 마스터 게인과 볼륨 슬라이더를 연결한다.
- 각 음마다 독립 voice를 생성하고, 끝난 뒤 자동 정리한다.
- 추후 샘플 기반으로 바꾸기 쉽도록 외부에서는 항상 `playNote(noteId, options)`만 호출한다.

### 레퍼런스 구현

```js
let ctx = null;
let master = null;

function ensureAudio() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.82;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
}

function setVolume(value) {
  ensureAudio();
  const v = Math.max(0, Math.min(1, Number(value)));
  master.gain.setTargetAtTime(v, ctx.currentTime, 0.015);
}

function makeNoiseBurst(now, destination, amount = 0.04) {
  const duration = 0.045;
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

  const src = ctx.createBufferSource();
  src.buffer = buffer;

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 900;

  const g = ctx.createGain();
  g.gain.setValueAtTime(amount, now);
  g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  src.connect(hp).connect(g).connect(destination);
  src.start(now);
  src.stop(now + duration + 0.01);
}

function playNote(noteId, options = {}) {
  ensureAudio();
  const info = NOTE[noteId];
  if (!info) return;

  const now = ctx.currentTime;
  const f = info.freq;
  const midi = info.midi;

  // 낮은 음일수록 더 오래 울리게 한다.
  const decay = Math.max(2.2, 4.8 - (midi - 52) * 0.08);
  const attack = 0.007;

  const voice = ctx.createGain();
  voice.gain.setValueAtTime(0.0001, now);
  voice.gain.exponentialRampToValueAtTime(0.8, now + attack);
  voice.gain.exponentialRampToValueAtTime(0.0001, now + decay);

  const toneFilter = ctx.createBiquadFilter();
  toneFilter.type = "lowpass";
  toneFilter.frequency.value = Math.min(6200, f * 10);
  toneFilter.Q.value = 0.8;

  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (pan && typeof options.pan === "number") {
    pan.pan.value = Math.max(-0.55, Math.min(0.55, options.pan));
    voice.connect(toneFilter).connect(pan).connect(master);
  } else {
    voice.connect(toneFilter).connect(master);
  }

  // 스틸 텅드럼 느낌: 거의 정수배지만 살짝 어긋난 배음으로 둥근 금속성 부여
  const partials = [
    [1.00, 1.00],
    [2.01, 0.38],
    [2.98, 0.20],
    [4.16, 0.10],
    [5.43, 0.055]
  ];

  partials.forEach(([mul, gain], index) => {
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = index === 0 ? "sine" : "triangle";
    osc.frequency.setValueAtTime(f * mul, now);

    // 아주 미세한 피치 안정화 느낌
    osc.detune.setValueAtTime(index === 0 ? 0 : (index * 1.5), now);

    og.gain.setValueAtTime(gain, now);
    og.gain.exponentialRampToValueAtTime(0.0001, now + decay * (index === 0 ? 1 : 0.72));

    osc.connect(og).connect(voice);
    osc.start(now);
    osc.stop(now + decay + 0.08);
  });

  makeNoiseBurst(now, voice, 0.025);
}
```

---

## 13. 상호작용 & 시각 효과

### 공통 트리거 함수

키보드, 마우스, 터치 모두 같은 함수를 호출한다.

```js
function triggerNote(noteId) {
  const type = state.currentType;
  const pos = DRUMS[type].positions[noteId];
  const pan = pos ? (pos.x - 50) / 50 : 0;

  playNote(noteId, { pan });
  flashTongue(noteId);
  showRecentNote(noteId);
  updateAriaLive(noteId);
}
```

### 시각 피드백

- 해당 텅 버튼에 `.is-playing` 클래스를 180~240ms 붙인다.
- 최근 연주음 배지를 1초 정도 표시한 뒤 서서히 사라지게 한다.
- 배지 예시:
  - `낮은 솔 · G3 · .5`
  - `도 · C4 · 1`
  - `높은 미 · E5 · 3'`
- 키 안내 패널에서 현재 연주 중인 키 조합을 잠깐 강조해도 좋다.

```js
function flashTongue(noteId) {
  const el = document.querySelector(`.tongue-hit[data-note="${noteId}"]`);
  if (!el) return;
  el.classList.remove("is-playing");
  void el.offsetWidth; // restart animation
  el.classList.add("is-playing");
  window.setTimeout(() => el.classList.remove("is-playing"), 220);
}

function labelOf(noteId) {
  const n = NOTE[noteId];
  return n ? `${n.ko} (${noteId}, ${n.num})` : noteId;
}
```

---

## 14. 접근성 & 반응형

- 모든 카드와 텅은 키보드로 접근 가능해야 한다.
- 카드와 텅 버튼은 실제 `<button>` 사용을 우선한다.
- 이미지에는 설명 `alt`를 넣는다.
  - 예: `alt="11키 스틸 텅드럼"`
- 텅 버튼은 `aria-label`을 넣는다.
  - 예: `aria-label="낮은 솔 G3, 단축키 Ctrl+5"`
- 최근 연주음은 `aria-live="polite"` 영역에도 업데이트한다.
- 포커스 링은 명확히 보이게 한다.
- 터치 타깃은 최소 36px 이상 확보한다.
- 작은 화면에서도 하단 안내 패널이 본체를 과하게 가리지 않도록 접이식으로 만든다.
- `prefers-reduced-motion`이 켜져 있으면 bounce/ripple을 줄인다.

```css
:focus-visible {
  outline: 3px solid rgba(255,214,107,.95);
  outline-offset: 3px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: .01ms !important;
  }
}
```

---

## 15. 단계별 개발 순서 (Phase 1~8)

각 단계가 끝날 때마다 브라우저에서 직접 확인하고 다음 단계로 넘어간다.

### Phase 1 — 기본 뼈대와 9:16 화면

- `index.html` 생성
- `#app` 9:16 풀스크린 CSS 적용
- `#selectScreen`, `#playScreen` 두 화면 생성
- 화면 토글 함수 `showSelect()`, `showPlay(type)` 구현
- 데스크톱 레터박스와 모바일 세로 비율 확인

### Phase 2 — 데이터 모델 작성

- `NOTE`, `NOTES_11`, `NOTES_15`, `MAP`, `POS_11`, `POS_15`, `DRUMS` 작성
- 데이터 검증 함수 작성
  - 11키 배열 길이 11인지
  - 15키 배열 길이 15인지
  - 모든 noteId가 `NOTE`에 있는지
  - 모든 noteId의 좌표가 `positions`에 있는지

### Phase 3 — 키 입력 순수 함수와 테스트

- `digitOf()` 구현
- `resolveShortcut()` 구현
- 필수 테스트 케이스를 `console.assert()`로 작성
- `Digit`와 `Numpad` 둘 다 확인
- `Shift`, `Ctrl`, `Alt`, `Meta`, `Ctrl+Shift`, `repeat` 엣지케이스 확인

### Phase 4 — Web Audio 사운드 엔진

- `ensureAudio()` 구현
- `setVolume()` 구현
- `playNote()` 구현
- 첫 클릭/키다운에서 `ctx.resume()` 확인
- 여러 음을 빠르게 눌렀을 때 폴리포니 확인
- 낮은 음이 더 길게 울리는지 확인

### Phase 5 — 선택 화면 UI

- 11키/15키 선택 카드 구현
- 이미지가 있으면 `char-11.png`, `char-15.png` 표시
- 이미지가 없으면 fallback 아이콘 표시
- hover/focus/선택 ripple 구현
- Enter/Space로 선택 가능하게 만들기

### Phase 6 — 연주 화면 UI와 이미지 표시

- 상단 바 구현: 뒤로가기, 악기명, 볼륨
- 중앙 `.drum-stage` 구현
- `play-11.png`, `play-15.png` 원본 무왜곡 표시
- 이미지 로드 실패 시 CSS/SVG fallback 원형 텅드럼 표시
- stage aspect ratio가 실제 이미지와 맞는지 확인

### Phase 7 — 투명 텅 오버레이 연결

- `renderTongues(type)` 구현
- `positions` 좌표대로 투명 버튼 생성
- pointer/touch/click → `triggerNote(noteId)` 연결
- keyboard → `triggerNote(noteId)` 연결
- `.is-playing` 글로우 구현
- 최근 연주음 배지와 `aria-live` 구현

### Phase 8 — 마감, 검수, polish

- 하단 키 안내 패널 구현
- 매핑표 토글 구현
- 접근성 검사: 포커스 링, aria-label, aria-live
- 다양한 화면 크기에서 9:16 유지 확인
- 이미지 왜곡/잘림 없음 확인
- 볼륨 슬라이더 동작 확인
- 불필요한 콘솔 오류 제거

---

## 16. 완성 체크리스트

### 레이아웃/이미지

- [ ] 앱이 9:16 비율로 뷰포트 안에서 최대 크기로 표시된다.
- [ ] 모바일 세로 화면에서 화면이 꽉 차 보인다.
- [ ] 데스크톱/가로 화면에서 중앙 9:16 패널과 레터박스가 자연스럽다.
- [ ] 선택 화면 이미지가 왜곡 없이 표시된다.
- [ ] 연주 화면 텅드럼 이미지가 왜곡·잘림 없이 표시된다.
- [ ] 이미지가 없어도 fallback 원형 텅드럼이 표시되어 앱이 작동한다.
- [ ] 투명 텅 버튼이 이미지와 함께 자연스럽게 스케일된다.

### 연주/매핑

- [ ] 11키 선택 시 `G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5`만 재생된다.
- [ ] 15키 선택 시 `E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5`만 재생된다.
- [ ] 숫자키 `1~7`은 C4~B4를 재생한다.
- [ ] 11키에서 `Shift+1=C5`, `Shift+2/3=null`이다.
- [ ] 15키에서 `Shift+1=C5`, `Shift+2=D5`, `Shift+3=E5`이다.
- [ ] 11키에서 `Ctrl+5=G3`, `Ctrl+6=A3`, `Ctrl+7=B3`이다.
- [ ] 15키에서 `Ctrl+3=E3`, `Ctrl+4=F3`, `Ctrl+5=G3`, `Ctrl+6=A3`, `Ctrl+7=B3`이다.
- [ ] `8/9/0` 단독은 무음이다.
- [ ] `Shift+4~0`은 이번 명세에서 무음이다.
- [ ] `Ctrl+1/2/8/9/0`은 무음이다.
- [ ] `Alt`, `Meta`, `Ctrl+Shift` 조합은 무음이다.
- [ ] `Numpad1~0`도 정상 판별된다.
- [ ] 키를 꾹 누를 때 `event.repeat`로 자동 연타되지 않는다.
- [ ] 키보드/마우스/터치가 모두 같은 `triggerNote()` 경로로 동작한다.
- [ ] 매핑된 키 입력 시 브라우저 기본 동작이 방해되지 않도록 `preventDefault()`가 적용된다.

### 사운드

- [ ] 첫 사용자 입력 후 오디오가 정상 재생된다.
- [ ] 여러 음을 동시에/빠르게 눌러도 폴리포니로 울린다.
- [ ] 낮은 음은 더 길고 둥글게 울린다.
- [ ] 높은 음은 너무 날카롭지 않게 들린다.
- [ ] 볼륨 슬라이더가 즉시 반영된다.

### 접근성/품질

- [ ] 선택 카드와 텅 버튼에 포커스가 간다.
- [ ] 포커스 링이 명확하다.
- [ ] 모든 텅 버튼에 음 이름과 단축키가 포함된 `aria-label`이 있다.
- [ ] 최근 연주음이 `aria-live`로 갱신된다.
- [ ] `prefers-reduced-motion`이 반영된다.
- [ ] 순수 함수 테스트 케이스가 통과한다.
- [ ] 데이터 개수 검증이 통과한다.

---

## 17. 확장 아이디어

- 녹음/재생 기능
- 숫자악보 입력 → 자동 연주
- 동요/명상곡 연습 모드
- BPM 메트로놈
- 리버브/딜레이 토글
- 말렛/손가락 타격 모드 선택
- 실제 음원 샘플 `.wav` 교체 모드
- 악기 튜닝 프리셋: C Major, D Major, D Minor, C Pentatonic 등
- PWA 설치
- 다크 모드/수면 모드
- 키 힌트 표시/숨김
- 텅 좌표 편집 모드: 브라우저에서 텅 위치를 드래그해 좌표 JSON으로 내보내기

---

## 부록 A. 그대로 복붙하는 압축 프롬프트

```text
키보드와 마우스/터치로 연주하는 "스틸 텅드럼 웹앱"을 외부 라이브러리 없이 단일 index.html(HTML+CSS+Vanilla JS) + assets/ 이미지 폴더로 만들어줘. 사운드는 Web Audio API 합성으로 구현해줘.

[화면 흐름]
- 화면1: 11키 스틸 텅드럼 / 15키 스틸 텅드럼 선택 화면.
- 화면2: 선택한 스틸 텅드럼을 연주하는 화면.
- 선택 화면 카드는 assets/char-11.png, assets/char-15.png를 사용하고, 연주 화면 본체는 assets/play-11.png, assets/play-15.png를 사용해. 이미지가 없으면 CSS/SVG fallback 원형 텅드럼을 표시해.

[9:16 풀스크린]
- #app은 항상 9:16 비율로 뷰포트 안에서 최대 크기로 중앙 배치. 모바일은 꽉 차게, 데스크톱/가로는 중앙 9:16 패널 + 어두운 레터박스. 100dvh 사용.
- #app { width:min(100vw, calc(100dvh*9/16)); height:min(100dvh, calc(100vw*16/9)); position:relative; overflow:hidden; }
- 화면은 .screen { position:absolute; inset:0; }로 전환.

[이미지]
- 모든 이미지는 원본 무왜곡. object-fit:contain. cover 금지. 찌그러짐/잘림 금지.
- 연주 화면은 .drum-stage 안에 이미지를 표시하고, 같은 stage 위에 투명 텅 버튼을 백분율 좌표로 얹어.
- .drum-stage는 기본 aspect-ratio:1/1. 실제 사진이 정사각이 아니면 DRUMS[type].aspect만 조정 가능하게 만들어.

[튜닝]
- 11키 C Major: G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5.
- 15키 C Major: E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5.
- NOTE 객체에 freq/midi/num/ko를 넣어. E3=164.81, F3=174.61, G3=196.00, A3=220.00, B3=246.94, C4=261.63, D4=293.66, E4=329.63, F4=349.23, G4=392.00, A4=440.00, B4=493.88, C5=523.25, D5=587.33, E5=659.25.

[키 입력 규칙]
- 숫자 1~7은 계이름: 1=C, 2=D, 3=E, 4=F, 5=G, 6=A, 7=B.
- 숫자 단독: 1~7=C4~B4.
- Shift+숫자: C5 이상. 이번 앱에서는 Shift+1=C5, Shift+2=D5, Shift+3=E5. 단 선택한 악기에 없는 음은 무음(11키에서는 Shift+1만 유효, 15키에서는 Shift+1~3 유효).
- Ctrl+숫자: B3 이하. LOW는 Ctrl+3=E3, Ctrl+4=F3, Ctrl+5=G3, Ctrl+6=A3, Ctrl+7=B3. 단 선택한 악기에 없는 음은 무음(11키는 Ctrl+5~7만 유효, 15키는 Ctrl+3~7 유효).
- 8/9/0 단독 무음. Shift+4~0 무음. Ctrl+1/2/8/9/0 무음.
- 반드시 event.code(Digit1~0, Numpad1~0)로 판별. event.key 금지. Alt/Meta 또는 Ctrl+Shift는 무음. event.repeat 무시. input/textarea/select/contenteditable 포커스 시 연주하지 않음. 매핑된 유효 키에서 preventDefault.
- resolveShortcut({code,shiftKey,ctrlKey,altKey,metaKey}, "11"|"15") -> noteId|null 순수 함수로 구현하고 console.assert 테스트를 넣어.

[오버레이]
- 텅 좌표는 POS_11, POS_15 객체로 관리. 각 noteId마다 {x,y,w,h,rot}. 좌표는 .drum-stage 기준 %. 실제 이미지와 어긋나면 좌표 객체만 수정.
- renderTongues(type)는 DRUMS[type].notes를 순회해 투명 button.tongue-hit을 만들고 aria-label에 음 이름과 단축키를 넣어.
- 버튼 pointerdown과 키보드 keydown은 모두 triggerNote(noteId)를 호출.

[사운드]
- AudioContext는 1회 생성·재사용, 첫 입력에서 ctx.resume(). master gain + 볼륨 슬라이더.
- playNote(noteId, {pan}) 함수는 스틸 텅드럼 느낌으로 합성: 기본 sine + 배음(2.01, 2.98, 4.16, 5.43), 빠른 어택 0.007초, 긴 지수 감쇠 2.2~4.8초, 낮은 음일수록 길게. 짧은 noise burst로 말렛 어택 추가. 폴리포니 지원.

[UI]
- 디자인은 명상적이고 따뜻한 힐링 톤. 크림 배경 #FBF6EE, 틸 #5AA7A0, 브라운 #5A4034, 금속 실버 #DADCE3, 노란 글로우 #FFD66B.
- 선택 화면: 큰 카드 2개, hover/focus scale, ripple, 페이드 전환.
- 연주 화면: 상단 바(← 다시 선택, 악기명, 볼륨), 중앙 텅드럼, 하단 키 안내 패널, 최근 연주음 배지.
- 누른 텅은 노란 글로우+물결. 사진 자체는 변형하지 말고 오버레이만 반응.

[접근성/검수]
- button, aria-label, aria-live, focus-visible, prefers-reduced-motion 반영.
- 11키/15키 데이터 개수 검증, NOTE 존재 검증, 좌표 존재 검증, 키 매핑 테스트 통과.
- 완료 후 실행법과 체크리스트를 요약해줘.
```

---

## 부록 B. 선택: React + TypeScript 구조로 만들 경우

단일 파일 대신 유지보수성을 높이고 싶다면 아래 구조를 사용한다. 단, 본문 명세의 튜닝·키 매핑·9:16·이미지 무왜곡 규칙은 그대로 지킨다.

```text
src/
  data/tongueDrums.ts
    # NOTE, NOTES_11, NOTES_15, MAP, POS_11, POS_15, DRUMS, 타입 정의
  utils/keyboard.ts
    # digitOf, resolveShortcut, isEditableTarget
  utils/keyboard.test.ts
    # Vitest 테스트
  audio/TongueDrumAudioEngine.ts
    # ensureAudio, setVolume, playNote
  pages/SelectScreen.tsx
    # 11키/15키 선택 카드
  pages/PlayScreen.tsx
    # 선택된 텅드럼 연주 화면
  components/DrumStage.tsx
    # 원본 이미지 + 투명 오버레이
  components/TongueButton.tsx
    # 개별 텅 버튼
  components/KeyboardGuide.tsx
    # 키 안내 패널
  styles/global.css
    # 9:16 풀스크린, 테마, 접근성
public/assets/
  char-11.png
  char-15.png
  play-11.png
  play-15.png
```

### React 버전 추가 규칙

- 라우팅은 단순하게 `/`, `/play/11`, `/play/15`를 사용한다.
- URL의 type 값이 `11` 또는 `15`가 아니면 선택 화면으로 보낸다.
- `resolveShortcut()`은 React 상태에 의존하지 않는 순수 함수로 유지한다.
- `TongueDrumAudioEngine`은 싱글턴처럼 사용하고 컴포넌트 리렌더마다 새 `AudioContext`를 만들지 않는다.
- 좌표 편집이 필요할 수 있으므로 `POS_11`, `POS_15`는 별도 파일로 분리한다.

---

*이 명세대로 만들면 9:16 화면 안에서 11키·15키 스틸 텅드럼을 선택하고, 숫자키/Shift/Ctrl 조합과 터치 오버레이로 직관적으로 연주할 수 있는 웹앱이 완성됩니다.* 🎶
