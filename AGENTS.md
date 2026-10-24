# Roky Studio 개발 지침

개발이나 기능 수정을 시작하기 전에 `PROJECT_BASELINE.md`와 `docs/GAMEDEV_SKILLS_GUIDE.md`를 읽고 이번 요청에 관련된 기준을 적용한다. 같은 작업에서 이미 읽었고 내용이 바뀌지 않았다면 반복해서 전체를 읽지 않는다.

게임 개발은 실제 엔진·버전을 확인하고 필요한 분야의 원문 스킬만 추가로 읽는다. 게임이 아닌 앱에는 관련 있는 공통 원칙만 적용한다. 외부 예제를 이유로 의존성을 자동 업그레이드하거나 기존 기술을 교체하지 않는다.

게임 작업에서는 Codex 사용자 공통 스킬 폴더의 `router/SKILL.md`와 `router/references/installed-skills.md`를 읽고, 설치된 항목 중 관련 스킬만 선택한다. 설치 목록·출처 커밋은 `docs/GAMEDEV_SKILLS_INSTALLED.json`에 있다.

새 프로젝트를 만들면 그 프로젝트의 루트 `AGENTS.md`에도 두 문서의 실제 경로를 기록한다. 사용자의 현재 요청과 각 프로젝트에 적용되는 지침을 우선한다.

모든 프로젝트는 향후 Google Play에서 Android 앱으로 출시할 계획이다. 착수·주요 기능 설계 전에 `docs/GOOGLE_PLAY_READINESS.md`도 읽고 관련 Android·저장·개인정보·결제 기준을 적용한다. 웹판 카카오뱅크 이체 버튼은 `PROJECT_BASELINE.md` 9절을 따르고, Play 배포판에서는 현행 결제 정책과 배포 채널 설정으로 노출을 결정한다.
