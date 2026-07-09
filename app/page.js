"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Clock3,
  LogIn,
  LogOut,
  Orbit,
  Rocket,
  Send,
  Sparkles,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import styles from "./page.module.css";

const WEEKDAYS = ["월", "화", "수", "목", "금"];

function formatToday() {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
}

function getErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  }

  const messages = {
    INVALID_CREDENTIALS: "아이디 또는 PIN을 확인해 주세요.",
    LOGIN_NAME_ALREADY_EXISTS: "이미 사용 중인 아이디예요.",
    INVALID_REQUEST: "입력한 내용을 다시 확인해 주세요.",
    TODAY_QUIZ_NOT_FOUND: "오늘은 등록된 퀴즈가 없어요.",
    QUIZ_ALREADY_COMPLETED: "오늘 퀴즈는 이미 완료했어요.",
    AUTHENTICATION_REQUIRED: "다시 로그인해 주세요.",
  };
  return messages[error.code] || "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.brandMark}>
        <Orbit size={24} strokeWidth={2.2} />
      </span>
      <span>
        <strong>TRI:READ</strong>
        <small>Study Orbit</small>
      </span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className={styles.loadingScreen}>
      <Brand />
      <span className={styles.loadingLine} />
    </main>
  );
}

function AuthScreen({ mode, onModeChange, onAuthenticated, initialError }) {
  const [loginName, setLoginName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(initialError || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload =
        mode === "signup"
          ? { loginName, displayName, pin }
          : { loginName, pin };
      const user = await apiFetch(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onAuthenticated(user);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    setError("");
    onModeChange(nextMode);
  }

  return (
    <main className={styles.authShell}>
      <section className={styles.authVisual} aria-label="TRI:READ weekday orbit">
        <Brand />
        <div className={styles.orbitVisual} aria-hidden="true">
          <span className={styles.orbitLineOne} />
          <span className={styles.orbitLineTwo} />
          <span className={styles.orbitPlanet}>
            <BookOpen size={27} />
          </span>
          <span className={styles.starOne} />
          <span className={styles.starTwo} />
          <span className={styles.starThree} />
        </div>
        <div className={styles.authOrbitCopy}>
          <p>이번 주의 궤도</p>
          <div className={styles.weekOrbit}>
            {WEEKDAYS.map((day, index) => (
              <span key={day} className={index === new Date().getDay() - 1 ? styles.todayDot : ""}>
                <i />
                {day}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.mobileBrand}>
          <Brand />
        </div>
        <div className={styles.authFormWrap}>
          <p className={styles.eyebrow}>WEEKDAY READING</p>
          <h1>{mode === "login" ? "오늘의 독해를 이어가세요" : "나만의 궤도를 시작하세요"}</h1>

          <div className={styles.authTabs} role="tablist" aria-label="인증 방식">
            <button
              type="button"
              className={mode === "login" ? styles.authTabActive : styles.authTab}
              onClick={() => changeMode("login")}
            >
              <LogIn size={17} />
              로그인
            </button>
            <button
              type="button"
              className={mode === "signup" ? styles.authTabActive : styles.authTab}
              onClick={() => changeMode("signup")}
            >
              <UserPlus size={17} />
              회원가입
            </button>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit}>
            <label>
              아이디
              <input
                type="text"
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                minLength={4}
                maxLength={30}
                pattern="[A-Za-z0-9._-]+"
                autoComplete="username"
                placeholder="reader01"
                required
              />
            </label>

            {mode === "signup" && (
              <label>
                표시 이름
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={30}
                  autoComplete="nickname"
                  placeholder="독해러"
                  required
                />
              </label>
            )}

            <label>
              PIN
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                minLength={4}
                maxLength={12}
                inputMode="numeric"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="숫자 4~12자리"
                required
              />
            </label>

            {error && <p className={styles.formError}>{error}</p>}

            <button className={styles.submitButton} type="submit" disabled={submitting}>
              {submitting ? "연결 중..." : mode === "login" ? "로그인" : "회원가입"}
              {!submitting && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function WeekOrbit({ completed }) {
  const currentDay = new Date().getDay() - 1;

  return (
    <div className={styles.railOrbit}>
      <div className={styles.railTitle}>
        <span>이번 주</span>
        <Sparkles size={16} />
      </div>
      <div className={styles.railDays}>
        {WEEKDAYS.map((day, index) => {
          const isToday = index === currentDay;
          return (
            <span key={day} className={isToday ? styles.railDayToday : styles.railDay}>
              <i className={isToday && completed ? styles.dayComplete : ""}>
                {isToday && completed && <Check size={13} />}
              </i>
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function QuizRail({ quiz, selectedCount, activePassage, onPassageChange, result }) {
  return (
    <aside className={styles.studyRail}>
      <div className={styles.dateBlock}>
        <CalendarDays size={18} />
        <div>
          <span>오늘</span>
          <strong>{formatToday()}</strong>
        </div>
      </div>

      <div className={styles.progressBlock}>
        <div>
          <span>진행률</span>
          <strong>{result ? 9 : selectedCount} / 9</strong>
        </div>
        <div className={styles.progressTrack}>
          <span style={{ width: `${((result ? 9 : selectedCount) / 9) * 100}%` }} />
        </div>
      </div>

      <nav className={styles.passageNav} aria-label="지문 선택">
        {quiz.passages.map((passage, index) => (
          <button
            key={passage.passageId}
            type="button"
            className={activePassage === index ? styles.passageNavActive : styles.passageNavItem}
            onClick={() => onPassageChange(index)}
          >
            <span>{index + 1}</span>
            <div>
              <strong>{passage.topic}</strong>
              <small>{passage.title}</small>
            </div>
            <ChevronRight size={16} />
          </button>
        ))}
      </nav>

      <WeekOrbit completed={Boolean(result || quiz.attempt)} />
    </aside>
  );
}

function QuestionBlock({ question, number, selectedOptionId, onSelect, resultItem }) {
  return (
    <fieldset className={styles.questionBlock}>
      <legend>
        <span>Q{number}</span>
        {question.content}
      </legend>

      <div className={styles.optionList}>
        {question.options.map((option) => {
          const isSelected = selectedOptionId === option.optionId;
          const isCorrectAnswer = resultItem?.correctOptionId === option.optionId;
          const isWrongSelection = resultItem && isSelected && !resultItem.correct;
          return (
            <label
              key={option.optionId}
              className={`${styles.optionItem} ${isSelected ? styles.optionSelected : ""} ${
                isCorrectAnswer ? styles.optionCorrect : ""
              } ${isWrongSelection ? styles.optionWrong : ""}`}
            >
              <input
                type="radio"
                name={`question-${question.questionId}`}
                checked={isSelected}
                onChange={() => onSelect(question.questionId, option.optionId)}
                disabled={Boolean(resultItem)}
              />
              <span className={styles.optionNumber}>{option.position}</span>
              <span className={styles.optionText}>{option.content}</span>
              {isCorrectAnswer && <CheckCircle2 size={18} />}
              {isWrongSelection && <XCircle size={18} />}
            </label>
          );
        })}
      </div>

      {resultItem && (
        <div className={resultItem.correct ? styles.explanationCorrect : styles.explanationWrong}>
          <strong>{resultItem.correct ? "정답" : "오답"}</strong>
          <p>{resultItem.explanation}</p>
          {resultItem.evidence && <small>{resultItem.evidence}</small>}
        </div>
      )}
    </fieldset>
  );
}

function QuizWorkspace({
  quiz,
  selections,
  onSelect,
  activePassage,
  setActivePassage,
  result,
  onSubmit,
  submitting,
  submitError,
}) {
  const passage = quiz.passages[activePassage];
  const resultByQuestion = useMemo(
    () => new Map((result?.answers || []).map((answer) => [answer.questionId, answer])),
    [result],
  );
  const firstQuestionNumber = activePassage * 3 + 1;
  const selectedCount = Object.keys(selections).length;
  const isLastPassage = activePassage === quiz.passages.length - 1;

  return (
    <section className={styles.quizWorkspace}>
      {result && (
        <header className={styles.resultBanner}>
          <div className={styles.scoreOrb}>
            <strong>{result.score}</strong>
            <span>/ 9</span>
          </div>
          <div>
            <p className={styles.eyebrow}>TODAY COMPLETE</p>
            <h1>{result.score >= 7 ? "안정적인 궤도에 올랐어요" : "오답이 다음 궤도를 만들어요"}</h1>
            <span>정답 {result.score}개 · 복습 {result.wrongCount}개</span>
          </div>
        </header>
      )}

      <div className={styles.quizHeading}>
        <div>
          <p className={styles.eyebrow}>PASSAGE {activePassage + 1}</p>
          <h1>{passage.title}</h1>
        </div>
        <span className={styles.topicBadge}>{passage.topic}</span>
      </div>

      <div className={styles.readingLayout}>
        <article className={styles.passageText}>
          <div className={styles.readingMeta}>
            <BookOpen size={18} />
            <span>고3 고정 난이도</span>
            <Clock3 size={17} />
            <span>권장 15분</span>
          </div>
          <p>{passage.content}</p>
        </article>

        <div className={styles.questionsPane}>
          {passage.questions.map((question, index) => (
            <QuestionBlock
              key={question.questionId}
              question={question}
              number={firstQuestionNumber + index}
              selectedOptionId={selections[question.questionId]}
              onSelect={onSelect}
              resultItem={resultByQuestion.get(question.questionId)}
            />
          ))}
        </div>
      </div>

      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <footer className={styles.quizFooter}>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => setActivePassage((current) => current - 1)}
          disabled={activePassage === 0}
        >
          <ArrowLeft size={18} />
          이전 지문
        </button>

        <span>{activePassage + 1} / 3</span>

        {!isLastPassage ? (
          <button
            className={styles.primaryButton}
            type="button"
            onClick={() => setActivePassage((current) => current + 1)}
          >
            다음 지문
            <ArrowRight size={18} />
          </button>
        ) : !result ? (
          <button
            className={styles.primaryButton}
            type="button"
            onClick={onSubmit}
            disabled={selectedCount !== 9 || submitting}
          >
            {submitting ? "채점 중..." : selectedCount === 9 ? "제출하고 채점" : `${9 - selectedCount}문제 남음`}
            {!submitting && <Send size={17} />}
          </button>
        ) : (
          <span className={styles.completeLabel}>
            <CheckCircle2 size={18} />
            오늘 완료
          </span>
        )}
      </footer>
    </section>
  );
}

function CompletedView({ quiz }) {
  return (
    <section className={styles.completedView}>
      <div className={styles.completedIcon}>
        <Rocket size={29} />
      </div>
      <p className={styles.eyebrow}>TODAY COMPLETE</p>
      <h1>오늘의 궤도를 완성했어요</h1>
      <div className={styles.completedScore}>
        <strong>{quiz.attempt.score}</strong>
        <span>/ 9</span>
      </div>
      <p>세 지문의 기록이 저장됐어요. 내일 새로운 독해로 이어집니다.</p>
      <div className={styles.completedPassages}>
        {quiz.passages.map((passage, index) => (
          <span key={passage.passageId}>
            <i>{index + 1}</i>
            {passage.topic}
          </span>
        ))}
      </div>
    </section>
  );
}

function EmptyQuiz({ message, onRetry }) {
  return (
    <section className={styles.emptyQuiz}>
      <span>
        <Orbit size={30} />
      </span>
      <h1>오늘의 퀴즈를 불러오지 못했어요</h1>
      <p>{message}</p>
      <button className={styles.secondaryButton} type="button" onClick={onRetry}>
        다시 확인
      </button>
    </section>
  );
}

function AppHeader({ user, onLogout, loggingOut }) {
  return (
    <header className={styles.appHeader}>
      <Brand />
      <div className={styles.headerActions}>
        <span className={styles.userBadge}>
          <CircleUserRound size={18} />
          {user.displayName}
        </span>
        <button
          className={styles.iconButton}
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          aria-label="로그아웃"
          title="로그아웃"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

export default function Home() {
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [activePassage, setActivePassage] = useState(0);
  const [selections, setSelections] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function loadQuiz() {
    setQuizLoading(true);
    setQuizError("");
    try {
      const todayQuiz = await apiFetch("/api/quizzes/today");
      setQuiz(todayQuiz);
      setSelections({});
      setResult(null);
      setActivePassage(0);
    } catch (error) {
      setQuiz(null);
      setQuizError(getErrorMessage(error));
    } finally {
      setQuizLoading(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        const currentUser = await apiFetch("/api/auth/me");
        setUser(currentUser);
        await loadQuiz();
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) {
          setBootError("백엔드 서버 연결을 확인해 주세요.");
        }
      } finally {
        setBooting(false);
      }
    }
    bootstrap();
  }, []);

  async function handleAuthenticated(authenticatedUser) {
    setUser(authenticatedUser);
    setBootError("");
    await loadQuiz();
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setQuiz(null);
      setResult(null);
      setSelections({});
      setLoggingOut(false);
    }
  }

  function handleSelect(questionId, optionId) {
    if (result) {
      return;
    }
    setSelections((current) => ({ ...current, [questionId]: optionId }));
    setSubmitError("");
  }

  async function handleSubmit() {
    if (!quiz || Object.keys(selections).length !== 9) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    const answers = quiz.passages.flatMap((passage) =>
      passage.questions.map((question) => ({
        questionId: question.questionId,
        selectedOptionId: selections[question.questionId],
      })),
    );

    try {
      const quizResult = await apiFetch(`/api/quizzes/${quiz.quizSetId}/attempts`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(quizResult);
      setActivePassage(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (booting) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthenticated={handleAuthenticated}
        initialError={bootError}
      />
    );
  }

  return (
    <main className={styles.appShell}>
      <AppHeader user={user} onLogout={handleLogout} loggingOut={loggingOut} />

      {quizLoading ? (
        <section className={styles.quizLoading}>
          <Orbit size={28} />
          오늘의 지문을 불러오는 중...
        </section>
      ) : quiz ? (
        quiz.attempt && !result ? (
          <div className={styles.appBody}>
            <QuizRail
              quiz={quiz}
              selectedCount={9}
              activePassage={activePassage}
              onPassageChange={setActivePassage}
              result={quiz.attempt}
            />
            <CompletedView quiz={quiz} />
          </div>
        ) : (
          <div className={styles.appBody}>
            <QuizRail
              quiz={quiz}
              selectedCount={Object.keys(selections).length}
              activePassage={activePassage}
              onPassageChange={setActivePassage}
              result={result}
            />
            <QuizWorkspace
              quiz={quiz}
              selections={selections}
              onSelect={handleSelect}
              activePassage={activePassage}
              setActivePassage={setActivePassage}
              result={result}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          </div>
        )
      ) : (
        <EmptyQuiz message={quizError} onRetry={loadQuiz} />
      )}
    </main>
  );
}
