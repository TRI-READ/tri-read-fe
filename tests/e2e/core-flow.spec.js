import { expect, test } from "@playwright/test";

const user = {
  userId: 1,
  loginName: "reader01",
  displayName: "독해러",
  role: "USER",
};

function createQuestion(questionId, content) {
  return {
    questionId,
    position: ((questionId - 1) % 3) + 1,
    content,
    options: [1, 2, 3, 4].map((position) => ({
      optionId: questionId * 10 + position,
      position,
      content: `${position}번 선택지`,
    })),
  };
}

const passages = [
  {
    passageId: 101,
    position: 1,
    title: "도시의 열을 낮추는 지붕",
    topic: "과학·기술",
    content: "밝은 지붕은 햇빛을 더 많이 반사해 도심의 온도 상승을 줄이는 데 도움을 준다.",
    questions: [
      createQuestion(1, "밝은 지붕의 주된 효과는 무엇인가?"),
      createQuestion(2, "본문의 내용과 일치하는 것은?"),
      createQuestion(3, "본문에서 추론할 수 있는 것은?"),
    ],
    sources: [],
  },
  {
    passageId: 102,
    position: 2,
    title: "선택을 바꾸는 기준점",
    topic: "사회·경제",
    content: "사람은 같은 정보라도 처음 제시된 기준점에 따라 서로 다른 판단을 내릴 수 있다.",
    questions: [
      createQuestion(4, "기준점의 의미로 알맞은 것은?"),
      createQuestion(5, "본문의 사례로 적절한 것은?"),
      createQuestion(6, "글쓴이의 관점으로 알맞은 것은?"),
    ],
    sources: [],
  },
  {
    passageId: 103,
    position: 3,
    title: "기억을 기록하는 방식",
    topic: "인문·예술",
    content: "기록은 과거를 그대로 복제하기보다 현재의 관점에서 기억을 다시 구성하는 과정이다.",
    questions: [
      createQuestion(7, "기록의 성격으로 알맞은 것은?"),
      createQuestion(8, "본문의 핵심 주장으로 알맞은 것은?"),
      createQuestion(9, "글의 전개 방식으로 알맞은 것은?"),
    ],
    sources: [],
  },
];

function createOrbit(reviewRecovered = false) {
  return {
    period: "WEEK",
    startDate: "2026-07-27",
    endDate: "2026-07-31",
    completedDays: 2,
    fullyLitDays: reviewRecovered ? 2 : 1,
    days: [
      {
        date: "2026-07-27",
        sourceDate: "2026-07-27",
        weekendMakeUp: false,
        status: "COMPLETE",
        brightness: 1,
        score: 3,
        wrongCount: 0,
        recoveredCount: 0,
      },
      {
        date: "2026-07-28",
        sourceDate: "2026-07-28",
        weekendMakeUp: false,
        status: reviewRecovered ? "COMPLETE" : "REVIEW_REQUIRED",
        brightness: reviewRecovered ? 1 : 0.6,
        score: 2,
        wrongCount: 1,
        recoveredCount: reviewRecovered ? 1 : 0,
      },
    ],
  };
}

function createReview(status) {
  return {
    reviewId: 501,
    questionId: 2,
    status,
    retryCount: status === "RECOVERED" ? 1 : 0,
    challengeDate: "2026-07-28",
    passageTitle: passages[0].title,
    passageTopic: passages[0].topic,
    passageContent: passages[0].content,
    questionPosition: 2,
    questionContent: passages[0].questions[1].content,
    selectedOption: passages[0].questions[1].options[1],
    correctOption: passages[0].questions[1].options[0],
    explanation: "밝은 표면은 햇빛을 더 많이 반사합니다.",
    evidence: "본문 첫 문장에서 효과를 확인할 수 있습니다.",
    createdAt: "2026-07-28T09:00:00+09:00",
    lastReviewedAt: status === "RECOVERED" ? "2026-07-28T10:00:00+09:00" : null,
    recoveredAt: status === "RECOVERED" ? "2026-07-28T10:00:00+09:00" : null,
  };
}

function createGroup(name = "출근길 독해") {
  return {
    groupId: 701,
    name,
    description: "매일 한 지문씩 함께 읽어요.",
    role: "OWNER",
    memberCount: 1,
    createdAt: "2026-07-28T09:00:00+09:00",
    members: [
      {
        userId: user.userId,
        displayName: user.displayName,
        role: "OWNER",
        joinedAt: "2026-07-28T09:00:00+09:00",
      },
    ],
  };
}

async function mockApi(page, options = {}) {
  const state = {
    authenticated: options.authenticated || false,
    quizAvailable: options.quizAvailable !== false,
    attempts: [],
    reviewStatus: "PENDING",
    group: null,
  };

  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === "/api/csrf") {
      return route.fulfill({
        json: { headerName: "X-XSRF-TOKEN", parameterName: "_csrf", token: "e2e-token" },
      });
    }
    if (path === "/api/auth/me") {
      return state.authenticated
        ? route.fulfill({ json: user })
        : route.fulfill({
            status: 401,
            json: { code: "AUTHENTICATION_REQUIRED", message: "Authentication is required." },
          });
    }
    if (path === "/api/auth/login") {
      state.authenticated = true;
      return route.fulfill({ json: user });
    }
    if (path === "/api/quizzes/today" && method === "POST") {
      if (!state.quizAvailable) {
        return route.fulfill({
          status: 404,
          json: { code: "TODAY_QUIZ_NOT_FOUND", message: "오늘은 등록된 퀴즈가 없어요." },
        });
      }
      return route.fulfill({
        json: {
          quizSetId: 301,
          challengeDate: "2026-07-28",
          variantCode: "A",
          difficulty: "HIGH_SCHOOL_3",
          attempt: state.attempts.find((attempt) => attempt.attemptType === "PRIMARY") || null,
          attempts: state.attempts,
          bonusUnlocked: state.attempts.some((attempt) => attempt.attemptType === "PRIMARY"),
          passages,
        },
      });
    }
    if (/^\/api\/quizzes\/\d+\/attempts$/.test(path) && method === "POST") {
      const body = request.postDataJSON();
      const passage = passages.find((item) =>
        item.questions.some((question) => question.questionId === body.answers[0].questionId),
      );
      const attemptType = state.attempts.length === 0 ? "PRIMARY" : "BONUS";
      const answers = body.answers.map((answer) => {
        const question = passage.questions.find((item) => item.questionId === answer.questionId);
        const correctOptionId = question.options[0].optionId;
        const correct = answer.selectedOptionId === correctOptionId;
        return {
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
          correctOptionId,
          correct,
          explanation: correct ? "본문의 핵심 내용을 정확히 찾았습니다." : "본문의 근거를 다시 확인해 보세요.",
          evidence: passage.content,
        };
      });
      const score = answers.filter((answer) => answer.correct).length;
      const attemptId = 900 + state.attempts.length;
      const summary = {
        attemptId,
        passageId: passage.passageId,
        attemptType,
        score,
        totalQuestions: 3,
        wrongCount: 3 - score,
        completedAt: "2026-07-28T10:00:00+09:00",
      };
      state.attempts.push(summary);
      return route.fulfill({ json: { ...summary, quizSetId: 301, answers, sources: [] } });
    }
    if (path === "/api/orbit/streak") {
      return route.fulfill({ json: { currentStreak: 2, completedToday: state.attempts.length > 0 } });
    }
    if (path === "/api/orbit") {
      return route.fulfill({ json: createOrbit(state.reviewStatus === "RECOVERED") });
    }
    if (path === "/api/reviews" && method === "GET") {
      const filter = url.searchParams.get("status") || "OPEN";
      const recovered = state.reviewStatus === "RECOVERED";
      const includeReview = filter === "ALL" || (filter === "OPEN" && !recovered) || (filter === "RECOVERED" && recovered);
      return route.fulfill({
        json: {
          totalCount: 1,
          openCount: recovered ? 0 : 1,
          recoveredCount: recovered ? 1 : 0,
          reviews: includeReview ? [createReview(state.reviewStatus)] : [],
        },
      });
    }
    if (/^\/api\/reviews\/\d+$/.test(path) && method === "PATCH") {
      state.reviewStatus = request.postDataJSON().status;
      return route.fulfill({ status: 204 });
    }
    if (path === "/api/groups/my") {
      return route.fulfill({ json: state.group ? [state.group] : [] });
    }
    if (path === "/api/groups" && method === "POST") {
      state.group = createGroup(request.postDataJSON().name);
      return route.fulfill({ json: { group: state.group, inviteCode: "READ-2026" } });
    }
    if (/^\/api\/groups\/\d+$/.test(path) && method === "GET") {
      return route.fulfill({ json: state.group });
    }
    if (/^\/api\/groups\/\d+\/activity$/.test(path)) {
      return route.fulfill({
        json: {
          startDate: "2026-07-27",
          endDate: "2026-07-31",
          memberCount: 1,
          todayCompletedCount: 1,
          ranking: [
            {
              rank: 1,
              userId: user.userId,
              displayName: user.displayName,
              role: "OWNER",
              completedDays: 2,
              averageScore: 2.5,
              perfectCount: 1,
              recoveredCount: 1,
              fullyLitCount: 2,
              todayCompleted: true,
              activityScore: 27,
            },
          ],
        },
      });
    }
    if (/^\/api\/groups\/\d+\/invites$/.test(path) && method === "GET") {
      return route.fulfill({ json: [] });
    }

    return route.fulfill({ status: 404, json: { code: "E2E_UNMOCKED_API", message: `${method} ${path}` } });
  });

  return state;
}

async function login(page) {
  await page.goto("/");
  await page.getByLabel("아이디").fill("reader01");
  await page.getByLabel("PIN").fill("1234");
  await page.locator("form").getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/quiz\/?$/);
}

async function answerQuestions(page, optionIndexes = [0, 0, 0]) {
  const questions = page.locator("fieldset");
  for (let index = 0; index < 3; index += 1) {
    await questions.nth(index).getByRole("radio").nth(optionIndexes[index]).check();
  }
}

async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test("로그인 전에는 인증 화면을 표시한다", async ({ page }) => {
  await mockApi(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "오늘의 독해를 이어가세요" })).toBeVisible();
  await expect(page.getByLabel("아이디")).toBeVisible();
  await expect(page.getByLabel("PIN")).toBeVisible();
});

test("로그인 후 메뉴 URL과 브라우저 뒤로가기가 동작한다", async ({ page }) => {
  await mockApi(page, { quizAvailable: false });
  await login(page);

  await expect(page.getByRole("navigation", { name: "주요 화면" })).toBeVisible();
  await expect(page.getByText("오늘은 등록된 퀴즈가 없어요.")).toBeVisible();

  await page.getByRole("link", { name: "그룹" }).click();
  await expect(page).toHaveURL(/\/groups\/?$/);

  await page.getByRole("link", { name: "학습 기록" }).click();
  await expect(page).toHaveURL(/\/history\/?$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/groups\/?$/);
});

test("기본 지문을 마치면 남은 두 지문을 보너스로 풀 수 있다", async ({ page }) => {
  await mockApi(page);
  await login(page);

  await expect(page.getByRole("heading", { name: "오늘은 어떤 영역을 읽을까요?" })).toBeVisible();
  await page.getByRole("button", { name: new RegExp(passages[0].title) }).click();
  await answerQuestions(page, [0, 1, 0]);
  await page.getByRole("button", { name: "제출하고 채점" }).click();

  await expect(page.getByRole("heading", { name: "오답은 짧게 복습해 두세요" })).toBeVisible();
  await page.getByRole("button", { name: "다른 지문 보기" }).click();
  await expect(page.getByRole("heading", { name: "오늘 읽기는 여기까지 해도 충분해요" })).toBeVisible();
  await expect(page.getByText("보너스 3문제")).toHaveCount(2);

  await page.getByRole("button", { name: new RegExp(passages[1].title) }).click();
  await answerQuestions(page);
  await page.getByRole("button", { name: "제출하고 채점" }).click();
  await expect(page.getByRole("heading", { name: "보너스 지문까지 읽어냈어요" })).toBeVisible();
});

test("오답에서 지문을 확인하고 복습하면 학습 기록에 반영된다", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/wrong-answers");

  await expect(page.getByRole("heading", { name: passages[0].title })).toBeVisible();
  await expect(page.getByText(passages[0].content)).toBeVisible();
  await page.getByRole("button", { name: "복습 완료", exact: true }).click();
  await expect(page.getByRole("heading", { name: "쌓인 오답이 없어요" })).toBeVisible();

  await page.getByRole("link", { name: "학습 기록" }).click();
  await expect(page.getByRole("heading", { name: "학습 기록" })).toBeVisible();
  await expect(page.getByText("2/3 · 복습 1/1")).toBeVisible();
});

test("새 그룹을 만들면 멤버와 주간 랭킹을 확인할 수 있다", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/groups");

  await expect(page.getByRole("heading", { name: "함께 공부할 그룹을 시작하세요" })).toBeVisible();
  await page.getByRole("button", { name: "그룹 만들기" }).click();
  await expect(page.getByRole("heading", { name: "스터디 그룹 만들기" })).toBeVisible();
  await page.getByLabel("그룹 이름").fill("퇴근길 독해");
  await page.getByLabel(/소개/).fill("짧고 꾸준하게 읽는 모임");
  await page.getByRole("dialog").getByRole("button", { name: "그룹 만들기" }).click();

  await expect(page.getByRole("heading", { name: "퇴근길 독해" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "이번 주 랭킹" })).toBeVisible();
  await expect(page.getByText("27 pt")).toBeVisible();
});

test("핵심 화면이 가로로 넘치지 않는다", async ({ page }) => {
  await mockApi(page, { authenticated: true });

  await page.goto("/quiz");
  await expect(page.getByRole("heading", { name: "오늘은 어떤 영역을 읽을까요?" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/groups");
  await expect(page.getByRole("heading", { name: "함께 공부할 그룹을 시작하세요" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.goto("/wrong-answers");
  await expect(page.getByRole("heading", { name: passages[0].title })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("quiz text and options keep readable dimensions", async ({ page }, testInfo) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/quiz");
  await page.getByRole("button", { name: new RegExp(passages[0].title) }).click();

  const passageMetrics = await page.locator("article p").first().evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      fontSize: Number.parseFloat(style.fontSize),
      lineHeight: Number.parseFloat(style.lineHeight),
      width: element.getBoundingClientRect().width,
    };
  });
  const optionHeight = await page.locator("fieldset label").first().evaluate((element) =>
    element.getBoundingClientRect().height,
  );

  expect(passageMetrics.fontSize).toBeGreaterThanOrEqual(17);
  expect(passageMetrics.lineHeight / passageMetrics.fontSize).toBeGreaterThanOrEqual(1.8);
  expect(passageMetrics.width).toBeLessThanOrEqual(760);
  expect(optionHeight).toBeGreaterThanOrEqual(56);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("quiz-readability.png"), fullPage: true });
});

test("quiz draft is restored after reload", async ({ page }) => {
  await mockApi(page, { authenticated: true });
  await page.goto("/quiz");
  await page.getByRole("button", { name: new RegExp(passages[0].title) }).click();

  const selectedOption = page.locator("fieldset").first().getByRole("radio").nth(1);
  await selectedOption.check();
  await page.reload();

  await expect(page.getByRole("heading", { name: passages[0].title })).toBeVisible();
  await expect(page.locator("fieldset").first().getByRole("radio").nth(1)).toBeChecked();
});

test("mobile progress and passage review stay available", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "mobile only");

  await mockApi(page, { authenticated: true });
  await page.goto("/quiz");
  await page.getByRole("button", { name: new RegExp(passages[0].title) }).click();

  const tools = page.getByTestId("mobile-quiz-tools");
  await expect(tools).toBeVisible();
  await expect(tools).toContainText("0 / 3 답변");
  await page.locator("fieldset").first().getByRole("radio").first().check();
  await expect(tools).toContainText("1 / 3 답변");
  await page.screenshot({ path: testInfo.outputPath("mobile-quiz-progress.png"), fullPage: true });

  await page.getByTestId("open-passage-review").click();
  const dialog = page.getByTestId("mobile-passage-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(passages[0].content);
  await page.screenshot({ path: testInfo.outputPath("mobile-passage-review.png") });
  await page.getByTestId("close-passage-review").click();
  await expect(dialog).toBeHidden();
});
