import { expect, test } from "@playwright/test";

const user = {
  userId: 1,
  loginName: "reader01",
  displayName: "독해러",
  role: "USER",
};

async function mockApi(page) {
  let authenticated = false;

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;

    if (path === "/api/csrf") {
      return route.fulfill({
        json: { headerName: "X-XSRF-TOKEN", parameterName: "_csrf", token: "e2e-token" },
      });
    }
    if (path === "/api/auth/me") {
      return authenticated
        ? route.fulfill({ json: user })
        : route.fulfill({
            status: 401,
            json: { code: "AUTHENTICATION_REQUIRED", message: "Authentication is required." },
          });
    }
    if (path === "/api/auth/login") {
      authenticated = true;
      return route.fulfill({ json: user });
    }
    if (path === "/api/quizzes/today") {
      return route.fulfill({
        status: 404,
        json: { code: "TODAY_QUIZ_NOT_FOUND", message: "No quiz is available." },
      });
    }
    if (path === "/api/orbit/streak") {
      return route.fulfill({ json: { currentStreak: 2, completedToday: false } });
    }
    if (path === "/api/groups/my") {
      return route.fulfill({ json: [] });
    }
    if (path === "/api/orbit") {
      return route.fulfill({ status: 404, json: { code: "ORBIT_NOT_FOUND", message: "No data." } });
    }

    return route.fulfill({ status: 404, json: { code: "E2E_UNMOCKED_API", message: path } });
  });
}

test("로그인 전에는 인증 화면을 표시한다", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "오늘의 독해를 이어가세요" })).toBeVisible();
  await expect(page.getByLabel("아이디")).toBeVisible();
  await expect(page.getByLabel("PIN")).toBeVisible();
});

test("로그인 후 메뉴 URL과 브라우저 뒤로가기가 동작한다", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await page.getByLabel("아이디").fill("reader01");
  await page.getByLabel("PIN").fill("1234");
  await page.locator("form").getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(/\/quiz\/?$/);
  await expect(page.getByRole("navigation", { name: "주요 화면" })).toBeVisible();
  await expect(page.getByText("오늘은 등록된 퀴즈가 없어요.")).toBeVisible();

  await page.getByRole("link", { name: "그룹" }).click();
  await expect(page).toHaveURL(/\/groups\/?$/);

  await page.getByRole("link", { name: "학습 기록" }).click();
  await expect(page).toHaveURL(/\/history\/?$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/groups\/?$/);
});
