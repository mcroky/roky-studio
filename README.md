# Roky Studio

용사월드, 내일은 탁구왕, 로키 워크킷을 소개하는 정적 홈페이지입니다. 별도 빌드 없이 `index.html`을 열어 확인할 수 있습니다.

## GitHub Pages 배포

1. GitHub에 공개 저장소를 만들고 이 폴더의 파일을 `main` 브랜치에 올립니다.
2. 저장소 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다.
3. `main`에 push하면 `.github/workflows/pages.yml`이 홈페이지를 배포합니다. 주소는 Pages 설정 화면이나 Actions 실행 결과에서 확인할 수 있습니다.

## 프로젝트 추가·수정

- `index.html`의 `.project-grid` 안에 있는 `article.project-card`를 복사해 제목, 설명, 특징, 링크를 바꿉니다.
- `styles.css`에서 새 카드의 색상과 그림을 조정합니다.
- 공개 주소가 준비되면 로키 워크킷의 `span.project-link-disabled`를 다른 카드처럼 `a.project-link`로 바꾸고 `href`에 실제 주소를 넣습니다. 상태 문구도 `공개 플레이`로 수정합니다.
- 상단 프로젝트 수와 `THE COLLECTION`의 번호를 함께 갱신합니다.
- 새 버전이나 기능이 공개되면 `index.html`의 `#updates` 카드에서 날짜, 제목, 설명, 연결 주소를 갱신합니다. `WHAT'S NEW` 기준일도 함께 바꿉니다. 용사월드는 공개 게임의 **업데이트** 창, 내일은 탁구왕은 공개 저장소의 변경 기록을 확인한 뒤 방문자가 이해하기 쉬운 문장으로 적습니다.

용사월드와 내일은 탁구왕 링크는 각 프로젝트의 로컬 README에 명시된 공개 주소를 사용합니다. 로키 워크킷은 아직 공개 주소가 없어 준비 중으로 표시합니다.
