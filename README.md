# Roky Studio

용사월드, 내일은 탁구왕, 로키 워크킷을 소개하는 정적 홈페이지입니다. 별도 빌드 없이 `index.html`을 열어 확인할 수 있습니다.

## GitHub Pages 배포

공개 주소: <https://mcroky.github.io/roky-studio/>

이 폴더는 `mcroky/roky-studio` 저장소의 `main` 브랜치를 추적합니다. 변경 사항을 `main`에 push하면 `.github/workflows/pages.yml`이 홈페이지를 자동 배포합니다. GitHub Pages의 배포 소스는 **GitHub Actions**로 설정되어 있습니다.

## 프로젝트 추가·수정

- `index.html`의 `.project-grid` 안에 있는 `article.project-card`를 복사해 제목, 설명, 특징, 링크를 바꿉니다.
- `styles.css`에서 새 카드의 색상과 그림을 조정합니다.
- CSS를 수정할 때는 `index.html`의 `styles.css?v=...` 버전도 바꿔 브라우저가 새 스타일을 받게 합니다.
- 메인 궤도 회전, 미리보기 카드 부유, 마우스 시차, 프로젝트 카드 기울기와 빛, 스크롤 등장 효과는 `styles.css`와 `effects.js`에 있습니다. 스크립트를 수정할 때는 `index.html`의 `effects.js?v=...` 버전도 갱신합니다. 움직임 줄이기 설정에서는 효과가 꺼집니다.
- 프로젝트 썸네일은 `assets/`에 넣고 카드의 `img.project-thumbnail` 경로와 설명을 바꿉니다. 이미지 전체가 보이도록 표시됩니다.
- 공개 주소가 준비되면 로키 워크킷의 `span.project-link-disabled`를 다른 카드처럼 `a.project-link`로 바꾸고 `href`에 실제 주소를 넣습니다. 상태 문구도 `공개 플레이`로 수정합니다.
- 상단 프로젝트 수와 `THE COLLECTION`의 번호를 함께 갱신합니다.
- 새 버전이나 기능이 공개되면 `index.html`의 `#updates` 카드에서 날짜, 제목, 설명, `details.update-history`의 지난 내역을 갱신합니다. `WHAT'S NEW` 기준일도 함께 바꿉니다. 용사월드와 내일은 탁구왕의 공개 게임에 있는 **업데이트 내역**을 확인한 뒤 방문자가 이해하기 쉬운 문장으로 적습니다.
- 의견 폼은 FormSubmit의 인증된 비공개 주소 별칭으로 전송합니다. 실제 수신 이메일 주소는 공개 저장소와 페이지 소스에 넣지 않습니다. 수신처를 바꾸려면 새 주소를 FormSubmit에서 인증하고 `#feedback-form`의 `action` 별칭만 교체합니다. 전송 후에는 `?sent=1#feedback`으로 돌아와 완료 안내를 보여 줍니다.

용사월드와 내일은 탁구왕 링크는 각 프로젝트의 로컬 README에 명시된 공개 주소를 사용합니다. 로키 워크킷은 아직 공개 주소가 없어 준비 중으로 표시합니다.
