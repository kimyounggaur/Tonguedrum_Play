# 🪘 스틸 텅드럼 연주 웹앱 — 통합 바이브코딩 프롬프트 (FINAL · 11키/15키)

> ChatGPT·Claude·Gemini 세 프롬프트의 장점을 통합하고, **실제 업로드한 텅드럼 이미지**와 **검증된 음역**을 반영한 **결정판**입니다.
>
> - **정확한 음역 + 키 매핑 + 데이터 모델 + 순수함수 테스트 + 좌표 객체 + 스테레오 팬 + 말렛 노이즈 어택** (ChatGPT 강점)
> - **합성 임펄스 리버브 + 감쇠하며 닫히는 로우패스로 명상적 울림** (Claude 강점)
> - **"9:16 풀스크린 + 원본 이미지 무왜곡 + 원형 투명 히트박스" 최우선 규격** (Gemini 강점)
> - **자산 매핑 표 + 사진·오버레이 정렬 구조 + 단계별 개발/체크리스트 골격** (칼림바 원본 강점)
>
> **이번 요청 2가지를 최우선 규격으로 못 박았습니다.**
> 1. **앱이 9:16 화면 전체에 가득 차도록**
> 2. **11키·15키 텅드럼 원본 이미지를 왜곡 없이 그대로 표시**(그 위에 투명 원형 히트박스)
>
> **확정된 튜닝(실물 도면 + 표준 규격 교차검증):**
> - **11키 = C Major, `G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5`** (G3~C5, 11음)
> - **15키 = C Major, `E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5`** (E3~E5, 15음)
>
> **사용자 지정 입력 규칙:** `숫자키` 단독 = 가운데(C4~B4) / `Shift`+숫자 = 높은음(C5↑) / `Ctrl`+숫자 = 낮은음(B3↓).

---

## 0. 이 문서 사용법 & 이미지 자산 준비 (먼저 읽기 ★)

1. 이 마크다운 **전체를 복사**해 AI 코딩 도구(Claude, Cursor, v0, Bolt, Lovable, Replit Agent, Gemini 등)에 붙여넣습니다.
2. 다음처럼 요청합니다.
   > 위 명세대로 **단일 `index.html` + `assets/` 폴더** 구조의 11키/15키 스틸 텅드럼 연주 웹앱을 완성해줘. 외부 라이브러리 없이 HTML/CSS/Vanilla JS와 Web Audio API만 사용해줘.
3. 결과를 받은 뒤 **16번 완성 체크리스트**로 검수하고, 어긋나는 항목을 다시 수정 요청합니다.

### 이미지 자산 파일명 규칙 (★ 반드시 이 매핑대로)

한글·공백·날짜가 들어간 파일명은 배포 환경에서 경로 오류가 잦으니, 아래처럼 **단순 영문명**으로 바꿔 `assets/`에 넣고 코드에서는 영문명만 참조합니다.

| 업로드한 원본 파일 | 코드에서 쓸 파일명 | 용도 |
|---|---|---|
| `텅드럼_15키_11키_크몽_캐릭터_01.png` (분홍 캐릭터) | `assets/char-11.png` | **선택 화면** 11키 카드 |
| `텅드럼_15키_11키_크몽_캐릭터_02.png` (보라 콧수염 캐릭터) | `assets/char-15.png` | **선택 화면** 15키 카드 |
| `11키_텅드럼_미니_크몽.png` (보라 11키 도면, 숫자 표기) | `assets/play-11.png` | **연주 화면** 11키 본체 |
| `마레아_15키_텅드럼_연주_White_크몽_배경삭제.png` (마레아 15키 도면) | `assets/play-15.png` | **연주 화면** 15키 본체 |
| `텅드럼_아이콘_크몽_마레아15키_배경삭제.png` (어두운 미니 아이콘) | `assets/icon.png` (선택) | 파비콘/로딩 |

**중요 이미지 규칙**
- 이 이미지들은 **앱의 핵심 비주얼**이다. 절대 새로 그리거나 대체하지 말고 **원본 그대로** 사용한다(4번 규칙).
- ⚠️ `11음_텅드럼_도면_by_김영걸_Mini_배경삭제.png`는 내용이 **전부 검은색**이라 사용 불가 → **반드시 `11키_텅드럼_미니_크몽.png`(보라 도면)** 를 `play-11.png`로 쓴다.
- **연주용 도면(`play-11`, `play-15`)에는 이미 텅마다 숫자악보(자음보)가 인쇄**되어 있다. 그러므로 오버레이는 **투명**하게만 두고 **숫자 라벨을 중복으로 그리지 않는다**(누르면 글로우만).
- ⚠️ `play-15.png`(마레아)는 **하단에 끈/말렛**이 함께 있어 드럼 원이 이미지의 **위쪽 약 82%**에 위치한다. 두 가지 중 하나로 처리한다.
  - (권장) 드럼 원만 보이도록 **정사각형으로 크롭**해 `play-15.png`로 저장 → 10번 좌표가 그대로 맞는다.
  - (원본 유지) 원본 그대로 쓰려면 `DRUMS["15"].aspect`를 원본 비율로 두고 **10번 `calibrate()` 보정 도구**로 히트박스를 맞춘다.

---

## 1. 프로젝트 개요 & 핵심 요구사항

브라우저에서 **키보드와 마우스/터치로 스틸 텅드럼을 연주**하는 인터랙티브 웹앱을 만든다.

- **화면 1 — 선택 화면**: `11키 스틸 텅드럼` / `15키 스틸 텅드럼` 중 하나를 캐릭터 카드로 고른다.
- **화면 2 — 연주 화면**: 선택한 텅드럼 **실물 도면**이 9:16 화면에 크게 표시되고, 그 위 **투명 원형 텅**과 키보드로 연주한다.
- **입력 규칙(핵심 ★)**: `숫자키` 단독 = C4~B4 / `Shift`+숫자 = C5 이상 / `Ctrl`+숫자 = B3 이하.
- **튜닝**: 위 확정값(11키 G3~C5, 15키 E3~E5, C Major).
- **사운드**: Web Audio API **합성**. mp3 없이 동작하되 추후 샘플 교체 쉽게 구조화.
- **톤**: 명상적·힐링 분위기. 둥근 금속 질감, 부드러운 글로우, 은은한 잔향.

---

## 2. 기술 스택 & 결과물 형태

- **단일 `index.html`** (HTML + CSS + Vanilla JS, 빌드 불필요) + `assets/` 이미지 폴더.
  - 더블클릭으로 바로 실행, 배포·공유 간단, 이미지 드롭만으로 교체.
- 사운드: **Web Audio API** (`AudioContext`, `OscillatorNode`, `GainNode`, `BiquadFilterNode`, `ConvolverNode`, `StereoPannerNode`, noise buffer).
- **외부 라이브러리 금지** (React, jQuery, Tone.js, Howler.js 등). 단, 부록 B에 React+TS 구조를 선택 옵션으로 제공.
- **코드 품질 원칙**
  - 음/좌표 데이터는 `NOTE`, `NOTES_11/15`, `MAP`, `POS_11/15`, `DRUMS` 같은 **데이터 객체로 분리**(하드코딩 분산 금지).
  - 키 입력 → 음 변환은 **테스트 가능한 순수 함수** `resolveShortcut()`로.
  - 클릭·터치·키보드는 모두 동일한 `triggerNote(noteId)` 경로를 사용한다.
  - **접근성**(`role`/`aria-label`/`aria-live`/포커스 링) 반영.

---

## 3. ★ 화면/레이아웃 규격 — 9:16 풀스크린 (이번 요청 1)

앱은 **세로 9:16 비율의 한 화면**을 기준으로 하고, **뷰포트를 가득 채운다.**

- 루트(`#app`)는 **항상 9:16 비율**을 유지하며 화면에 맞춰 최대 크기로 중앙 배치.
  - 모바일 세로: 화면 전체를 채움.
  - 데스크톱/가로: 9:16 패널이 화면 높이에 맞춰 중앙에 크게, 바깥은 어두운/은은한 배경(레터박스).
- 모바일 주소창 대응으로 **`100dvh`** 사용(폴백 `100vh`).
- 화면 1·2는 `#app` 안에서 `position:absolute; inset:0;`로 **9:16를 가득** 채우고 `hidden`으로 토글. 빈 흰 여백 금지(테마 배경으로 채움).

**레퍼런스 CSS**
```css
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; touch-action: manipulation; }
body {
  display: grid; place-items: center;
  min-height: 100dvh;
  background: radial-gradient(circle at top, #1d2b30 0%, #0c1418 62%); /* 데스크톱 레터박스 */
  font-family: "Pretendard", "Apple SD Gothic Neo", system-ui, sans-serif;
  color: var(--ink);
  user-select: none;
}
#app {
  position: relative;
  width:  min(100vw, calc(100dvh * 9 / 16));
  height: min(100dvh, calc(100vw * 16 / 9));
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 12%, rgba(255,210,122,.18), transparent 34%),
    linear-gradient(180deg, #15252b 0%, var(--bg) 55%, #10202a 100%);
  box-shadow: 0 20px 60px rgba(0,0,0,.42);
  isolation: isolate;
}
.screen { position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden; }
.screen[hidden] { display: none; }
```

> 모든 폰트·간격·이미지 크기는 `#app` 크기에 비례하도록 `%`, `vmin`, `clamp()`, `cqw`, `min()/max()`로 잡아 **어떤 화면에서도 비율이 깨지지 않게** 한다.

---

## 4. ★ 이미지 무왜곡 + 원형 오버레이 정렬 (이번 요청 2)

**0번 표의 원본 이미지를 변형 없이 그대로 표시한다.**

- 모든 이미지는 **종횡비를 절대 변경하지 않는다**(가로/세로 따로 늘이기 금지).
- 표시는 **`object-fit: contain`** → 이미지가 **잘리거나 찌그러지지 않고 전체가** 보인다. (`cover`는 가장자리를 잘라내므로 금지.)
- 연주 화면 도면은 **9:16 안에서 최대한 크게** 키우되 비율 유지. 남는 공간은 테마 배경으로 채운다.
- 연주 효과(글로우/물결) 때문에 **이미지 자체가 흔들리거나 확대/변형되면 안 된다.** 반응은 오버레이에서만.

**사진 + 오버레이 정렬 방법(중요)**
도면 위에 투명 텅을 정확히 얹기 위해, **이미지와 같은 비율의 래퍼(`.drum-stage`)** 를 만들고 그 안에서 **백분율 좌표**로 히트박스를 배치한다. 래퍼가 이미지와 동일 비율이므로 화면 크기가 바뀌어도 히트박스가 이미지와 함께 정확히 스케일된다.

```css
.play-main { flex: 1 1 auto; min-height: 0; display: grid; place-items: center; padding: clamp(8px,3cqw,18px); }
.drum-stage {
  position: relative;
  width: min(96%, 64vh);
  max-width: 100%;
  aspect-ratio: 1 / 1;     /* play-11(보라)은 정사각. play-15(마레아 원본)은 DRUMS["15"].aspect로 교체 */
  margin: auto;
}
.drum-photo {              /* 원본 무왜곡 */
  width: 100%; height: 100%;
  object-fit: contain;
  display: block; user-select: none; -webkit-user-drag: none;
  filter: drop-shadow(0 18px 22px rgba(0,0,0,.30));
}
.tongue-layer { position: absolute; inset: 0; }   /* 투명 히트박스 레이어 */
.tongue-hit {
  position: absolute;
  transform: translate(-50%, -50%) rotate(var(--rot));
  width: var(--w); height: var(--h);
  border: 0; border-radius: 999px;
  background: rgba(255,255,255,.001);  /* 투명하지만 클릭/터치 가능 */
  cursor: pointer; touch-action: manipulation;
}
.tongue-hit::after {       /* 연주 글로우 + 물결 (오버레이만 반응) */
  content: ""; position: absolute; inset: 6%;
  border-radius: inherit; opacity: 0;
  background: radial-gradient(circle, rgba(255,210,122,.85), rgba(255,210,122,.16) 60%, transparent 74%);
  box-shadow: 0 0 30px rgba(255,210,122,.75);
  transition: opacity .16s ease, transform .35s ease;
}
.tongue-hit.is-playing::after { opacity: 1; transform: scale(1.18); }
.tongue-hit:focus-visible { outline: 3px solid rgba(255,210,122,.95); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce){ .tongue-hit.is-playing::after { transform:none; } }
```

> 실제 도면마다 텅 위치가 다르므로, 히트박스 좌표는 **`POS_11`/`POS_15` 한 곳에서만** 조정한다. 사진이 바뀌어도 앱 전체 코드를 고치지 말고 좌표 객체만 수정한다(10번).

---

## 5. 공통 디자인 시스템

스틸 텅드럼의 **명상·힐링·금속 공명** 느낌을 살린다. 선택 화면은 귀엽고 친근하게, 연주 화면은 차분하고 몰입감 있게.

**색상(CSS 변수)**

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#102028` | 앱 배경(딥 틸·차분) |
| `--panel` | `#173039` | 카드/패널 배경 |
| `--teal` | `#5AA7A0` | 선택 라벨/주요 버튼 |
| `--teal-dark` | `#367C76` | hover/강조 |
| `--bronze` | `#C58A3D` | **11키** 포인트(따뜻한 브론즈) |
| `--steel` | `#6FAEB8` | **15키** 포인트(쿨 스틸틸) |
| `--glow` | `#FFD27A` | 연주 하이라이트(앰버) |
| `--ink` | `#F2ECE0` | 본문 텍스트(소프트 크림) |
| `--muted` | `#9FB2B6` | 보조 텍스트 |

**스타일 원칙**: 큰 라운드(18~28px), 부드러운 확산 그림자, **잔잔한** 마이크로 인터랙션(칼림바의 톡 튀는 바운스보다 느리고 차분). 화면 전환 0.3~0.4s 페이드/슬라이드. 클릭 시 `scale(.98)`, 연주 시 앰버 글로우. `prefers-reduced-motion`이면 큰 움직임을 줄이고 opacity 변화만 남긴다.

> **두 드럼을 색으로 구분**: 11키=브론즈, 15키=스틸틸. 선택·연주 화면에서 일관 적용.

---

## 6. [화면 1] 선택 화면 — 11키 / 15키 카드

**레이아웃(9:16 세로 가득)**
- 상단: 앱 타이틀(예: "🪘 스틸 텅드럼 연주하기") + 한 줄 안내("연주할 텅드럼을 골라주세요").
- 본문: **세로로 2개의 큰 카드**(9:16 높이를 고르게 분할; 넓은 화면이면 가로 2열로 `flex-wrap`).
  - **11키 카드**: `assets/char-11.png`(무왜곡, `object-fit:contain`) + 브론즈 라벨 **"11키 스틸 텅드럼"** + 부제 "G3~C5 · C Major · 가볍게".
  - **15키 카드**: `assets/char-15.png` + 스틸틸 라벨 **"15키 스틸 텅드럼"** + 부제 "E3~E5 · C Major · 넓은 음역".

**상호작용**
- hover/focus: `translateY(-4px) scale(1.025)` + 떠오르는 그림자.
- 클릭/Enter/Space: 선택 카드 강조 → 반대 카드 흐리게(`opacity:.45`) → 클릭 지점 물결(ripple) → 0.3~0.4s 후 **연주 화면으로 페이드 전환**(선택값 `11|15` 전달).
- 접근성: 카드는 `role="button"`, `tabindex="0"`, `aria-label="11키 스틸 텅드럼 선택"`. 또렷한 포커스 링.

---

## 7. [화면 2] 연주 화면 — 도면 + 투명 원형 텅

**레이아웃(9:16 세로 가득)**
- **상단 바(슬림)**: 좌측 `← 다시 선택`(화면 1 복귀), 가운데 악기명("11키 스틸 텅드럼"), 우측 **볼륨 슬라이더**.
- **메인(가장 크게)**: `.drum-stage` 안에 선택된 도면(`play-11.png`/`play-15.png`)을 **무왜곡·최대 크기**(4번)로 표시하고, 그 위 `.tongue-layer`에 **투명 텅 N개**를 배치.
- **하단(접이식 가능)**: **키 안내 패널** — "숫자=가운데 · ⇧+숫자=높은음 · ⌃+숫자=낮은음" 요약 + 매핑 표 토글. **최근 연주음 배지**(예: "도 · C4 · 1") 잠깐 표시.

**오버레이 렌더링 규칙**
- `DRUMS[type].notes`의 모든 음에 대해 `POS[type][noteId]` 좌표로 투명 `<button>`을 만든다(아래 코드).
- 도면에 이미 숫자가 인쇄되어 있으므로 **버튼은 투명**(hover/focus 시 옅은 윤곽만 허용). 누르면 `.is-playing`으로 **앰버 글로우+물결**을 잠깐 표시.
- **도면 이미지는 절대 흔들거나 확대하지 않는다.** 연주 효과는 오버레이에서만.
- 접근성: 각 버튼 `aria-label="<계이름>, <음명>, 단축키 <키표시>"`(예: "낮은 솔, G3, 단축키 Ctrl+5"). 마우스·터치·키보드 모두 같은 `triggerNote(noteId)`.

```js
function renderTongues(type){
  const cfg = DRUMS[type];
  const layer = document.querySelector(".tongue-layer");
  layer.innerHTML = "";
  cfg.notes.forEach(noteId => {
    const p = POS[type][noteId]; if (!p) return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "tongue-hit"; btn.dataset.note = noteId;
    btn.style.left = `${p.x}%`; btn.style.top = `${p.y}%`;
    btn.style.setProperty("--w", `${p.w}%`);
    btn.style.setProperty("--h", `${p.h}%`);
    btn.style.setProperty("--rot", p.rot || "0deg");
    btn.setAttribute("aria-label", `${labelOf(noteId)}, 단축키 ${shortcutLabelOf(noteId, type)}`);
    btn.addEventListener("pointerdown", ev => { ev.preventDefault(); triggerNote(noteId); });
    layer.appendChild(btn);
  });
}
```

> 텅 개수는 드럼 종류와 일치해야 한다(11키=11, 15키=15). **키보드 연주가 1차 수단**이며 어떤 경우에도 정확히 동작해야 한다. 히트박스가 도면의 실제 텅과 픽셀 단위로 완벽 정합하지 않아도 된다(10번 보정).

---

## 8. 키보드 입력 규칙 (핵심 ★)

세 음역을 **수식키**로 구분한다.

| 입력 | 음역 | 예시 |
|---|---|---|
| `숫자키` 단독 | 가운데 C4~B4 | `1`=C4, `5`=G4, `7`=B4 |
| `Shift`+숫자 | 높은음 C5 이상 | `⇧1`=C5, `⇧2`=D5, `⇧3`=E5 |
| `Ctrl`+숫자 | 낮은음 B3 이하 | `⌃3`=E3, `⌃5`=G3, `⌃7`=B3 |

**설계 원칙 — "같은 숫자키 = 같은 계이름(도레미), 수식키 = 옥타브"**
> 1~7 = 도·레·미·파·솔·라·시(C·D·E·F·G·A·B). 수식키가 옥타브를 결정: 단독=가운데, `Shift`=위, `Ctrl`=아래.
> 예) **5번 키 = 항상 '솔'** → `Ctrl+5=G3`, `5=G4`, `Shift+5`(=G5)는 두 드럼에 없으므로 무음.
> **선택한 악기에 실제로 있는 음만 소리난다.** 없는 음 조합은 무음.

**모델별 유효 키**

#### 11키 (`G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5`)
| 입력 | 음 | | 입력 | 음 |
|---|---|---|---|---|
| `1`~`7` | C4~B4 | | `⇧1` | C5 |
| `⌃5` | G3 | | `⌃6` | A3 |
| `⌃7` | B3 | | | |

- `⇧2`,`⇧3`(D5/E5)·`⌃3`,`⌃4`(E3/F3)는 11키에 없으므로 **무음**. `8/9/0` 단독 무음.

#### 15키 (`E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5`)
| 입력 | 음 | | 입력 | 음 |
|---|---|---|---|---|
| `1`~`7` | C4~B4 | | `⇧1`/`⇧2`/`⇧3` | C5/D5/E5 |
| `⌃3` | E3 | | `⌃4` | F3 |
| `⌃5` | G3 | | `⌃6` | A3 |
| `⌃7` | B3 | | | |

- `⇧4~0`·`⌃1`/`⌃2`/`⌃8~0`·`8/9/0` 단독은 **무음**.

---

## 9. 음 데이터 (11키 / 15키)

> **C Major 기준.** 가운데(가장 큰 텅, 도면 중앙)가 가장 낮은 음, 바깥/위로 갈수록 높아짐.

**음 배열**
```js
// 11키 C Major: G3~C5 (11음)
const NOTES_11 = ["G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5"];

// 15키 C Major: E3~E5 (15음)  ※ 11키 음역에 저음 2개(E3 F3)와 고음 2개(D5 E5)를 더한 구조
const NOTES_15 = ["E3","F3","G3","A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"];
```

**주파수 · 숫자악보(자음보) · 한글 계이름 — 공통 음표 테이블**
```js
const NOTE = {
  // noteId: { freq, midi, num(자음보: .숫자=낮은옥타브, 숫자'=높은옥타브), ko }
  E3:{ freq:164.81, midi:52, num:".3", ko:"낮은 미" },
  F3:{ freq:174.61, midi:53, num:".4", ko:"낮은 파" },
  G3:{ freq:196.00, midi:55, num:".5", ko:"낮은 솔" },
  A3:{ freq:220.00, midi:57, num:".6", ko:"낮은 라" },
  B3:{ freq:246.94, midi:59, num:".7", ko:"낮은 시" },
  C4:{ freq:261.63, midi:60, num:"1",  ko:"도" },
  D4:{ freq:293.66, midi:62, num:"2",  ko:"레" },
  E4:{ freq:329.63, midi:64, num:"3",  ko:"미" },
  F4:{ freq:349.23, midi:65, num:"4",  ko:"파" },
  G4:{ freq:392.00, midi:67, num:"5",  ko:"솔" },
  A4:{ freq:440.00, midi:69, num:"6",  ko:"라" },
  B4:{ freq:493.88, midi:71, num:"7",  ko:"시" },
  C5:{ freq:523.25, midi:72, num:"1'", ko:"높은 도" },
  D5:{ freq:587.33, midi:74, num:"2'", ko:"높은 레" },
  E5:{ freq:659.25, midi:76, num:"3'", ko:"높은 미" }
};
const freqFromMidi = m => 440 * Math.pow(2, (m - 69) / 12);
```

---

## 10. 텅드럼 데이터 모델 & 텅 좌표 (실측 기반 시작값)

스틸 텅드럼은 도면마다 텅 위치가 다르므로 아래 좌표는 **시작값**이다. 실제 이미지와 어긋나면 `POS_11`/`POS_15`만 수정한다(또는 `calibrate()` 사용).

**데이터 모델**
```js
const MAP = {
  MID:  { 1:"C4", 2:"D4", 3:"E4", 4:"F4", 5:"G4", 6:"A4", 7:"B4" }, // 숫자 단독
  HIGH: { 1:"C5", 2:"D5", 3:"E5" },                                // Shift
  LOW:  { 3:"E3", 4:"F3", 5:"G3", 6:"A3", 7:"B3" }                 // Ctrl
};

const POS = { "11": POS_11, "15": POS_15 };

const DRUMS = {
  "11": { type:"11", name:"11키 스틸 텅드럼", range:"G3~C5", scale:"C Major",
          charImage:"assets/char-11.png", playImage:"assets/play-11.png",
          accent:"var(--bronze)", aspect:"1 / 1", notes:NOTES_11 },
  "15": { type:"15", name:"15키 스틸 텅드럼", range:"E3~E5", scale:"C Major",
          charImage:"assets/char-15.png", playImage:"assets/play-15.png",
          accent:"var(--steel)",
          // 마레아 원본(끈 포함)을 그대로 쓰면 세로가 길다 → 원본 비율로 교체.
          // 드럼만 정사각으로 크롭했다면 "1 / 1" 로 둔다.
          aspect:"1 / 1", notes:NOTES_15 }
};
```

**11키 텅 좌표 — 보라 도면(`play-11.png`) 실측 시작값**
좌표 의미: `x`,`y` = `.drum-stage` 기준 텅 중심 %, `w`,`h` = 히트박스 크기 %, `rot` = 방사 회전. 가운데 G3가 가장 큰 텅.
```js
const POS_11 = {
  G3: { x:50.0, y:48.0, w:20.0, h:22.0, rot:'0deg'   }, // 중앙(가장 낮음·가장 큼)
  A3: { x:50.0, y:84.0, w:14.6, h:20.7, rot:'180deg' },
  B3: { x:30.0, y:77.5, w:14.3, h:20.4, rot:'216deg' },
  C4: { x:30.0, y:22.5, w:14.1, h:20.3, rot:'324deg' },
  D4: { x:70.0, y:22.5, w:13.8, h:20.0, rot:'36deg'  },
  E4: { x:17.7, y:39.5, w:13.4, h:19.7, rot:'288deg' },
  F4: { x:82.3, y:39.5, w:13.2, h:19.5, rot:'72deg'  },
  G4: { x:17.7, y:60.5, w:12.9, h:19.2, rot:'252deg' },
  A4: { x:82.3, y:60.5, w:12.5, h:18.9, rot:'108deg' },
  B4: { x:50.0, y:16.0, w:12.2, h:18.6, rot:'0deg'   },
  C5: { x:70.0, y:77.5, w:12.0, h:18.5, rot:'144deg' }
};
```

**15키 텅 좌표 — 마레아 도면(`play-15.png`) 실측 시작값**
가운데 E3가 가장 큰 텅. (마레아 원본을 정사각 크롭한 기준. 끈 포함 원본이면 모든 `y`를 약 −6%, 또는 `calibrate()`로 보정.)
```js
const POS_15 = {
  E3: { x:50.0, y:48.0, w:20.0, h:22.0, rot:'0deg'   }, // 중앙(가장 낮음·가장 큼)
  F3: { x:50.0, y:84.0, w:14.9, h:20.9, rot:'180deg' },
  G3: { x:23.4, y:71.2, w:14.6, h:20.7, rot:'231deg' },
  A3: { x:76.6, y:71.2, w:14.4, h:20.5, rot:'129deg' },
  B3: { x:16.9, y:57.6, w:14.1, h:20.3, rot:'257deg' },
  C4: { x:83.1, y:42.4, w:14.0, h:20.2, rot:'77deg'  },
  D4: { x:35.2, y:19.4, w:13.8, h:20.0, rot:'334deg' },
  E4: { x:64.8, y:19.4, w:13.5, h:19.8, rot:'26deg'  },
  F4: { x:64.8, y:80.6, w:13.4, h:19.6, rot:'154deg' },
  G4: { x:35.2, y:80.6, w:13.1, h:19.4, rot:'206deg' },
  A4: { x:83.1, y:57.6, w:12.9, h:19.2, rot:'103deg' },
  B4: { x:16.9, y:42.4, w:12.6, h:19.0, rot:'283deg' },
  C5: { x:76.6, y:28.8, w:12.5, h:18.9, rot:'51deg'  },
  D5: { x:23.4, y:28.8, w:12.2, h:18.7, rot:'309deg' },
  E5: { x:50.0, y:16.0, w:12.0, h:18.5, rot:'0deg'   }
};
```

> 위 좌표는 도면의 **중앙=최저음, 둘레=시계방향으로 상승**하는 실제 배열을 반영한 **시작점**이다. 도면의 인쇄된 숫자(자음보)와 비교해 어긋난 텅만 `x`,`y`를 미세조정한다.

**좌표 보정 도구 `calibrate()` (개발 편의, 선택)**
연주 화면에서 `?calibrate=1`이면 활성화. 도면 위를 클릭하면 해당 지점의 `x%`,`y%`를 콘솔에 출력해 좌표를 빠르게 맞춘다.
```js
function enableCalibrate(){
  const stage = document.querySelector(".drum-stage");
  stage.addEventListener("click", e => {
    const r = stage.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
    const y = ((e.clientY - r.top ) / r.height * 100).toFixed(1);
    console.log(`{ x:${x}, y:${y}, w:13, h:19, rot:'0deg' },`);
  });
}
if (new URLSearchParams(location.search).get("calibrate")) enableCalibrate();
```

---

## 11. 키 입력 처리 로직 (순수 함수 + 엣지케이스 + 테스트)

**반드시 지킬 규칙**
1. **`event.code` 사용**(`event.key` 금지). `Shift+1`은 일부 키보드에서 `key`가 `"!"`로 바뀌어 숫자 판별이 깨진다. **`Digit1~0`과 `Numpad1~0` 둘 다** 지원.
2. **`Alt` 또는 `Meta`(⌘)** 가 눌리면 → 무음(OS/브라우저 단축키 충돌 방지).
3. **`Ctrl`+`Shift` 동시** → 무음.
4. **`event.repeat`(꾹 누름) 무시.** 단, 같은 키를 손으로 빠르게 여러 번 누르면 매번 재생.
5. 매핑된 **유효 키에서만 `event.preventDefault()`** 호출(Ctrl+숫자로 탭 전환·저장 차단).
6. 포커스가 `input/textarea/select/[contenteditable]` 안이면 연주하지 않음.
7. `resolveShortcut()`은 **선택된 악기의 `notes`에 실제로 존재하는 음만** 반환한다.

**순수 함수 레퍼런스 구현**
```js
function digitOf(code){
  const m = /^(?:Digit|Numpad)([0-9])$/.exec(code);
  return m ? m[1] : null;               // "0".."9" | null
}
function isEditableTarget(t){
  return !!(t instanceof Element && t.closest('input, textarea, select, [contenteditable="true"]'));
}
function resolveShortcut(e, type){
  if (e.altKey || e.metaKey) return null;
  if (e.shiftKey && e.ctrlKey) return null;
  const d = digitOf(e.code); if (d === null) return null;
  let note = e.shiftKey ? MAP.HIGH[d] : e.ctrlKey ? MAP.LOW[d] : MAP.MID[d];
  if (!note) return null;
  return DRUMS[type].notes.includes(note) ? note : null;   // 악기에 없는 음은 무음
}
```

**전역 keydown**
```js
addEventListener("keydown", e => {
  if (e.repeat || isEditableTarget(e.target) || !state.currentType) return;
  const note = resolveShortcut(e, state.currentType);
  if (!note) return;
  e.preventDefault();
  triggerNote(note);
});
```

**필수 테스트 케이스 (`console.assert`)**
```js
const M=(code,mods,t)=>resolveShortcut({code,shiftKey:!!mods.s,ctrlKey:!!mods.c,altKey:!!mods.a,metaKey:!!mods.m},t);
console.assert(M("Digit1",{},"11")==="C4");
console.assert(M("Digit7",{},"15")==="B4");
console.assert(M("Digit8",{},"15")===null);
console.assert(M("Digit1",{s:1},"11")==="C5");
console.assert(M("Digit2",{s:1},"11")===null);   // 11키에 D5 없음
console.assert(M("Digit2",{s:1},"15")==="D5");
console.assert(M("Digit3",{s:1},"15")==="E5");
console.assert(M("Digit4",{s:1},"15")===null);   // F5 없음
console.assert(M("Digit5",{c:1},"11")==="G3");
console.assert(M("Digit3",{c:1},"11")===null);   // 11키에 E3 없음
console.assert(M("Digit3",{c:1},"15")==="E3");
console.assert(M("Digit4",{c:1},"15")==="F3");
console.assert(M("Digit7",{c:1},"15")==="B3");
console.assert(M("Digit4",{s:1,c:1},"15")===null);
console.assert(M("Digit1",{a:1},"15")===null);
console.assert(M("Digit1",{m:1},"15")===null);
console.assert(M("Numpad1",{},"11")==="C4");
console.assert(NOTES_11.length===11 && NOTES_15.length===15);
console.assert(NOTES_11.every(n=>NOTE[n]) && NOTES_15.every(n=>NOTE[n]));
console.assert(NOTES_11.every(n=>POS_11[n]) && NOTES_15.every(n=>POS_15[n]));
```

---

## 12. 사운드 엔진 — Web Audio 합성 (텅드럼 음색)

**목표 음색**: 칼림바보다 **둥근 어택 + 매우 긴 공명**, 약한 **비배음(metallic)** 배음, 낮을수록 더 길게. 종(bell)과 마림바 사이의 따뜻하고 명상적인 소리. **폴리포니**. 소리는 자연 감쇠(끊지 않음).

**필수 구조**
- `AudioContext`는 1회 생성·재사용. **첫 사용자 입력에서 `resume()`**.
- **마스터 게인 + 볼륨 슬라이더(0~1)**. 텅 위치에 따른 **스테레오 팬**.
- 음 = 기본음 + 약한 비배음 파셜 + **말렛 노이즈 어택** + **감쇠하며 닫히는 로우패스**.
- (권장) **합성 임펄스 리버브(ConvolverNode)** 로 은은한 잔향(meditative bloom). mp3 불필요.
- 추후 샘플 교체 쉽게: 외부에서는 항상 `playNote(noteId, opts)`만 호출.

**레퍼런스 구현**
```js
let ctx=null, master=null;
function ensureAudio(){
  if(!ctx){
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.82; master.connect(ctx.destination);
    // 명상적 잔향(합성 임펄스 리버브)
    const conv = ctx.createConvolver(); conv.buffer = makeIR(ctx, 2.8, 2.2);
    const wet = ctx.createGain(); wet.gain.value = 0.22;        // 잔향 양 0~0.4 권장
    master.connect(wet); wet.connect(conv); conv.connect(ctx.destination);
  }
  if(ctx.state === "suspended") ctx.resume();                   // ★ autoplay 해제
}
function makeIR(ctx, sec, decay){
  const rate=ctx.sampleRate, len=Math.max(1,Math.floor(rate*sec));
  const buf=ctx.createBuffer(2,len,rate);
  for(let ch=0;ch<2;ch++){ const d=buf.getChannelData(ch);
    for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len, decay); }
  return buf;
}
function setVolume(v){ ensureAudio(); master.gain.setTargetAtTime(Math.max(0,Math.min(1,+v)), ctx.currentTime, 0.015); }

function makeNoiseBurst(now, dest, amt=0.022){   // 부드러운 말렛 어택
  const dur=0.045, n=Math.max(1,Math.floor(ctx.sampleRate*dur));
  const buf=ctx.createBuffer(1,n,ctx.sampleRate); const d=buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i]=Math.random()*2-1;
  const src=ctx.createBufferSource(); src.buffer=buf;
  const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=900;
  const g=ctx.createGain(); g.gain.setValueAtTime(amt,now); g.gain.exponentialRampToValueAtTime(0.0001, now+dur);
  src.connect(hp).connect(g).connect(dest); src.start(now); src.stop(now+dur+0.01);
}

function playNote(noteId, opts={}){
  ensureAudio();
  const info = NOTE[noteId]; if(!info) return;
  const now = ctx.currentTime, f = info.freq, midi = info.midi;
  const decay = Math.max(2.2, 4.8 - (midi - 52) * 0.08);       // 낮을수록 길게(약 2.2~4.8s)

  const voice = ctx.createGain();
  voice.gain.setValueAtTime(0.0001, now);
  voice.gain.exponentialRampToValueAtTime(0.85, now + 0.009);  // 둥근 어택(~9ms)
  voice.gain.exponentialRampToValueAtTime(0.0001, now + decay);// 긴 지수 감쇠

  // 감쇠하며 닫히는 로우패스(부드러운 메탈 쉬머)
  const lp = ctx.createBiquadFilter(); lp.type="lowpass"; lp.Q.value=0.7;
  lp.frequency.setValueAtTime(Math.min(7000, f*8), now);
  lp.frequency.exponentialRampToValueAtTime(Math.max(420, f*2.2), now + decay);

  // 텅 위치 기반 스테레오 팬
  let out = lp;
  if(ctx.createStereoPanner && typeof opts.pan === "number"){
    const pan = ctx.createStereoPanner();
    pan.pan.value = Math.max(-0.5, Math.min(0.5, opts.pan));
    lp.connect(pan); out = pan;
  }
  out.connect(master);

  // 종/금속 느낌의 약한 비배음 파셜
  [[1.00,1.00],[2.01,0.40],[2.98,0.20],[4.16,0.10],[5.43,0.05]].forEach(([mul,g],i)=>{
    const o = ctx.createOscillator(); o.type = i===0 ? "sine" : "triangle";
    o.frequency.value = f*mul; if(i>0) o.detune.value = i*1.5;
    const og = ctx.createGain(); og.gain.setValueAtTime(g, now);
    og.gain.exponentialRampToValueAtTime(0.0001, now + decay*(i===0?1:0.7));
    o.connect(og).connect(voice); o.start(now); o.stop(now + decay + 0.08);
  });
  voice.connect(lp);
  makeNoiseBurst(now, voice);
}
```
> 더 사실적인 소리는 음별 샘플(.wav/.mp3) 로드로 `playNote`만 갈아끼우면 되도록 분리한다.

---

## 13. 상호작용 & 시각 효과

**공통 트리거 함수 — 키보드·마우스·터치 모두 동일 경로**
```js
function triggerNote(noteId){
  const type = state.currentType;
  const p = POS[type][noteId];
  const pan = p ? (p.x - 50) / 50 : 0;   // 왼쪽 텅은 왼쪽, 오른쪽 텅은 오른쪽에서 들리도록
  playNote(noteId, { pan });
  flashTongue(noteId);
  showRecentNote(noteId);
  updateAriaLive(noteId);
}
function flashTongue(noteId){
  const el = document.querySelector(`.tongue-hit[data-note="${noteId}"]`);
  if(!el) return;
  el.classList.remove("is-playing"); void el.offsetWidth;  // 애니메이션 재시작
  el.classList.add("is-playing");
  setTimeout(()=>el.classList.remove("is-playing"), 240);
}
function labelOf(noteId){ const n=NOTE[noteId]; return n ? `${n.ko} (${noteId}, ${n.num})` : noteId; }
```

- **연주 피드백**: 해당 텅에 `.is-playing`(앰버 글로우 + 부드러운 물결) 약 0.24s. **도면 이미지는 변형 금지**(오버레이만 반응).
- `keydown`에서 소리+효과, 시각 효과는 타이머/`keyup`으로 해제. **소리는 끊지 않고 자연 감쇠**.
- **최근 연주음 배지**(예: "낮은 솔 · G3 · .5")를 1초 정도 표시 후 페이드아웃.
- (접근성) 별도 `aria-live="polite"` 영역에 최근 음 이름을 갱신.
- 움직임은 **잔잔하게**. `prefers-reduced-motion`이면 글로우만 켜고 물결/스케일은 생략.

---

## 14. 접근성 & 반응형

- 모든 카드·텅은 키보드 포커스 가능 + 또렷한 포커스 링. 실제 `<button>` 우선.
- 이미지 `alt`(예: `alt="11키 스틸 텅드럼"`), 텅 `aria-label`(계이름+음명+단축키), `aria-live`로 최근 음.
- 터치 타깃 최소 36px 확보. 작은 화면에서 하단 안내 패널은 접이식으로 본체를 가리지 않게.
- 가로/세로·다양한 해상도에서 **9:16 비율 + 도면 무왜곡** 유지.

```css
:focus-visible { outline: 3px solid rgba(255,210,122,.95); outline-offset: 3px; }
.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
@media (prefers-reduced-motion: reduce){ *,*::before,*::after{ animation-duration:.01ms!important; transition-duration:.01ms!important; } }
```

---

## 15. 단계별 개발 순서 (Phase 1~8)

각 단계가 끝날 때마다 브라우저에서 직접 확인하고 다음으로 넘어간다.

1. **뼈대 & 9:16 화면**: `index.html` + `#app`(9:16, 3번 CSS) + `#selectScreen`/`#playScreen` 토글(`showSelect()`, `showPlay(type)`) + `← 다시 선택`. 데스크톱 레터박스·모바일 풀 확인.
2. **데이터 모델**: `NOTE`, `NOTES_11/15`, `MAP`, `POS_11/15`, `DRUMS`(9·10번). 11키 11개·15키 15개, `NOTE`/`POS` 존재 검증.
3. **키 입력 순수함수 + 테스트**: `digitOf`, `isEditableTarget`, `resolveShortcut`(11번) + `console.assert` 전부 통과.
4. **사운드 엔진**: `ensureAudio`/`setVolume`/`playNote`(+리버브·노이즈·팬, 12번). 첫 입력 `resume`, 폴리포니, 낮은 음이 더 길게 울리는지 확인.
5. **선택 화면**: `char-11/15.png` 무왜곡 카드 + 라벨/부제 + hover/ripple/페이드 전환(6번).
6. **연주 화면 + 이미지**: 상단 바(뒤로/악기명/볼륨) + `.drum-stage`에 `play-11/15.png` **원본 무왜곡 최대 표시**(4번). `aspect`가 실제 이미지와 맞는지 확인.
7. **투명 텅 오버레이**: `renderTongues(type)`로 `POS` 좌표 투명 버튼 생성 → pointer/터치/키보드 모두 `triggerNote()` → `.is-playing` 글로우 + 최근음 배지 + `aria-live`. (필요 시 `?calibrate=1`로 좌표 미세조정.)
8. **마감·검수**: 키 안내 패널/매핑표 토글, 접근성(포커스/aria), `prefers-reduced-motion`, 다양한 화면에서 9:16·무왜곡 확인, 콘솔 오류 제거.

---

## 16. 완성 체크리스트

**레이아웃 / 이미지 (이번 요청 핵심)**
- [ ] 앱이 **9:16 비율**로 뷰포트를 가득 채운다(모바일 풀, 데스크톱 중앙 레터박스). 빈 흰 여백 없음.
- [ ] 선택 화면 캐릭터 이미지가 **왜곡 없이**(contain) 표시된다.
- [ ] 연주 화면 11키·15키 도면이 **왜곡·잘림 없이** 9:16 안에서 **최대 크기**로 표시된다.
- [ ] 투명 텅이 도면과 함께 정확히 스케일된다(화면 크기 바뀌어도 어긋나지 않음).
- [ ] 도면 위 인쇄된 숫자와 히트박스 위치가 대체로 일치한다(`POS`/`calibrate`로 맞춤).

**연주 / 매핑**
- [ ] 11키 선택 시 `G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5`만, 15키 선택 시 `E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5`만 재생된다.
- [ ] `1~7`→C4~B4, `⇧1~3`→C5~E5(15키), 11키는 `⇧1`만(C5). `⌃3~7`→E3~B3(15키), 11키는 `⌃5~7`만(G3~B3).
- [ ] `같은 숫자=같은 계이름`(`⌃5=G3, 5=G4`).
- [ ] `8/9/0` 단독·악기에 없는 `Shift`/`Ctrl` 조합·`Ctrl+Shift`·`Alt`·`Meta` 무음. `Numpad`도 동작.
- [ ] 키 꾹 눌러도 연타 안 됨, 빠른 반복은 매번 재생. `Ctrl+숫자`로 브라우저 탭 안 바뀜.
- [ ] 키보드·마우스·터치 모두 같은 `triggerNote()`. 폴리포니. 첫 입력에서 정상 발음(resume).
- [ ] 누른 텅 즉시 글로우/물결 + 최근음 배지. 도면 본체는 변형되지 않음.

**사운드 / 품질**
- [ ] 칼림바처럼 짧게 끊기지 않고 텅드럼 특유의 **긴 울림(서스테인)** + 둥근 어택 + 은은한 잔향(리버브).
- [ ] 낮은 음이 더 길고 둥글게, 높은 음은 너무 날카롭지 않게. 볼륨 슬라이더 즉시 반영.
- [ ] 순수함수 테스트·데이터 개수/존재 검증 통과. 포커스 링/`aria-label`/`aria-live`/`prefers-reduced-motion` 반영.

---

## 17. 확장 아이디어

녹음/재생, 숫자악보 입력→자동 연주, 동요·명상곡 연습 모드(반짝반짝 작은별 등), 리버브/딜레이 양 슬라이더, 메트로놈, 말렛/손가락 타격 모드, 실물 mp3 샘플 교체, 다른 스케일(D Major·D Minor·아케보노·펜타토닉) 프리셋, 숫자악보 라벨 표시 토글, **텅 좌표 편집 모드(`calibrate` 확장: 드래그로 위치 조정 후 JSON 내보내기)**, PWA 설치, 다크/수면 모드.

---

## 부록 A. 그대로 복붙하는 압축 프롬프트

```text
키보드와 마우스/터치로 연주하는 "스틸 텅드럼 웹앱"을 외부 라이브러리 없이 단일 index.html(HTML+CSS+Vanilla JS) + assets/ 이미지 폴더로 만들어줘. 사운드는 Web Audio API 합성.

[화면 흐름]
- 화면1(선택): 11키/15키 스틸 텅드럼 카드 2개. assets/char-11.png(분홍 캐릭터), assets/char-15.png(보라 캐릭터) 사용. hover 확대, 클릭 ripple, 0.3~0.4s 페이드 전환으로 선택값(11|15) 전달.
- 화면2(연주): 선택한 드럼 도면을 표시. assets/play-11.png(보라 11키 도면), assets/play-15.png(마레아 15키 도면) 사용. 상단 바(← 다시 선택 / 악기명 / 볼륨), 하단 키 안내 + 최근음 배지.

[★ 9:16 풀스크린]
- #app은 항상 9:16 비율로 뷰포트 안에서 최대 크기 중앙 배치. 모바일은 꽉 차게, 데스크톱/가로는 중앙 9:16 패널 + 어두운 레터박스. 100dvh, overflow:hidden, 빈 흰 여백 금지(테마 배경).
- #app { width:min(100vw, calc(100dvh*9/16)); height:min(100dvh, calc(100vw*16/9)); position:relative; overflow:hidden; }
- .screen { position:absolute; inset:0; } 로 전환.

[★ 이미지 원본 무왜곡]
- 모든 이미지 종횡비 유지 + object-fit:contain (cover 금지, 찌그러짐/잘림 금지). 도면은 9:16 안에서 최대 크기. 남는 공간은 테마 배경.
- 연주 화면: 이미지와 같은 비율의 .drum-stage 안에 도면을 깔고, 그 위 .tongue-layer(position:absolute; inset:0)에 투명 원형 버튼(텅)을 백분율 좌표로 얹어. 도면엔 이미 숫자가 인쇄돼 있으니 라벨 중복 금지, 누르면 앰버 글로우+물결만. 도면 자체는 변형 금지.
- 마레아 15키 원본은 하단에 끈이 있어 세로가 길다 → 드럼만 정사각 크롭 권장(아니면 DRUMS["15"].aspect를 원본비로 두고 좌표 보정).

[튜닝 — C Major]
- 11키(11음): G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5  (중앙 G3가 최저·가장 큰 텅)
- 15키(15음): E3 F3 G3 A3 B3 C4 D4 E4 F4 G4 A4 B4 C5 D5 E5  (중앙 E3가 최저)
- NOTE 객체에 freq/midi/num(자음보)/ko(한글계이름). 주파수: E3=164.81,F3=174.61,G3=196.00,A3=220.00,B3=246.94,C4=261.63,D4=293.66,E4=329.63,F4=349.23,G4=392.00,A4=440.00,B4=493.88,C5=523.25,D5=587.33,E5=659.25. (freq=440*2^((midi-69)/12))

[키 입력 규칙 — 핵심]
- 숫자 1~7 = 계이름(1=도C,2=레D,3=미E,4=파F,5=솔G,6=라A,7=시B). 수식키=옥타브. 같은 숫자=같은 계이름.
- 단독: 1~7=C4~B4 / Shift: 1=C5,2=D5,3=E5 / Ctrl: 3=E3,4=F3,5=G3,6=A3,7=B3.
- 선택한 악기에 실제 있는 음만 소리(11키: ⇧1만, ⌃5~7만 / 15키: ⇧1~3, ⌃3~7). 그 외 무음. 8/9/0 단독 무음.
- 반드시 event.code(Digit1~0 + Numpad1~0)와 shiftKey/ctrlKey로 판별(Shift+1은 key가 "!"). Alt/Meta 또는 Ctrl+Shift 동시 → 무음. event.repeat 무시. 매핑된 유효 키만 preventDefault. input/textarea 포커스 시 연주 안 함.
- 순수함수 resolveShortcut({code,shiftKey,ctrlKey,altKey,metaKey}, "11"|"15") -> noteId|null. DRUMS[type].notes.includes로 필터. console.assert 테스트 포함: Digit1→C4, Digit8→null, Shift+Digit1(11)→C5, Shift+Digit2(11)→null, Shift+Digit3(15)→E5, Ctrl+Digit5(11)→G3, Ctrl+Digit3(11)→null, Ctrl+Digit3(15)→E3, Ctrl+Shift+Digit4→null, Alt/Meta+Digit1→null, Numpad1→C4.

[텅 좌표]
- POS_11, POS_15 객체로 텅마다 {x,y,w,h,rot}(.drum-stage 기준 %). 중앙=최저음=가장 큰 텅, 둘레는 시계방향으로 상승. renderTongues(type)가 투명 button.tongue-hit 생성, aria-label에 계이름+음명+단축키. pointerdown과 keydown 모두 triggerNote(noteId) 호출. 실제 도면과 어긋나면 좌표만 수정(또는 ?calibrate=1로 클릭→좌표 출력).

[사운드 — 텅드럼 음색]
- AudioContext 1회 생성·재사용, 첫 입력 resume(). master gain + 볼륨(0~1) + 텅 위치 기반 StereoPanner.
- playNote: 기본 sine + 약한 비배음 파셜(2.01,2.98,4.16,5.43, 상위는 triangle), 둥근 어택(~9ms) + 긴 지수 감쇠(낮을수록 길게 2.2~4.8s), 감쇠하며 닫히는 lowpass, 짧은 highpass 노이즈 버스트로 말렛 어택. 폴리포니, 소리는 끊지 말고 자연 감쇠. 합성 임펄스(노이즈*decay)로 ConvolverNode 리버브(wet~0.22)로 명상적 잔향.

[상호작용/접근성]
- 누르면 해당 텅 앰버 글로우+물결(도면 변형 금지), 최근음 배지("도·C4·1") 잠깐 표시, aria-live 갱신. role=button + aria-label. 포커스 링. prefers-reduced-motion 반영.

색: 배경 딥틸 그라데이션(#102028~), 11키 브론즈(#C58A3D), 15키 스틸틸(#6FAEB8), 글로우 앰버(#FFD27A), 텍스트 크림(#F2ECE0). 명상적·차분한 톤. 완료 후 주요 구현/실행법/체크리스트를 요약해줘.
```

---

## 부록 B. (선택) React + TypeScript 구조로 만들 경우

단일 파일 대신 유지보수성을 높이려면 아래 구조를 따른다. 튜닝·키 매핑·9:16·이미지 무왜곡 규칙은 본문과 동일하게 지킨다.

```text
src/
  data/tongueDrums.ts        # NOTE, NOTES_11/15, MAP, POS_11/15, DRUMS, 타입
  utils/keyboard.ts          # digitOf, isEditableTarget, resolveShortcut (+ keyboard.test.ts)
  audio/TongueDrumAudioEngine.ts  # ensureAudio, setVolume, playNote(+리버브/노이즈/팬)
  pages/SelectScreen.tsx     # char-11/15 카드
  pages/PlayScreen.tsx       # 선택 드럼 도면 + 투명 오버레이
  components/DrumStage.tsx, TongueButton.tsx, KeyboardGuide.tsx
  styles/global.css          # 9:16 풀스크린, .drum-stage 등
public/assets/               # char-11.png, char-15.png, play-11.png, play-15.png, icon.png
```
- 라우팅: `/`, `/play/11`, `/play/15`(URL이 source of truth, 잘못된 값은 선택 화면으로).
- `resolveShortcut`는 React 상태에 의존하지 않는 순수 함수로 유지, **Vitest**로 부록 A 테스트 검증.
- `AudioContext`는 싱글턴으로, 리렌더마다 새로 만들지 않는다. `POS_11/15`는 좌표 편집을 위해 별도 파일로.

---

*이 명세대로 만들면 9:16 화면을 가득 채우고, 11키·15키 텅드럼 원본 도면을 왜곡 없이 그대로 보여주며, 그 위 투명 원형 텅과 숫자키/Shift/Ctrl 매핑으로 정확히 연주되고, 둥근 어택·긴 잔향의 텅드럼다운 소리가 나는 명상적인 연주 웹앱이 완성됩니다.* 🪘🎶
