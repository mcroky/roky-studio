# 게임 개발 에이전트 스킬 분석과 개발 전 참고 기준

확인일: 2026-10-24 · 분석 대상: [awesome-gamedev-agent-skills][repo] · 확인 커밋: [`7eb1b53305fab881f4758e2eff2e371cd7869221`][snapshot]

이 문서는 새 개발과 기존 기능 수정 전에 읽는다. 모든 프로젝트에서 먼저 적용 여부를 판단하고, 게임 개발에서는 작업에 맞는 원문 스킬을 추가로 읽는다. 게임이 아닌 앱에는 관련 있는 UI·입력·성능 원칙만 적용한다.

모든 프로젝트는 향후 Google Play 출시를 목표로 한다. 처음 설계할 때부터 [Google Play 출시 준비 기준](GOOGLE_PLAY_READINESS.md)을 함께 읽고 Android 빌드·입력·저장·개인정보·결제 정책을 적용한다. 게임 스킬의 웹 예제가 Android 배포 기준까지 충족한다고 가정하지 않는다.

## 1. 이 저장소는 무엇인가

AI 개발 도구가 필요할 때 읽는 분야별 `SKILL.md` 작업 지침 모음이다. 확인한 커밋에는 분야별 스킬 파일 76개와 별도 라우터 1개가 있다. 엔진 사용법, 공통 게임 설계, 장르 구조, 제작·출시 절차를 다룬다. 라우터는 프로젝트 파일에서 엔진과 버전을 확인하고, 요청에 필요한 지침만 선택한다. [구성 설명][readme] · [라우터 원문][router]

예를 들어 “RPG 저장 기능 수정”이라면 저장 방식과 RPG 데이터 구조를, “공격이 밋밋하다”면 타격감과 관련 엔진 지침을 읽는 방식이다. 실제 게임을 개선하려면 이 지침에 맞춰 코드를 수정하고 결과를 확인해야 한다. 문서를 읽거나 설치한 것만으로 기존 게임의 기능·그래픽·성능이 바뀌지는 않는다.

## 2. 무엇이 좋아질 수 있는가

아래 기대 효과는 원문을 현재 프로젝트에 대입한 분석이다. 우리 프로젝트에서 개선율이나 개발 시간 절감률을 측정한 결과는 아니다.

| 분야 | 실제 지침의 핵심 | 우리 개발에서 기대하는 효과 | 완료 여부를 판단할 근거 |
| --- | --- | --- | --- |
| 조작 | 키·터치를 `공격`, `이동` 같은 행동으로 연결하고, 한 번 누름과 계속 누름을 구분한다. 필요한 경우 입력을 짧게 기억한다. | 키보드·터치 조작의 중복 실행과 입력 누락을 줄이고 기기별 동작을 맞추는 데 도움을 준다. | 한 번 누르면 한 번 실행되는지, 길게 누르기와 기기 전환이 의도대로 되는지 확인한다. [입력 지침][input] |
| 저장 | 데이터 형식에 버전을 넣고, 이전 저장 자료의 변환·검증·복구를 설계한다. | 업데이트 뒤 진행도·장비·퀘스트가 깨지는 실수를 줄이는 데 도움을 준다. | 종료 후 다시 열기, 이전 버전 자료 불러오기, 손상 자료 처리 결과를 확인한다. [저장 지침][save] |
| 타격감 | 타격 사건에 소리·파티클·짧은 정지·화면 흔들림을 적절히 결합하고, 시각 효과와 판정 계산을 분리한다. | 공격이 맞았는지 알아보기 쉬워지고 효과의 강도를 일관되게 조정할 수 있다. | 타격 효과가 한 번만 발생하는지, 효과가 끝나는지, 조작과 충돌 판정을 방해하지 않는지 확인한다. [타격감 지침][feel] |
| UI | 화면 크기·안전 영역·키보드 초점·메뉴 이동·번역 길이를 고려한다. | 모바일에서 버튼이 가려지거나 메뉴를 닫지 못하는 문제를 줄이는 데 도움을 준다. | 작은 화면, 긴 번역, 키보드 이동과 닫기 동작을 확인한다. [UI 지침][ui] |
| 성능 | 먼저 느린 장면을 재현하고 CPU·GPU 병목을 측정한 뒤 가장 큰 비용을 줄인다. | 원인과 관계없는 코드를 고치는 시간을 줄이고 개선 근거를 남길 수 있다. | 같은 기기·장면에서 변경 전후 프레임 시간을 비교한다. 측정하지 않았다면 빨라졌다고 단정하지 않는다. [성능 지침][performance] |
| 게임 이미지 | 기준이 되는 화풍·크기·시점·팔레트를 정하고 관련 이미지를 묶음으로 제작·정리한다. | 캐릭터·몬스터·아이콘의 그림체와 크기가 따로 노는 문제를 줄이는 데 도움을 준다. | 실제 게임 배경과 표시 크기에서 실루엣·애니메이션·투명도·메모리를 확인한다. [에셋 제작 지침][assets] |
| RPG 구조 | 기본 능력치와 장비·버프 효과를 분리하고, 아이템·퀘스트와 진행도를 데이터로 관리한다. | 장비를 바꿀 때 수치가 누적되거나 불러온 뒤 상태가 달라지는 문제를 줄이는 데 도움을 준다. | 장착·해제·저장·불러오기 후 수치와 퀘스트 진행을 비교한다. [RPG 지침][rpg] |
| 초기 실험 | 먼저 확인할 재미나 동작을 하나 정하고 작은 시제품으로 검토한다. | 검증되지 않은 기능에 UI·이미지·콘텐츠를 대량으로 붙이는 재작업을 줄일 수 있다. | 시제품으로 정한 질문에 답할 수 있는지 판단하고, 제품 코드로 옮길 범위를 결정한다. [시제품 지침][prototype] |

## 3. 원문을 그대로 적용하면 안 되는 부분

### 엔진과 버전부터 확인

원문의 새 프로젝트 기준에는 Phaser 4.2와 three.js r186 등이 적혀 있다. 이는 저장소가 정한 작성 기준이며, 현재 프로젝트를 그 버전으로 올리라는 지시가 아니다. 원문도 기존 프로젝트의 버전과 잠금 파일을 유지하도록 명시한다. [버전 지원 정책][versions]

용사월드는 확인일 기준 Phaser **3.90.0**을 사용한다. 에이전트뷰의 로컬 three.js는 **r170**이다. 따라서 최신 기준의 예제를 그대로 복사하지 말고 현재 버전의 공식 API와 기존 구조에 맞게 구현한다. 엔진 업그레이드는 별도 작업으로 다룬다.

### 개념과 플랫폼별 구현을 구분

- 저장 지침의 임시 파일 작성 후 이름 변경은 파일 시스템 예시다. 브라우저의 IndexedDB, localStorage, 서버 데이터베이스에는 저장 수단에 맞는 트랜잭션·복구 방식을 설계한다.
- 라우터의 엔진 자동 탐지는 패키지나 프로젝트 메타데이터를 단서로 삼는다. 직접 만든 WebGL·Canvas·CSS 게임에는 맞는 엔진 스킬이 없을 수 있다. 이때는 공통 설계 지침만 선택한다.
- 저장소의 Godot 기본 선택 규칙은 우리 프로젝트의 기술 선택을 대신하지 않는다. 기존 기술을 유지하고, 새 프로젝트의 엔진은 요구사항에 맞춰 정한다.
- Steam·itch.io 출시 지침은 해당 플랫폼에 배포할 때 사용한다. GitHub Pages·Render·Sites 배포는 각 프로젝트의 실제 배포 절차를 따른다.

### 검증 범위를 과장하지 않기

저장소의 검증기는 메타데이터, 파일 형식, 링크, 이름 중복, 라우터와 카탈로그의 연결 등을 검사한다. 이것만으로 우리 게임의 충돌 판정·저장 호환성·모바일 성능이 검증되지는 않는다. 검토한 자료에서는 우리 게임에 적용했을 때의 개선율이나 모든 스킬의 품질을 보장하는 비교 실험을 확인하지 못했다. [검증기 소스][validator]

실제 변경의 완료 기준은 실행 결과와 필요한 확인 기록이다. 외부 스킬의 예제·권고는 참고 자료로 다루며, 사용자의 요청과 해당 프로젝트의 작업 지침을 우선한다.

## 4. 현재 프로젝트에 적용하는 방법

아래 기술은 2026-10-24 로컬 소스에서 확인한 내용이다. 다음 개발 때는 현재 파일을 다시 확인한다. 세부 스킬 이름은 선택 후보이며, 매번 전부 읽거나 적용하지 않는다.

| 프로젝트 | 확인한 기술과 성격 | 우선 참고할 지침 | 적용할 때의 경계 |
| --- | --- | --- | --- |
| 용사월드 | Phaser 3.90.0 + React 기반 RPG | `phaser-core`, `rpg`, `save-systems`, `input-systems`, `game-feel`, `performance-optimization` 중 관련 항목 | Phaser 3 호환 API를 확인한다. 파티·전투·저장 등 이번 변경과 관계있는 부분만 선택한다. |
| 내일은 탁구왕 | 자체 WebGL 렌더러와 JavaScript | `input-systems`, `physics-tuning`, `camera-systems`, `game-feel` | three.js 게임으로 간주하지 않는다. 기존 경기 규칙과 수동 조작 정책을 유지한다. |
| 스트레스 브레이크 | CSS 3D 변환과 JavaScript | `game-feel`, `audio-design`, `input-systems`, `performance-optimization` | 엔진 교체 없이 기존 시각 효과·입력·타격 사건에 적용한다. |
| 에이전트뷰 | three.js r170 기반 사무실 시각화 | `threejs-scene-setup`, `game-ui-ux`, `performance-optimization` | r170 호환성을 확인한다. 실제 작업 데이터와 시각적 연출의 관계를 유지한다. |
| Workit | Next.js·React 업무 도구 | UI 접근성·입력·측정 후 성능 개선 원칙 | 게임 전투·물리·RPG 구조를 억지로 도입하지 않는다. |
| 우리 동네 산책길 | Leaflet·브라우저 UI + Node 서버 | UI·기기별 입력·성능 측정 원칙 | 지도·공공데이터 API·개인정보 처리 기준은 해당 프로젝트 문서를 따른다. |
| Roky Studio | 정적 홈페이지 | UI·접근성·성능 측정 원칙 | 게임 엔진을 추가할 이유로 삼지 않는다. |
| 전자책 실습 예제 | HTML·CSS·JavaScript 학습용 페이지 | 작은 범위의 시제품·입력·UI 원칙 | 학습 목적에 맞는 단순함을 유지한다. |

## 5. 매번 개발을 시작할 때의 순서

1. [프로젝트 기본 문서](../PROJECT_BASELINE.md)와 이 문서를 먼저 읽는다. 같은 작업 중 이미 읽었고 내용이 바뀌지 않았다면 반복해서 전체를 불러오지 않는다.
2. 프로젝트의 `AGENTS.md`, 실제 소스, 의존성·잠금 파일에서 현재 엔진·버전·기능 구조를 확인한다.
3. 이번 요청이 입력, 저장, UI, 전투, 이미지, 성능, 배포 중 어디에 해당하는지 정한다. 설치된 `router` 스킬과 `references/installed-skills.md`에서 사용할 수 있는 목록·로컬 경로를 확인하고, 필요한 최소 스킬의 본문을 읽는다. 작업이 달라지면 선택을 다시 판단한다.
4. 바꿀 동작과 완료 기준을 짧게 정한다. 예: “모바일 공격 버튼의 한 번 누름이 한 번만 실행되며, 메뉴를 열었을 때 전투 입력이 발생하지 않아야 한다.”
5. 현재 버전·기존 자료와 호환되게 구현하고, 바뀐 동작에 필요한 확인을 수행한다. 성능 개선은 가능한 범위에서 같은 조건으로 측정한다.
6. 공개하는 변경이면 업데이트 내역과 해당 프로젝트의 배포 절차를 따른다. Roky Studio 복귀·개선 의견·X·Threads 등 공통 요구사항은 기본 문서로 함께 확인한다.

## 6. 설치된 스킬과 바로 사용하는 방법

2026-10-24 사용자 요청으로 **22개 스킬**을 이 PC의 Codex 사용자 공통 폴더 `C:/Users/SVSCORP/.codex/skills`에 설치했다. 분석한 커밋 `7eb1b53305fab881f4758e2eff2e371cd7869221`을 고정해 공식 Skill Installer로 내려받았다. 정확한 이름과 원본 경로는 [설치 기록](GAMEDEV_SKILLS_INSTALLED.json)에 있다.

| 묶음 | 개수 | 설치된 스킬 |
| --- | --- | --- |
| 작업별 선택 | 1 | `router` |
| Phaser | 2 | `phaser-core`, `phaser-arcade-physics` |
| three.js | 3 | `threejs-scene-setup`, `threejs-gltf-loading`, `threejs-materials-lighting` |
| 조작·화면·효과 | 7 | `input-systems`, `camera-systems`, `physics-tuning`, `game-feel`, `game-ui-ux`, `audio-design`, `shader-programming` |
| 데이터·콘텐츠·제작 | 7 | `save-systems`, `game-ai`, `dialogue-systems`, `procedural-gen`, `level-design`, `create-game-assets`, `performance-optimization` |
| 장르·실험 | 2 | `rpg`, `prototype-fast` |

다음 메시지부터 설치된 스킬을 사용할 수 있다. 게임 개발 요청을 받으면 라우터가 현재 엔진·버전과 작업에 맞는 최소 스킬을 선택하도록 참조 규칙을 추가했다. 직접 선택하고 싶으면 `$router` 또는 `$save-systems`처럼 이름을 지정할 수도 있다. 전체 목록을 매번 읽지 않는다.

라우터에는 Codex의 평평한 폴더 구조와 설치된 부분 목록을 안내하는 보정을 넣었다. 원문 카탈로그에 이름이 있어도 이 PC에 전부 설치된 것은 아니므로, 없는 스킬을 읽었다고 가정하지 않는다. 원문의 버전 정책은 라우터 안에 함께 보관했고, 기존 프로젝트의 Phaser 3.90.0·three.js r170 버전은 유지한다.

모든 설치 폴더에 원본 LICENSE·NOTICE와 `UPSTREAM.json` 출처 기록을 보관했다. 라우터의 변경 내역은 `router/LOCAL_ADAPTATIONS.md`에 기록했다. 에셋 검사 스크립트에 필요한 Pillow 11.1.0과 스킬 검증용 PyYAML 6.0.2도 현재 Python 환경에 준비돼 있음을 확인했다.

다른 PC에서 재설치할 때는 설치 기록의 커밋과 경로를 사용하고, 라우터의 설치 경로 보정과 참조 목록도 함께 적용한다. 새 엔진·장르가 필요해지면 해당 스킬과 동봉 스크립트를 검토해 추가한다. 원문을 복사·수정해 재배포할 때에는 Apache-2.0 라이선스와 NOTICE를 따른다. [원본 설치 설명][installation] · [라이선스][license] · [NOTICE][notice]

## 7. 다음 개발에서도 참고하게 하는 설정

Roky Studio의 루트 `AGENTS.md`가 기본 문서와 이 문서를 가리킨다. 이 PC의 Codex 전역 지침에는 **현재 작업 경로가 `E:\개인프로젝트` 아래일 때** 두 문서를 먼저 읽으라는 규칙을 둔다. 따라서 같은 위치의 새 프로젝트도 이 참조 기준을 사용할 수 있다.

전역 지침은 이 PC의 설정이다. 다른 PC·개발 도구·원격 저장소에서도 유지하려면 새 프로젝트 루트의 `AGENTS.md`에 다음 참조를 넣고 문서 위치를 실제 환경에 맞춘다. Git 저장소 밖의 부모 폴더에 `AGENTS.md` 하나만 두는 것으로 모든 저장소에서 읽힌다고 가정하지 않는다. [OpenAI 공식 AGENTS.md 안내][agents-docs]

```markdown
## 개발 전 참고

개발을 시작하기 전에 아래 문서를 읽고 이번 작업에 관련된 기준을 적용한다.
- E:/개인프로젝트/Roky Studio/PROJECT_BASELINE.md
- E:/개인프로젝트/Roky Studio/docs/GAMEDEV_SKILLS_GUIDE.md

게임 작업은 현재 엔진·버전을 확인하고 필요한 분야의 원문 스킬만 선택한다.
게임이 아닌 앱은 관련 있는 공통 원칙만 적용한다.
```

## 8. 이 분석의 유지 기준

이 문서는 확인 커밋의 분석이다. 개발에 필요한 원문이 바뀌었거나 새로운 엔진·기능을 도입할 때 해당 스킬과 공식 문서를 다시 확인하고, 우리 프로젝트에 영향을 주는 내용만 갱신한다. 스킬 목록의 개수나 저장소 인기만으로 품질을 판단하지 않는다.

### 실제 프로젝트 점검 기록

- [용사월드·내일은 탁구왕 스킬 기준 점검 — 2026-10-24](GAME_REVIEW_2026-10-24.md): 저장 실패·손상 기록·창 전환·접근성 및 선택 개선안. 두 게임의 관련 개발 전에 미해결 항목을 확인하고, 구현을 마친 항목에는 결과를 기록한다.
- [우선순위 수정·배포 기록 — 2026-10-24](GAME_FIXES_2026-10-24.md): P1·P2 6건의 처리 방식, 회귀 검증, 공개 배포 확인 기록.

[repo]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills
[snapshot]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/tree/7eb1b53305fab881f4758e2eff2e371cd7869221
[readme]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/README.md
[router]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/router/SKILL.md
[versions]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/docs/VERSION-SUPPORT.md
[input]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/disciplines/input-systems/SKILL.md
[save]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/disciplines/save-systems/SKILL.md
[feel]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/disciplines/game-feel/SKILL.md
[ui]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/disciplines/game-ui-ux/SKILL.md
[performance]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/disciplines/performance-optimization/SKILL.md
[assets]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/disciplines/create-game-assets/SKILL.md
[rpg]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/genres/rpg/SKILL.md
[prototype]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/skills/workflows/prototype-fast/SKILL.md
[validator]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/scripts/validate-skills.py
[installation]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/docs/INSTALLATION.md
[license]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/LICENSE
[notice]: https://github.com/gamedev-skills/awesome-gamedev-agent-skills/blob/7eb1b53305fab881f4758e2eff2e371cd7869221/NOTICE
[agents-docs]: https://learn.chatgpt.com/docs/agent-configuration/agents-md
