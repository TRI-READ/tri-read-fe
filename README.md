# TRI:READ 프론트엔드

TRI:READ의 웹 화면을 담당하는 Next.js 애플리케이션입니다. 사용자가 평일마다 원하는 비문학 영역 하나를 골라 짧게 학습하고, 남은 지문은 보너스로 이어서 풀 수 있도록 구성했습니다.

## 기술 스택

- Next.js 16 App Router
- React 19
- JavaScript
- CSS Modules 및 전역 CSS
- Lucide React
- GitHub Actions
- OCI 정적 배포

TypeScript, Tailwind CSS, Bootstrap은 사용하지 않습니다.

## 주요 화면

```text
/               로그인 및 회원가입
/quiz           오늘의 퀴즈와 보너스 지문
/groups         학습 그룹
/history        주간/월간 학습 기록
/wrong-answers  오답노트
/admin          AI 생성 운영, 퀴즈 편집과 사용자 권한 관리
```

각 메뉴는 Next.js App Router의 실제 URL을 사용합니다. 따라서 브라우저 뒤로가기, 새로고침과 링크 공유가 정상 동작합니다.

관리자 화면에서는 Gemini 생성 기록과 검증 사유를 확인하고, 실패 작업 재시도, 생성 초안 편집·발행, 사용자 관리자 권한 변경을 한곳에서 처리합니다.

## 현재 학습 흐름

1. 오늘 제공된 3개 영역 중 원하는 지문 하나를 선택합니다.
2. 지문에 딸린 3문제를 풀면 오늘의 필수 학습이 완료됩니다.
3. 완료 화면에서 남은 지문을 보너스로 선택해 최대 2개 더 풀 수 있습니다.
4. 풀이 결과와 오답은 학습 기록 및 오답노트에서 다시 확인할 수 있습니다.

## 로컬 실행

백엔드를 8080 포트에서 먼저 실행한 뒤 프론트엔드를 시작합니다.

```powershell
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`에 접속합니다. 개발 서버는 `/api/*` 요청을 백엔드로 프록시하므로 Spring Security의 세션 쿠키와 CSRF 토큰을 동일 출처 요청으로 처리할 수 있습니다.

백엔드 주소를 바꾸려면 다음 환경값을 지정합니다.

```powershell
$env:API_BASE_URL="http://localhost:8080"
npm run dev
```

## 빌드

일반 Next.js 빌드는 다음 명령으로 확인합니다.

```powershell
npm run build
```

OCI에 배포할 정적 파일은 `STATIC_EXPORT`를 활성화해 생성합니다.

```powershell
$env:STATIC_EXPORT="true"
npm run build
```

정적 배포에서는 Caddy가 같은 도메인의 `/api/*` 요청을 백엔드로 전달합니다. 페이지 경로에는 trailing slash를 사용해 직접 접속하거나 새로고침해도 올바른 HTML을 반환합니다.

## 브랜치와 배포

- `dev`: 기능 개발 및 CI 대상
- `main`: 배포 기준 브랜치
- GitHub Actions가 빌드를 검사하고 OCI 인스턴스에 프론트엔드 정적 파일을 배포합니다.

운영 주소: https://tri-read.duckdns.org

## 저장소

- 프론트엔드: https://github.com/TRI-READ/tri-read-fe
- 백엔드: https://github.com/TRI-READ/tri-read-be
