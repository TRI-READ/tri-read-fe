# TRI:READ 프론트엔드

TRI:READ의 Next.js 웹 애플리케이션입니다. 사용자는 평일마다 세 영역 중 한 지문을 골라 3문제를 풀고, 원하면 나머지 두 지문도 보너스로 이어서 풀 수 있습니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- JavaScript
- CSS Modules 및 전역 CSS
- Lucide React
- Playwright
- GitHub Actions
- OCI 정적 배포

TypeScript, Tailwind CSS, Bootstrap은 사용하지 않습니다.

## 주요 경로

```text
/               로그인 및 회원가입
/quiz           오늘의 필수·보너스 퀴즈
/groups         학습 그룹
/history        주간·월간 학습 기록
/wrong-answers  오답노트
/admin          퀴즈 생성·편집·권한·보안 운영
```

메뉴는 Next.js App Router의 실제 URL을 사용합니다. 탭 이동 기록이 브라우저에 남기 때문에 뒤로가기, 새로고침, 직접 링크 접근이 정상 작동합니다.

## 학습 정책

1. 오늘 제공된 세 영역 중 원하는 지문 하나를 선택합니다.
2. 지문에 딸린 3문제를 풀면 오늘의 필수 학습이 완료됩니다.
3. 완료 후 원하면 남은 지문을 최대 두 개까지 보너스로 풉니다.
4. 결과와 지문은 학습 기록과 오답노트에서 다시 확인할 수 있습니다.
5. 주말 학습은 선택 사항이며, 비어 있는 평일 학습을 보충할 수 있습니다.

## 관리자 기능

- Gemini 퀴즈 생성 및 실패 작업 재시도
- 생성 상태·대상 날짜 필터와 서버 페이지네이션
- 일일 Gemini API 호출량 및 한도 표시
- 제목·주제·본문 유사도를 이용한 로컬 중복 검증 결과 표시
- 추가 API 호출이 필요한 AI 재검증은 기본 비활성화하고 현재 설정 상태 표시
- 생성·검증 프롬프트 버전 관리
- 퀴즈 수동 편집·발행
- 사용자 관리자 권한, 계정 활성화 상태와 PIN 초기화 관리
- 로그인 잠금 해제와 관리자 감사 로그 조회

## 계정과 그룹 관리

- 사용자는 상단 계정 메뉴에서 현재 PIN을 확인한 뒤 새 PIN으로 변경할 수 있습니다.
- PIN이 변경되면 기존 로그인 세션은 모두 종료됩니다.
- 그룹 소유자는 초대 만료일과 최대 사용 횟수를 정하고 기존 초대를 회수할 수 있습니다.
- 그룹 소유자는 일반 멤버를 제외하거나 다른 멤버에게 소유권을 이전할 수 있습니다.

## 로컬 실행

백엔드를 먼저 `8080` 포트에서 실행한 뒤 프론트엔드를 시작합니다.

```powershell
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속합니다. 개발 서버는 `/api/*` 요청을 백엔드로 프록시합니다.

백엔드 주소를 바꾸려면 다음 환경값을 지정합니다.

```powershell
$env:API_BASE_URL="http://localhost:8080"
npm run dev
```

## 검증

```powershell
npm run build
npm run test:e2e
```

Playwright 테스트의 API 응답은 격리된 가짜 응답을 사용하므로 운영 DB를 변경하지 않습니다.

OCI용 정적 결과물은 다음과 같이 생성합니다.

```powershell
$env:STATIC_EXPORT="true"
npm run build
```

Caddy가 같은 도메인의 `/api/*` 요청을 백엔드로 전달합니다. 페이지 경로에는 trailing slash를 사용해 직접 접근과 새로고침에도 올바른 HTML을 반환합니다.

## 브랜치와 배포

- `dev`: 기능 개발 및 CI 대상
- `main`: 운영 배포 기준 브랜치
- 매일 오전 9시 또는 수동 실행으로 `dev`에서 `main`으로 승격 PR을 만듭니다.
- PR 검사가 통과하면 병합하고 `main` CI가 OCI 정적 배포를 수행합니다.
- 배포 마지막 단계에서 운영 HTML 스모크 테스트를 수행합니다.

```text
dev push -> PR CI -> main 병합 -> main CI -> OCI 배포 -> 운영 스모크 테스트
```

## 보안 원칙

- 운영 API는 같은 도메인의 `/api/*` 상대 경로로만 호출합니다.
- OCI SSH 키와 접속 정보는 GitHub Actions Secrets로만 전달합니다.
- 비밀값, 개인 키, 빌드 결과물은 저장소에 커밋하지 않습니다.
- 정답은 제출 전 프론트엔드 번들과 퀴즈 조회 응답에 포함하지 않습니다.
- `npm audit`, Playwright, 빌드, Dependabot, CodeQL 검사를 CI에서 수행합니다.
- OCI 배포는 `OCI_KNOWN_HOSTS`에 등록된 SSH 호스트 키만 신뢰합니다.

운영 주소: https://tri-read.duckdns.org

## 저장소

- 프론트엔드: https://github.com/TRI-READ/tri-read-fe
- 백엔드: https://github.com/TRI-READ/tri-read-be
