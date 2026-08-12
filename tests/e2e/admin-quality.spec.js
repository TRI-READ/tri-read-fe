import { expect, test } from "@playwright/test";

const admin = {
  userId: 1,
  loginName: "admin",
  displayName: "관리자",
  role: "ADMIN",
};

const emptyPage = (size) => ({
  items: [],
  page: 0,
  size,
  totalElements: 0,
  totalPages: 0,
});

async function mockAdminApi(page) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;

    if (path === "/api/csrf") {
      return route.fulfill({
        json: { headerName: "X-XSRF-TOKEN", parameterName: "_csrf", token: "e2e-token" },
      });
    }
    if (path === "/api/auth/me") {
      return route.fulfill({ json: admin });
    }
    if (path === "/api/quizzes/today") {
      return route.fulfill({
        status: 404,
        json: { code: "TODAY_QUIZ_NOT_FOUND", message: "오늘은 등록된 퀴즈가 없어요." },
      });
    }
    if (path === "/api/orbit/streak") {
      return route.fulfill({ json: { currentStreak: 0, completedToday: false } });
    }
    if (path === "/api/orbit") {
      return route.fulfill({
        json: {
          period: "WEEK",
          startDate: "2026-08-03",
          endDate: "2026-08-07",
          completedDays: 0,
          fullyLitDays: 0,
          days: [],
        },
      });
    }
    if (path === "/api/admin/quizzes") {
      return route.fulfill({ json: { page: emptyPage(6), pendingCount: 0 } });
    }
    if (path === "/api/admin/quiz-generations") {
      return route.fulfill({
        json: {
          page: emptyPage(10),
          successCount: 0,
          failureCount: 0,
          aiValidationEnabled: false,
        },
      });
    }
    if (path === "/api/admin/users") {
      return route.fulfill({ json: { ...emptyPage(10), items: [admin], totalElements: 1, totalPages: 1 } });
    }
    if (path === "/api/admin/operations/summary") {
      return route.fulfill({
        json: {
          applicationStatus: "UP",
          databaseStatus: "UP",
          uptimeSeconds: 60,
          version: "e2e",
          databaseSizeBytes: 0,
          recentFailures: [],
          recentAdminActions: [],
          inventory: [],
        },
      });
    }
    if (path === "/api/admin/operations/notifications") {
      return route.fulfill({ json: { enabled: false, configured: false } });
    }
    if (path === "/api/admin/quiz-quality") {
      return route.fulfill({
        json: {
          page: {
            items: [
              {
                questionId: 501,
                challengeDate: "2026-08-08",
                variantCode: "A",
                passageTitle: "양자 컴퓨팅의 오류 정정",
                topic: "과학·기술",
                passagePosition: 1,
                questionPosition: 2,
                questionContent: "윗글의 내용으로 적절하지 않은 것은?",
                responseCount: 10,
                correctCount: 2,
                incorrectCount: 8,
                correctRate: 20,
                status: "REVIEW_REQUIRED",
                reasons: [
                  "정답률이 20%로 너무 낮습니다.",
                  "2번 오답에 오답 응답의 75%가 집중되었습니다.",
                ],
                options: [
                  { optionId: 1, position: 1, content: "첫 번째 선택지", selectedCount: 2, selectionRate: 20, correct: true },
                  { optionId: 2, position: 2, content: "두 번째 선택지", selectedCount: 6, selectionRate: 60, correct: false },
                  { optionId: 3, position: 3, content: "세 번째 선택지", selectedCount: 1, selectionRate: 10, correct: false },
                  { optionId: 4, position: 4, content: "네 번째 선택지", selectedCount: 1, selectionRate: 10, correct: false },
                ],
              },
            ],
            page: 0,
            size: 10,
            totalElements: 1,
            totalPages: 1,
          },
          reviewRequiredCount: 1,
          dataInsufficientCount: 0,
        },
      });
    }

    return route.fulfill({
      status: 404,
      json: { code: "E2E_UNMOCKED_API", message: `${request.method()} ${path}` },
    });
  });
}

test("관리자는 실제 풀이 데이터로 판정된 퀴즈 품질을 확인한다", async ({ page }) => {
  await mockAdminApi(page);
  await page.goto("/admin");

  await page.getByRole("button", { name: "퀴즈 품질" }).click();

  await expect(page.getByRole("heading", { name: "퀴즈 품질" })).toBeVisible();
  await expect(page.getByText("검토 필요1", { exact: true })).toBeVisible();
  await expect(page.getByText("정답률이 20%로 너무 낮습니다.")).toBeVisible();
  await expect(page.getByText("2번 오답에 오답 응답의 75%가 집중되었습니다.")).toBeVisible();
  await expect(page.getByText("두 번째 선택지")).toBeVisible();
});
