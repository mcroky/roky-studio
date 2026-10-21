# Roky Studio

로키 워킷, 용사월드, 내일은 탁구왕, 스트레스 브레이크를 소개하는 정적 홈페이지입니다. 별도 빌드 없이 `index.html`을 열어 확인할 수 있습니다.

## GitHub Pages 배포

공개 주소: <https://mcroky.github.io/roky-studio/>

이 폴더는 `mcroky/roky-studio` 저장소의 `main` 브랜치를 추적합니다. 변경 사항을 `main`에 push하면 `.github/workflows/pages.yml`이 홈페이지를 자동 배포합니다. GitHub Pages의 배포 소스는 **GitHub Actions**로 설정되어 있습니다.

## 프로젝트 추가·수정

- `index.html`의 `.project-grid` 안에 있는 `article.project-card`를 복사해 제목, 설명, 특징, 링크를 바꿉니다.
- `styles.css`에서 새 카드의 색상과 그림을 조정합니다.
- CSS를 수정할 때는 `index.html`의 `styles.css?v=...` 버전도 바꿔 브라우저가 새 스타일을 받게 합니다.
- 메인 궤도 회전, 미리보기 카드 부유, 마우스 시차, 프로젝트 카드 기울기와 빛, 스크롤 등장 효과는 `styles.css`와 `effects.js`에 있습니다. 스크립트를 수정할 때는 `index.html`의 `effects.js?v=...` 버전도 갱신합니다. 움직임 줄이기 설정에서는 효과가 꺼집니다.
- 프로젝트 썸네일은 `assets/`에 넣고 카드의 `img.project-thumbnail` 경로와 설명을 바꿉니다. 이미지 전체가 보이도록 표시됩니다.
- 프로젝트 공개 주소가 바뀌면 해당 카드의 `a.project-link`와 업데이트 카드의 링크를 함께 수정합니다.
- 상단 프로젝트 수와 `THE COLLECTION`의 번호를 함께 갱신합니다.
- 홈페이지를 열면 `updates.mjs`가 네 프로젝트의 공개 업데이트 자료를 읽고 `#updates` 카드의 최신 내용·지난 내역·기준일을 자동 갱신합니다. 워킷은 공개 업데이트 페이지, 용사월드는 공개 빌드의 릴리스 데이터, 탁구왕은 `club-updates.js`, 스트레스 브레이크는 `app.js`의 변경 기록을 사용합니다. 원본을 읽지 못하면 `index.html`에 적힌 마지막 확인 내용을 표시합니다. 원본 형식이 바뀌면 `updates.mjs`의 파서를 수정하고 `node scripts/check-updates.mjs`로 확인합니다.
- 의견 폼은 FormSubmit의 인증된 비공개 주소 별칭으로 전송합니다. 실제 수신 이메일 주소는 공개 저장소와 페이지 소스에 넣지 않습니다. 수신처를 바꾸려면 새 주소를 FormSubmit에서 인증하고 `#feedback-form`의 `action` 별칭만 교체합니다. 전송 후에는 `?sent=1#feedback`으로 돌아와 완료 안내를 보여 줍니다.

네 프로젝트 모두 공개 주소로 연결합니다. 로키 워킷 주소는 <https://mcroky.github.io/workit/>입니다.

## 개인 작업소

공개 홈페이지에는 개인 작업 링크를 넣지 않습니다. 상단의 **내 작업소** 버튼은 `mcroky/roky-studio-workspaces` 비공개 GitHub 저장소로 이동하며, 작업소의 실제 URL은 그 저장소의 `README.md`에만 있습니다. 새 개인 링크를 추가할 때도 비공개 저장소만 수정합니다. GitHub 로그인과 저장소 접근 권한은 GitHub가 확인합니다.
