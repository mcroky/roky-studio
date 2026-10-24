# Roky Studio 새 프로젝트 기본 틀

새 프로젝트를 만들 때 이 문서를 기본 요구사항으로 사용한다. 웹 공개와 향후 Google Play Android 출시를 함께 고려한다. 프로젝트의 게임·도구 기능과 디자인은 각 프로젝트에 맞게 정하되, 아래의 공통 동선과 운영 정보를 처음부터 넣는다.

개발과 기능 수정을 시작하기 전에 [게임 개발 스킬 분석과 참고 기준](docs/GAMEDEV_SKILLS_GUIDE.md)을 함께 읽는다. 게임 작업에는 현재 엔진·버전과 요청에 맞는 분야의 원문 지침을 선택하고, 일반 앱에는 관련 있는 공통 원칙만 적용한다.

## 1. 기본 원칙

- **Roky Studio로 돌아가기:** 모든 공개 프로젝트의 화면 상단에서 `https://mcroky.github.io/roky-studio/`로 이동할 수 있게 한다. 링크 문구는 `← Roky Studio로 돌아가기`처럼 목적지를 분명하게 쓴다. 모바일 화면에서도 찾을 수 있어야 한다.
- **사용자 개선 의견:** 사용자가 언제든 개선 제안이나 오류를 보낼 수 있는 진입점을 둔다. 새 프로젝트의 첫 버전은 Roky Studio의 의견 섹션(`https://mcroky.github.io/roky-studio/#feedback`)으로 연결해도 된다. 이 경우 사용자가 홈페이지 폼에서 해당 프로젝트를 선택할 수 있도록 **홈페이지의 프로젝트 목록과 의견 폼 선택지에도 새 프로젝트를 추가**한다. 프로젝트 안에 자체 의견 폼을 만들 때는 아래 3절을 따른다.
- **업데이트 내역:** 사용자가 현재 버전과 주요 변경 사항을 확인할 수 있는 화면이나 링크를 둔다. 실제 변경일과 버전을 기록하고, Roky Studio 홈페이지의 업데이트 카드도 함께 갱신한다.
- **프로젝트 이름과 소개:** 각 화면의 제목, 짧은 설명, 브라우저 제목, 아이콘을 프로젝트에 맞게 넣는다. 새 프로젝트가 공개되면 Roky Studio 홈페이지의 카드, 링크, 프로젝트 수를 갱신한다.
- **접근성과 작은 화면:** 링크와 버튼의 목적이 글자로 드러나게 하고, 키보드로 접근할 수 있게 하며, 모바일에서도 공통 메뉴가 가려지지 않게 한다.

- **운영자 소셜 계정:** 모든 앱에 X(`https://x.com/loki60542`)와 Threads(`https://www.threads.com/@loki60542`) 바로가기 버튼을 함께 둔다. 구현 세부 기준은 8절을 따른다.
- **카카오뱅크 이체:** 공통 메뉴에 카카오뱅크 이체 안내 버튼을 둔다. 계좌 정보는 홈페이지 한 곳에서 관리하며, Google Play 배포판은 결제 정책을 확인해 노출을 결정한다. 9절을 따른다.
- **Google Play 출시 전제:** 모든 프로젝트는 향후 Google Play에서 Android 앱으로 출시할 계획을 기본 전제로 설계한다. 착수할 때부터 Android 빌드 경로·기기 조작·저장·정책을 검토한다. 10절과 [출시 준비 기준](docs/GOOGLE_PLAY_READINESS.md)을 따른다.

## 2. 새 프로젝트 시작 체크리스트

개발 착수 전: 이 문서와 [스킬 분석 문서](docs/GAMEDEV_SKILLS_GUIDE.md), [Google Play 출시 준비 기준](docs/GOOGLE_PLAY_READINESS.md)을 읽고, 실제 기술·버전과 이번 작업에 적용할 기준을 확인한다. 새 프로젝트 루트에 `AGENTS.md`를 만들고 세 문서의 실제 경로를 적는다.

1. 프로젝트 이름, 한 줄 소개, 공개 URL을 정한다.
2. 모든 주요 화면 상단에 Roky Studio 복귀 링크를 넣는다. 외부 링크임을 알리는 문구 또는 아이콘을 사용할 수 있다.
3. `의견 보내기` 또는 `개선 의견 보내기` 진입점을 넣는다. Roky Studio의 의견 섹션으로 연결한다면 홈페이지 폼에 새 프로젝트 선택지를 추가한다.
4. 업데이트 내역에 첫 공개 버전과 날짜를 기록한다. 이후 기능을 공개할 때마다 갱신한다.
5. 브라우저 제목, 설명, 파비콘, 공유 미리보기 정보를 채운다. 실제 서비스에 없는 기능을 소개하지 않는다.
6. 저장·로그인·파일 처리 기능이 있다면 어디에 데이터가 저장되고 무엇이 전송되는지 사용자에게 짧고 정확하게 설명한다. 브라우저 저장 자료는 삭제될 수 있으므로 필요한 경우 백업 방법도 안내한다.
7. GitHub Pages 등 실제 배포 주소에서 복귀 링크, 의견 동선, 업데이트 내역, 모바일 화면을 확인한다.
8. 공통 헤더 또는 푸터에 X·Threads 버튼을 함께 넣고, 모바일과 배포 주소에서 목적지를 확인한다.
9. Roky Studio 홈페이지의 프로젝트 카드·썸네일·공개 링크·프로젝트 수·업데이트 카드·의견 폼 선택지를 갱신한다.
10. 웹판 공통 메뉴에 `카카오뱅크 이체` 버튼을 넣어 `https://mcroky.github.io/roky-studio/#bank-transfer`로 연결한다. Play 배포판은 9절의 정책 조건을 적용한다.
11. Android 배포 경로와 앱 식별자, 뒤로가기·앱 전환·저장 복원, 개인정보·권한·결제 방식을 개발 개요에 기록하고 초기 시제품부터 Android 기기에서 검증한다.

## 3. 프로젝트 내부 의견 폼을 만들 때

홈페이지 의견 폼으로 연결하는 기본 방식보다 프로젝트 안에서 맥락 있는 제보를 받고 싶다면 다음을 적용한다.

- 최소 입력: `의견 종류`(개선 제안·버그 제보·기타), `내용`(필수). 답장을 받을 이메일은 필요할 때만 선택 입력으로 둔다.
- 전송 전에 운영자에게 전달되는 정보와 저장·전송 방식을 설명한다. 비밀번호, 인증 코드, 로그인 토큰을 요청하거나 첨부하지 않는다.
- 전송 중 중복 제출을 막고, 성공·실패를 화면에 알린다. 실패하면 작성한 내용을 유지한다.
- 길이 제한과 과도한 제출 방지 기준을 둔다. 게임 진행 중 폼을 열거나 외부로 이동하면 진행 상황을 잃을 수 있는 경우 경고 또는 저장 동선을 제공한다.
- 수신처 주소와 비밀 키를 공개 저장소·브라우저 코드에 직접 넣지 않는다. 서비스별 기존 전송 방식을 무심코 복사하지 말고, 새 프로젝트에 맞는 경로를 확인한다.

## 4. 기존 프로젝트에서 확인한 근거

2026-10-21 기준, 연결된 GitHub 저장소의 기본 브랜치를 확인했다. 아래 표의 빈칸은 해당 저장소에서 이 조사로 확인하지 못한 항목이며, 기능이 없다는 뜻으로 단정하지 않는다.

| 프로젝트 | Roky Studio 복귀 | 의견 보내기 | 업데이트 내역 |
| --- | --- | --- | --- |
| [용사월드](https://github.com/mcroky/hero-world) | 확인한 `App.tsx` 헤더에는 없음 | 게임 안의 개선 의견 폼 | 게임 안의 버전별 내역 |
| [내일은 탁구왕](https://github.com/mcroky/tomorrow-table-tennis) | 게임 헤더의 복귀 링크 | 게임 안의 개선 의견 대화상자 | 게임 안의 날짜별 내역 |
| [스트레스 브레이크](https://github.com/mcroky/stress-break-3d) | 상단 복귀 링크 | 확인한 화면에는 없음 | 사이드 메뉴의 내역 |
| [로키 워크킷](https://github.com/mcroky/workit) | 전체 화면 상단 복귀 바 | 확인한 레이아웃에는 없음 | 확인한 레이아웃에는 없음 |
| [Roky Studio 홈페이지](https://github.com/mcroky/roky-studio) | 프로젝트 모음의 도착지 | 프로젝트 선택형 의견 폼 | 프로젝트별 최신 소식 |

기존 의견 전송 방식은 프로젝트마다 다르다. 홈페이지는 FormSubmit의 인증된 비공개 주소 별칭을 사용하고, 용사월드와 내일은 탁구왕은 자체 게임 흐름에 맞춘 폼을 사용한다. 새 프로젝트의 기본 동선은 홈페이지 의견 섹션으로 연결하고, 자체 폼이 필요한 경우에만 별도로 구현한다.

## 5. 새 프로젝트를 요청할 때 복사할 문장

> 이 프로젝트는 향후 Google Play에서 Android 앱으로 출시할 Roky Studio 프로젝트입니다. 개발 전에 `PROJECT_BASELINE.md`, `docs/GAMEDEV_SKILLS_GUIDE.md`, `docs/GOOGLE_PLAY_READINESS.md`를 읽고 관련 기준을 적용해 주세요. 현재 엔진·버전을 유지하며 Android 빌드 경로, 기기 조작·저장 복원·권한·개인정보·결제 정책을 처음부터 설계해 주세요. 새 프로젝트 루트 `AGENTS.md`에도 실제 문서 경로를 적어 주세요. 공통 메뉴에 Roky Studio 복귀, X·Threads, 개선 의견, 업데이트 내역, 웹판 카카오뱅크 이체 안내를 포함해 주세요. Play 배포판의 외부 이체 버튼은 정책 검토 후 배포 채널 설정으로 제어해 주세요. 공개 시 홈페이지의 프로젝트·업데이트·의견 선택지도 갱신해 주세요.

## 6. Supabase를 사용하는 프로젝트

Supabase Data API 기본 권한 변경에 대비해, 테이블 생성과 권한 설정을 같은 마이그레이션에 둔다. Supabase는 2026-10-30부터 기존 프로젝트에서도 `public`에 **새로 생성되는 테이블**에 API 역할 권한을 자동으로 부여하지 않는다. 기존 테이블 권한은 유지된다. 테이블은 계속 만들 수 있으며 이 변경 자체는 과금 정책이 아니라 API 권한 변경이다. 권한이 빠지면 `supabase-js`, PostgREST, GraphQL 요청에서 권한 오류가 날 수 있다.

### 마이그레이션 작성 기준

1. 테이블마다 실제 호출 경로를 확인한다. `anon`은 로그인하지 않은 클라이언트, `authenticated`는 로그인한 클라이언트, `service_role`은 서버 측 호출에 필요한 경우에만 허용한다.
2. 테이블 생성문 바로 뒤에 필요한 권한만 `GRANT`한다. 아래는 접근 정책을 결정하기 위한 예시이며, 모든 역할에 그대로 복사하지 않는다.

```sql
create table public.example_items (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id),
  name text not null
);

alter table public.example_items enable row level security;

-- 로그인 사용자 본인 소유 데이터에만 적용할 RLS 정책도 함께 작성한다.
create policy "Users can read their own items"
  on public.example_items for select to authenticated
  using ((select auth.uid()) = owner_id);

-- 앱에 실제 필요한 작업만 허용한다.
grant select on table public.example_items to authenticated;
```

예를 들어 브라우저 비로그인 읽기가 필요한 공개 목록에만 `anon`의 `SELECT`를 허용하고, 쓰기는 필요한 로그인 역할에만 부여한다. 서버에서 `service_role` 키로 Data API를 직접 호출하는 경우에도 그 호출에 필요한 테이블 권한을 검토한다. `service_role` 키는 브라우저 코드에 넣지 않는다.

3. `GRANT`는 역할이 테이블에 접근할 수 있게 하고, RLS 정책은 그 역할이 볼 수 있거나 바꿀 수 있는 행을 제한한다. 둘은 별개이므로 함께 검토한다. RLS를 켰다고 GRANT가 자동으로 생기지 않고, GRANT를 줬다고 RLS 정책이 대체되지 않는다.
4. `serial` 또는 시퀀스를 직접 사용하는 테이블에서 API 역할이 시퀀스 값을 생성해야 한다면 필요한 시퀀스 권한도 별도로 검토한다. 기본값이나 ID 생성 방식에 맞춰 최소 권한만 부여한다.
5. 새 프로젝트, 미리보기 브랜치, 로컬 `supabase db reset`은 전체 마이그레이션을 다시 실행한다. 실제 초기화 환경에서도 생성·GRANT·RLS·정책이 같은 이력으로 재현되는지 확인한다.
6. 일반 Postgres 연결만 쓰는 서버 코드에는 Data API GRANT 변경이 직접 적용되지 않는다. 다만 프로젝트에서 Data API도 사용한다면 해당 경로의 권한은 별도로 설정한다.

추가 참고: [Supabase API 보안과 권한 부여](https://supabase.com/docs/guides/api/securing-your-api), [테이블 Data API 기본 권한 변경 안내](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically).

## 7. Supabase 로그인은 사용자 아이디 기준으로 설계

Supabase Auth를 사용하는 새 로그인 시스템은 서비스 화면에서 이메일 대신 **사용자 아이디(ID)로 가입·로그인**하는 흐름을 기본 요구사항으로 삼는다. 단, Supabase Auth의 비밀번호 로그인 식별자는 기본적으로 이메일 또는 전화번호다. `signInWithPassword`가 사용자 이름을 직접 받는다고 가정하지 않는다.

- 구현 전에 아이디와 Supabase Auth 사용자를 안전하게 연결하는 방식을 결정한다. 사용자 아이디 조회를 위해 이메일 주소나 계정 존재 여부를 공개 API로 노출하지 않는다.
- 비밀번호 저장·검증을 자체 데이터베이스 테이블이나 브라우저 코드에서 구현하지 않는다. 인증은 Supabase Auth가 맡도록 설계한다.
- 아이디 중복·대소문자 처리, 가입 확인, 아이디/비밀번호 재설정, 로그인 오류 안내와 계정 열거 방지를 함께 설계한다.
- 설계가 확정되기 전에는 로그인 UI만 먼저 만들고 임의의 가짜 이메일 규칙이나 공개 사용자 조회로 연결하지 않는다.

참고: [Supabase 사용자 로그인 방식](https://supabase.com/docs/guides/auth/users), [`signInWithPassword` API](https://supabase.com/docs/reference/javascript/auth-signinwithpassword).


## 8. 모든 새 앱에 X·Threads 버튼 포함

- X 계정: `https://x.com/loki60542`
- Threads 계정: `https://www.threads.com/@loki60542`
- 두 버튼을 공통 헤더 또는 푸터에 함께 배치해 모든 주요 화면에서 접근할 수 있게 한다. 버튼에는 `X`, `Threads`처럼 목적지가 드러나는 이름을 표시한다. 공유·글 작성 링크가 아니라 운영자 프로필 링크다.
- 링크는 새 탭으로 열어 사용 중인 게임이나 도구 화면을 유지한다. `target="_blank"`와 `rel="me noopener noreferrer"`를 적용하고 새 탭 열림을 접근성 이름으로 안내한다.
- 작은 화면에서도 두 버튼이 가려지거나 다른 조작을 덮지 않게 한다. 키보드 초점 표시와 충분한 터치 영역을 제공한다.
- 배포 전 두 링크의 주소, 모바일 배치, 실제 배포 HTML에 포함됐는지 확인한다. 계정 주소가 바뀌면 이 문서와 모든 프로젝트의 공통 링크를 함께 갱신한다.

```html
<nav class="roky-social" aria-label="Roky Studio 소셜 계정"><a class="roky-social-link" href="https://x.com/loki60542" target="_blank" rel="me noopener noreferrer" aria-label="X @loki60542 새 탭에서 열기">X <span aria-hidden="true">↗</span></a><a class="roky-social-link" href="https://www.threads.com/@loki60542" target="_blank" rel="me noopener noreferrer" aria-label="Threads @loki60542 새 탭에서 열기">Threads <span aria-hidden="true">↗</span></a></nav>
```

## 9. 카카오뱅크 이체 안내

- 공통 웹 버튼: **카카오뱅크 이체**. 연결 주소: `https://mcroky.github.io/roky-studio/#bank-transfer`.
- 사용자가 2026-10-24 지정한 공개 수취 정보: **카카오뱅크 · 3333071025774 · 이경록**. 홈페이지에서 은행·계좌번호·예금주와 계좌번호 복사 버튼을 제공한다.
- 각 프로젝트에는 계좌번호를 중복 저장하지 않고 위 안내 주소를 연결한다. 새 탭으로 열어 현재 게임·작업 화면을 유지한다. 계좌 변경은 홈페이지와 이 문서를 함께 수정한다.
- 버튼은 이체 안내·계좌 복사 동선이다. 사용자가 은행 앱에서 금액과 수취인을 확인한 뒤 이체한다. 송금 링크가 제공되기 전에는 임의의 은행 딥링크를 만들지 않는다.
- **Google Play 배포판:** 웹 이체 버튼을 자동 이식하지 않는다. 디지털 상품·기능 해금·구독의 대가를 계좌이체로 받는 경로는 Play 정책 검토 없이 넣지 않는다. 무보상 자발적 지원 같은 예외도 실제 흐름·수취 방식·국가와 현행 조건을 확인한 뒤 앱별로 결정한다. 배포 채널 설정으로 외부 결제 링크 표시를 제어한다. [공식 결제 정책 안내](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en)

## 10. 모든 프로젝트는 Google Play 출시를 고려해 시작

**사용자 확정 계획: 모든 프로젝트를 장차 Google Play에서 Android 앱으로 출시한다.** 신규 개발과 기존 기능 수정에 이 목표를 적용한다.

개발 개요에 Android 빌드·배포 방식, 앱 식별자·버전·서명, 터치·뒤로가기·앱 전환, 저장·업데이트 호환성, 권한·개인정보·계정 삭제, 결제·광고, 실기기·출시 검증 계획을 적는다. 현재 엔진·프레임워크를 유지하며 초기에 Android 시제품으로 실제 배포 경로를 확인한다.

세부 기준과 공식 정책은 **[Google Play 출시 준비 기준](docs/GOOGLE_PLAY_READINESS.md)**을 따른다. 새 프로젝트 AGENTS.md에도 이 문서의 실제 경로를 함께 기록한다. 정책·API 요구는 출시 직전에 다시 확인한다.
