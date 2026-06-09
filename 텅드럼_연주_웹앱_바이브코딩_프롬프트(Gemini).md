# 🎵 스틸 텅드럼 연주 웹앱 — 통합 바이브코딩 프롬프트

> 본 명세는 11키 및 15키 스틸 텅드럼(Steel Tongue Drum)을 키보드와 터치로 연주할 수 있는 모바일 최적화 웹앱을 단일 파일(`index.html`)로 개발하기 위한 프롬프트입니다.
> 
> **최우선 규격 2가지**
> 1. **앱이 9:16 화면 전체에 가득 차도록 할 것**
> 2. **11키·15키 텅드럼 실물 이미지를 왜곡 없이 그대로 표시하고, 그 위에 투명 원형 히트박스를 배치할 것**

---

## 0. 이미지 자산 준비 & 파일명 규칙 (매핑 엄수)

앱 개발에 앞서 `assets/` 폴더에 아래 4개의 이미지를 배치합니다. 코드에서는 반드시 아래의 영문 파일명만을 참조해야 합니다.

| 코드에서 쓸 파일명 | 용도 및 설명 |
|---|---|
| `assets/char-11.png` | **선택 화면** 11키 텅드럼 캐릭터 카드용 |
| `assets/char-15.png` | **선택 화면** 15키 텅드럼 캐릭터 카드용 |
| `assets/play-11.png` | **연주 화면** 11키 텅드럼 실물 탑뷰(Top-view) 사진 |
| `assets/play-15.png` | **연주 화면** 15키 텅드럼 실물 탑뷰(Top-view) 사진 |

> **주의:** 이 4개 이미지는 앱의 핵심 비주얼이므로 CSS로 늘리거나 찌그러뜨리지 말고(object-fit: contain), **원본 비율 그대로** 사용해야 합니다.

---

## 1. 프로젝트 개요 & 기술 스택

- **형태:** 브라우저에서 실행되는 인터랙티브 웹앱.
- **결과물:** **단일 `index.html`** (HTML + CSS + Vanilla JS) + `assets/` 이미지 폴더.
- **화면 1 (선택)**: `11키 텅드럼` / `15키 텅드럼` 선택 화면.
- **화면 2 (연주)**: 선택한 텅드럼의 **실물 사진** 위에서 원형 투명 건반(Tongue)을 클릭하거나 키보드를 눌러 연주.
- **입력 규칙(핵심)**: 숫자키=가운데 음 / `Shift`+숫자=높은음(C5 이상) / `Ctrl`+숫자=낮은음(B3 이하).
- **사운드**: Web Audio API **합성**(텅드럼 특유의 영롱하고 울림이 긴 몽환적인 사운드 구현).

---

## 2. ★ 화면/레이아웃 규격 — 9:16 풀스크린

앱은 **세로 9:16 비율의 한 화면**을 기준으로 뷰포트를 가득 채웁니다.

- 앱 루트(`#app`)는 **항상 9:16 비율**을 유지하며 화면 중앙에 최대 크기로 배치.
- 데스크톱/가로 화면에서는 9:16 패널 양옆에 명상적이고 차분한 어두운 배경(레터박스)을 둡니다.
- 모바일 100dvh 대응. 앱 내부에서 스크롤이 발생하지 않도록 `overflow: hidden`.

**레퍼런스 CSS**
```css
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; touch-action: manipulation; }
body {
  display: grid; place-items: center; min-height: 100dvh;
  background: #1A1A24; /* 데스크톱 레터박스(깊은 밤하늘 색상) */
  font-family: "Pretendard", system-ui, sans-serif;
  user-select: none;
}
#app {
  position: relative;
  width: min(100vw, calc(100dvh * 9 / 16));
  height: min(100dvh, calc(100vw * 16 / 9));
  overflow: hidden;
  background: #F4F6F8; /* 앱 내부 배경(깔끔하고 부드러운 톤) */
  box-shadow: 0 20px 60px rgba(0,0,0,.4);
}
.screen { position: absolute; inset: 0; display: flex; flex-direction: column; }
.screen[hidden] { display: none; }

```

---

## 3. ★ 텅드럼 이미지 & 원형 건반 오버레이 규격

칼림바와 달리 텅드럼 건반(Tongue)은 **중앙을 기점으로 원형으로 배치**됩니다.

* 텅드럼 실물 사진(`.drum-photo`)은 종횡비를 유지하며 무왜곡(`object-fit: contain`)으로 최대 크기로 표시됩니다.
* 사진 위에 투명한 원형/타원형 히트박스(건반)를 배치합니다.
* 화면 크기에 따라 좌표가 틀어지지 않도록, 사진 래퍼(`.drum-stage`) 안에서 **`left: X%`, `top: Y%` 절대 좌표**를 사용해 배치합니다.

**건반 데이터 구조 예시 (중요: 이 구조를 코드에 반영하세요)**

```js
// 11키 공간 좌표 매핑 예시 (추후 실물 사진에 맞춰 %값 미세 조정)
const LAYOUT_11 = [
  { note: "G3", left: 50, top: 50, size: 20 }, // 중앙(가장 낮고 큰 텅)
  { note: "A3", left: 50, top: 80, size: 14 }, // 하단
  { note: "B3", left: 20, top: 50, size: 14 }, // 좌측
  { note: "C4", left: 50, top: 20, size: 14 }, // 상단
  { note: "D4", left: 80, top: 50, size: 14 }, // 우측
  { note: "E4", left: 28, top: 72, size: 12 }, // 좌하단
  { note: "F4", left: 28, top: 28, size: 12 }, // 좌상단
  { note: "G4", left: 72, top: 28, size: 12 }, // 우상단
  { note: "A4", left: 72, top: 72, size: 12 }, // 우하단
  { note: "B4", left: 38, top: 85, size: 10 }, // 미세 위치
  { note: "C5", left: 62, top: 15, size: 10 }, // 미세 위치
];
// (15키도 중앙 F3를 중심으로 14개의 텅이 방사형으로 퍼지는 LAYOUT_15 객체 배열을 생성할 것)

```

* 히트박스(`.tongue`) 스타일: `position: absolute; transform: translate(-50%, -50%); border-radius: 50%; width: X%; aspect-ratio: 1;`. 투명하게 두되, 연주 시 부드러운 아쿠아/골드빛 **물결(Ripple) 글로우** 효과가 나야 합니다.

---

## 4. [화면 1] 선택 화면

* **상단:** "✨ 스틸 텅드럼" 타이틀과 "연주할 텅드럼을 선택하세요" 안내.
* **레이아웃:** 세로로 분할된 2개의 카드 (11키 / 15키).
* **상호작용:** `char-11.png`, `char-15.png` 카드를 누르면 부드럽게 강조되며 0.4초 후 연주 화면으로 페이드 전환(선택 상태 저장).

---

## 5. [화면 2] 연주 화면

* **상단 바:** `← 뒤로가기`, "11키 텅드럼" 텍스트, 볼륨 조절 슬라이더.
* **메인:** 텅드럼 실물 사진(`play-11.png` 또는 `play-15.png`)과 투명 건반 오버레이.
* **하단:** "숫자키=가운데 / ⇧+숫자=높은음 / ⌃+숫자=낮은음" 단축키 가이드 및 **최근 연주한 음표 배지** 표시.

---

## 6. 키보드 입력 규칙 (★ 필수 로직)

텅드럼의 특성상 낮은 음역대(Ctrl)와 기본 음역대(숫자), 높은 음역대(Shift)가 혼재합니다.
**"동일한 숫자키 = 동일한 계이름(도레미)"** 원칙을 엄격하게 적용합니다.

**[음역대 정의 - 다장조 기준]**

* **11키 음역 (11음):** G3, A3, B3, C4, D4, E4, F4, G4, A4, B4, C5
* **15키 음역 (15음):** F3, G3, A3, B3, C4, D4, E4, F4, G4, A4, B4, C5, D5, E5, F5

**[키 맵핑 테이블]**

* `숫자 1~7` 단독 (가운데): `1`=C4, `2`=D4, `3`=E4, `4`=F4, `5`=G4, `6`=A4, `7`=B4
* `Shift + 숫자 1~7` (높은음): `⇧1`=C5, `⇧2`=D5, `⇧3`=E5, `⇧4`=F5
* `Ctrl + 숫자 4~7` (낮은음): `⌃4`=F3, `⌃5`=G3, `⌃6`=A3, `⌃7`=B3

**[키 입력 순수 함수 규격]**

```js
// 반드시 event.code를 사용해 판별할 것 (event.key 금지)
const MAP = {
  MID:  {1:"C4", 2:"D4", 3:"E4", 4:"F4", 5:"G4", 6:"A4", 7:"B4"},
  HIGH: {1:"C5", 2:"D5", 3:"E5", 4:"F5"},
  LOW:  {4:"F3", 5:"G3", 6:"A3", 7:"B3"}
};

function resolveShortcut(e) {
  if (e.altKey || e.metaKey || (e.shiftKey && e.ctrlKey)) return null;
  const m = /^(?:Digit|Numpad)([0-9])$/.exec(e.code);
  if (!m) return null;
  const d = m[1];
  
  if (e.shiftKey) return MAP.HIGH[d] ?? null;
  if (e.ctrlKey)  return MAP.LOW[d] ?? null;
  return MAP.MID[d] ?? null;
}
// 매핑된 키보드 이벤트에서는 e.preventDefault()로 브라우저 기본 동작 방지. e.repeat 무시.

```

---

## 7. 사운드 엔진 (텅드럼 음색 구현)

텅드럼은 칼림바보다 어택(Attack)이 부드럽고, 배음(Overtone)이 풍부하며 서스테인(Sustain)이 매우 깁니다.

* **Oscillator 조합:** `sine` 파형을 주축으로 하되, 주파수의 `1배(기본)`, `2배`, `3배` 배음을 합쳐서 종(Bell)처럼 맑은 소리를 만듭니다.
* **Envelope (ADSR):** 어택은 약 15~20ms로 부드럽게, 디케이와 릴리즈(Release)는 **2.5초~4초**로 매우 길게 지수 감쇠(exponentialRampToValueAtTime) 시킵니다. 저음일수록 더 깁니다.
* **AudioContext:** 최초 터치/클릭 시 `resume()` 처리 필수. 폴리포니(다중 발음) 지원.

```js
// 텅드럼 음색 합성 레시피 힌트
const freqs = [
  { mult: 1.0, gain: 1.0 },   // Fundamental
  { mult: 2.0, gain: 0.5 },   // 1st Overtone
  { mult: 2.75, gain: 0.2 },  // Ethereal metallic overtone
  { mult: 3.0, gain: 0.15 } 
];
// 각 음마다 GainNode를 만들고 약 3초에 걸쳐 서서히 페이드아웃 되도록 구현

```

---

## 8. 완성 체크리스트

1. [ ] 앱이 화면 비율 9:16을 유지하며 뷰포트를 가득 채우는가? 빈 여백이 발생하지 않는가?
2. [ ] 실물 텅드럼 이미지(`play-11.png`, `play-15.png`)가 찌그러지거나 잘리지 않고 전체가 꽉 차게(`object-fit: contain`) 보이는가?
3. [ ] 투명 히트박스가 부채꼴/수직이 아닌 중앙 기준 방사형(원형)으로 % 좌표를 통해 배치되었는가? (해상도가 변해도 사진과 매핑이 어긋나지 않아야 함)
4. [ ] `1=C4`, `Shift+1=C5`, `Ctrl+5=G3` 등 "수식키+동일 숫자 = 동일 계이름" 매핑이 정확히 동작하는가?
5. [ ] 사운드가 칼림바처럼 짧게 끊기지 않고, 텅드럼 특유의 긴 울림(Sustain)을 가지는가?
6. [ ] 건반 클릭 시 텅드럼 본체 사진은 변형되지 않고, 클릭한 위치에만 부드러운 물결/글로우 시각 피드백이 표시되는가?

```

---

### 💡 프롬프트 사용 팁
1. 위 코드를 복사해서 AI(Cursor, Claude 등)에 전달하면, 한 번에 완벽한 구조의 `index.html` 코드를 짜줍니다.
2. AI가 만들어준 코드 내의 `LAYOUT_11`, `LAYOUT_15` 객체 배열의 `left`, `top` 퍼센트(%) 값만 실제 보유하신 텅드럼 사진(`play-11.png`, `play-15.png`)의 혀(Tongue) 위치에 맞게 수정해 주시면 완벽하게 매핑됩니다.

```