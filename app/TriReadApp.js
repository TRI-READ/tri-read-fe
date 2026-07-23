"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Atom,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Copy,
  Crown,
  Clock3,
  Database,
  ExternalLink,
  Flame,
  FileText,
  Gauge,
  History,
  KeyRound,
  Landmark,
  LockKeyhole,
  LogIn,
  LogOut,
  NotebookPen,
  Orbit,
  Plus,
  RefreshCw,
  RotateCcw,
  Rocket,
  Scale,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Power,
  UserCog,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, apiFetch, resetCsrfToken } from "@/lib/api";
import styles from "./page.module.css";

const WEEKDAYS = ["월", "화", "수", "목", "금"];
const PASSAGE_AREAS = [
  {
    label: "인문·사회",
    description: "사상, 사회 구조와 인간을 읽어요.",
    icon: Landmark,
  },
  {
    label: "과학·기술",
    description: "원리, 기술과 자연 현상을 읽어요.",
    icon: Atom,
  },
  {
    label: "경제·법·융합",
    description: "제도, 시장과 복합 쟁점을 읽어요.",
    icon: Scale,
  },
];

const VIEW_PATHS = {
  quiz: "/quiz",
  groups: "/groups",
  orbit: "/history",
  reviews: "/wrong-answers",
  admin: "/admin",
};

const PATH_VIEWS = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([view, path]) => [path, view]),
);

function getViewFromPathname(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  return PATH_VIEWS[normalizedPath] || "quiz";
}

function formatToday() {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDuration(seconds = 0) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}일 ${hours}시간`;
  if (hours) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

function formatBytes(bytes = 0) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(bytes > 1024 ** 3 ? 0 : 1)} MB`;
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
    QUIZ_ALREADY_COMPLETED: "이미 완료한 지문이에요. 다른 영역을 골라 주세요.",
    AUTHENTICATION_REQUIRED: "다시 로그인해 주세요.",
    GROUP_ALREADY_JOINED: "이미 참여 중인 그룹이에요.",
    GROUP_NOT_FOUND: "그룹을 찾을 수 없어요.",
    GROUP_OWNER_REQUIRED: "그룹 소유자만 초대 코드를 바꿀 수 있어요.",
    INVALID_INVITE_CODE: "초대 코드가 올바르지 않거나 만료됐어요.",
    ANSWER_REVIEW_NOT_FOUND: "오답 기록을 찾을 수 없어요.",
    INVALID_REVIEW_FILTER: "오답 필터를 다시 확인해 주세요.",
    INVALID_REVIEW_STATUS: "복습 상태를 변경하지 못했어요.",
    INVALID_APP_ROLE: "사용자 권한을 다시 확인해 주세요.",
    CANNOT_DEMOTE_SELF: "현재 로그인한 관리자는 직접 권한을 내릴 수 없어요.",
    LAST_ADMIN_REQUIRED: "활성 관리자 계정은 최소 1개가 필요해요.",
    USER_NOT_FOUND: "사용자를 찾을 수 없어요.",
    APP_ROLE_UPDATE_FAILED: "사용자 권한을 변경하지 못했어요.",
    QUIZ_DATE_INVENTORY_FULL: "선택한 날짜에는 이미 퀴즈 3세트가 준비되어 있어요.",
    GENERATION_LOG_NOT_FOUND: "생성 기록을 찾을 수 없어요.",
    GENERATION_RETRY_NOT_ALLOWED: "실패한 생성 기록만 다시 실행할 수 있어요.",
    QUIZ_GENERATION_FAILED: "자동 생성이 검증을 통과하지 못했어요. 기록에서 원인을 확인해 주세요.",
    GEMINI_API_KEY_MISSING: "서버에 Gemini API 키가 설정되어 있지 않아요.",
    GEMINI_RATE_LIMITED: "Gemini 호출 한도에 도달했어요. 잠시 뒤 다시 시도해 주세요.",
    GEMINI_UNAVAILABLE: "Gemini가 일시적으로 응답하지 않아요.",
    QUIZ_GENERATION_API_DAILY_LIMIT_REACHED: "오늘 설정한 Gemini 호출 한도를 모두 사용했어요.",
    TOO_MANY_LOGIN_ATTEMPTS: "로그인 시도가 너무 많아요. 10분 뒤 다시 시도해 주세요.",
    CURRENT_PIN_INCORRECT: "현재 PIN이 올바르지 않아요.",
    PIN_REUSE_NOT_ALLOWED: "새 PIN은 현재 PIN과 달라야 해요.",
    PIN_CHANGE_FAILED: "PIN을 변경하지 못했어요. 다시 시도해 주세요.",
    USER_DISABLED: "사용이 중지된 계정이에요.",
    CANNOT_DISABLE_SELF: "현재 로그인한 관리자 계정은 중지할 수 없어요.",
    USER_STATUS_UPDATE_FAILED: "계정 상태를 변경하지 못했어요.",
    PIN_RESET_FAILED: "PIN을 초기화하지 못했어요.",
    GROUP_INVITE_NOT_FOUND: "초대 코드를 찾을 수 없어요.",
    GROUP_MEMBER_NOT_FOUND: "그룹 멤버를 찾을 수 없어요.",
    OWNER_CANNOT_BE_REMOVED: "그룹 소유자는 바로 제외할 수 없어요. 먼저 소유권을 넘겨 주세요.",
    ALREADY_GROUP_OWNER: "이미 그룹 소유자인 사용자예요.",
    GROUP_OWNER_TRANSFER_FAILED: "그룹 소유권을 이전하지 못했어요.",
    INVALID_INVITE_POLICY: "초대 기간과 사용 횟수를 다시 확인해 주세요.",
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
      <section className={styles.authVisual} aria-label="TRI:READ 서비스 소개">
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
        <div className={styles.authIntro}>
          <p className={styles.authIntroEyebrow}>DAILY READING</p>
          <h2>하루 한 편, 부담 없이 읽어요</h2>
          <p className={styles.authIntroDescription}>
            세 영역 중 하나를 골라 지문 1개와 문제 3개를 풉니다.
          </p>
          <div className={styles.authFacts} aria-label="학습 구성">
            <span><strong>1</strong> 지문</span>
            <span><strong>3</strong> 문제</span>
            <span><strong>10~15</strong>분</span>
          </div>
          <div className={styles.authAreas} aria-label="선택 가능한 영역">
            {PASSAGE_AREAS.map(({ label, icon: Icon }) => (
              <span key={label}>
                <Icon size={15} />
                {label}
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
          <h1>{mode === "login" ? "오늘의 독해를 이어가세요" : "가벼운 독해 습관을 시작하세요"}</h1>

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

function WeekOrbit({ days = [] }) {
  const completedDates = new Set(
    days.filter((day) => day.score !== null).map((day) => day.date),
  );
  const orbitDates = new Map(days.map((day, index) => [index, day.date]));
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  return (
    <div className={styles.railOrbit}>
      <div className={styles.railTitle}>
        <span>이번 주</span>
        <Sparkles size={16} />
      </div>
      <div className={styles.railDays}>
        {WEEKDAYS.map((day, index) => {
          const date = orbitDates.get(index);
          const isToday = date === today;
          const isCompleted = completedDates.has(date);
          return (
            <span
              key={day}
              className={isToday ? styles.railDayToday : styles.railDay}
              title={`${day}요일 ${isCompleted ? "학습 완료" : "미완료"}`}
            >
              <i className={isCompleted ? styles.dayComplete : ""}>
                {isCompleted && <Check size={13} />}
              </i>
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function getQuizAttempts(quiz) {
  if (Array.isArray(quiz.attempts) && quiz.attempts.length > 0) {
    return quiz.attempts;
  }
  return quiz.attempt ? [quiz.attempt] : [];
}

function PassagePicker({ quiz, onChoose }) {
  const attempts = getQuizAttempts(quiz);
  const attemptsByPassage = new Map(attempts.map((attempt) => [attempt.passageId, attempt]));
  const primaryCompleted = attempts.some((attempt) => attempt.attemptType === "PRIMARY") || Boolean(quiz.attempt);
  const allCompleted = attempts.length === quiz.passages.length;

  return (
    <section className={styles.passagePicker}>
      <header className={styles.passagePickerHeader}>
        <p className={styles.eyebrow}>{primaryCompleted ? "TODAY COMPLETE" : "TODAY'S READING"}</p>
        <h1>
          {allCompleted
            ? "오늘 준비된 글을 모두 읽었어요"
            : primaryCompleted
              ? "오늘 읽기는 여기까지 해도 충분해요"
              : "오늘은 어떤 영역을 읽을까요?"}
        </h1>
        <p>
          {allCompleted
            ? "기본 1편과 보너스 2편을 모두 마쳤습니다. 읽은 글은 아래에서 다시 볼 수 있어요."
            : primaryCompleted
              ? "기본 학습을 마쳤어요. 더 읽고 싶은 날에는 남은 영역을 보너스로 풀어보세요."
              : "하나를 골라 3문제만 풀어요. 예상 시간은 10~15분입니다."}
        </p>
        {primaryCompleted && (
          <div className={styles.passageProgress}>
            <span><CheckCircle2 size={17} /> 오늘 기본 학습 완료</span>
            <strong>{attempts.length} / {quiz.passages.length} 지문</strong>
          </div>
        )}
      </header>
      <div className={styles.passageChoiceGrid}>
        {quiz.passages.map((passage, index) => {
          const area = PASSAGE_AREAS[index] || PASSAGE_AREAS[0];
          const AreaIcon = area.icon;
          const attempt = attemptsByPassage.get(passage.passageId);

          if (attempt) {
            return (
              <article
                className={`${styles.passageChoice} ${styles.passageChoiceCompleted}`}
                key={passage.passageId}
              >
                <span className={styles.passageChoiceIcon}><Check size={23} /></span>
                <span className={styles.passageChoiceBody}>
                  <small>{area.label}</small>
                  <strong>{passage.title}</strong>
                  <p>{area.description}</p>
                </span>
                <span className={styles.passageChoiceMeta}>
                  {attempt.attemptType === "PRIMARY" ? "기본 완료" : "보너스 완료"}
                  <b>{attempt.score} / {attempt.totalQuestions || 3}</b>
                </span>
              </article>
            );
          }

          return (
            <button
              className={styles.passageChoice}
              key={passage.passageId}
              type="button"
              onClick={() => onChoose(index)}
            >
              <span className={styles.passageChoiceIcon}><AreaIcon size={23} /></span>
              <span className={styles.passageChoiceBody}>
                <small>{area.label}{primaryCompleted ? " · BONUS" : ""}</small>
                <strong>{passage.title}</strong>
                <p>{area.description}</p>
              </span>
              <span className={styles.passageChoiceMeta}>
                {primaryCompleted ? "보너스 3문제" : "3문제 · 약 15분"}
                <ChevronRight size={16} />
              </span>
            </button>
          );
        })}
      </div>
      {attempts.length > 0 && <CompletedView quiz={quiz} attempts={attempts} />}
    </section>
  );
}

function QuizRail({ quiz, selectedCount, activePassage, onChangeArea, result, weekOrbit }) {
  const passage = quiz.passages[activePassage];
  const area = PASSAGE_AREAS[activePassage] || PASSAGE_AREAS[0];
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
          <strong>{result ? 3 : selectedCount} / 3</strong>
        </div>
        <div className={styles.progressTrack}>
          <span style={{ width: `${((result ? 3 : selectedCount) / 3) * 100}%` }} />
        </div>
      </div>

      <div className={styles.selectedArea}>
        <small>선택한 영역</small>
        <strong>{area.label}</strong>
        <span>{passage.title}</span>
        {!result && (
          <button type="button" onClick={onChangeArea}>영역 변경</button>
        )}
      </div>

      <WeekOrbit days={weekOrbit?.days} />
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
  result,
  onSubmit,
  submitting,
  submitError,
  onContinue,
}) {
  const passage = quiz.passages[activePassage];
  const resultByQuestion = useMemo(
    () => new Map((result?.answers || []).map((answer) => [answer.questionId, answer])),
    [result],
  );
  const selectedCount = Object.keys(selections).length;
  const area = PASSAGE_AREAS[activePassage] || PASSAGE_AREAS[0];

  return (
    <section className={styles.quizWorkspace}>
      {result && (
        <header className={styles.resultBanner}>
          <div className={styles.scoreOrb}>
            <strong>{result.score}</strong>
            <span>/ 3</span>
          </div>
          <div>
            <p className={styles.eyebrow}>{result.attemptType === "BONUS" ? "BONUS COMPLETE" : "TODAY COMPLETE"}</p>
            <h1>
              {result.attemptType === "BONUS"
                ? "보너스 지문까지 읽어냈어요"
                : result.score === 3
                  ? "오늘 학습을 깔끔하게 마쳤어요"
                  : "오답은 짧게 복습해 두세요"}
            </h1>
            <span>정답 {result.score}개 · 복습 {result.wrongCount}개</span>
          </div>
        </header>
      )}

      <div className={styles.quizHeading}>
        <div>
          <p className={styles.eyebrow}>{area.label}</p>
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
              number={index + 1}
              selectedOptionId={selections[question.questionId]}
              onSelect={onSelect}
              resultItem={resultByQuestion.get(question.questionId)}
            />
          ))}
        </div>
      </div>

      {result && result.sources?.length > 0 && (
        <section className={styles.quizSources}>
          <div>
            <p className={styles.eyebrow}>REFERENCES</p>
            <h2>이 지문을 만들 때 참고한 자료</h2>
            <span>문장을 그대로 옮기지 않고 핵심 사실을 바탕으로 새로 구성했어요.</span>
          </div>
          <ul>
            {result.sources.map((source) => (
              <li key={source.sourceUrl}>
                <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                  <strong>{source.title}</strong>
                  <span>{source.publisher}{source.publishedOn ? ` · ${source.publishedOn}` : ""}</span>
                  <ExternalLink size={15} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <footer className={styles.quizFooter}>
        <span>한 지문 · 3문제</span>
        {!result ? (
          <button
            className={styles.primaryButton}
            type="button"
            onClick={onSubmit}
            disabled={selectedCount !== 3 || submitting}
          >
            {submitting ? "채점 중..." : selectedCount === 3 ? "제출하고 채점" : `${3 - selectedCount}문제 남음`}
            {!submitting && <Send size={17} />}
          </button>
        ) : (
          <button className={styles.secondaryButton} type="button" onClick={onContinue}>
            <ArrowLeft size={17} />
            다른 지문 보기
          </button>
        )}
      </footer>
    </section>
  );
}

function CompletedView({ quiz, attempts = getQuizAttempts(quiz) }) {
  const attemptsByPassage = new Map(attempts.map((attempt) => [attempt.passageId, attempt]));
  const completedPassages = quiz.passages.filter((passage) => attemptsByPassage.has(passage.passageId));

  return (
    <section className={styles.completedView}>
      <div className={styles.completedReadingList}>
        <div className={styles.completedReadingHeading}>
          <div>
            <p className={styles.eyebrow}>TODAY'S READING</p>
            <h2>오늘 읽은 글</h2>
          </div>
          <span>{completedPassages.length}개 지문</span>
        </div>

        {completedPassages.map((passage) => {
          const area = PASSAGE_AREAS[(passage.position || 1) - 1] || PASSAGE_AREAS[0];
          const attempt = attemptsByPassage.get(passage.passageId);
          return (
            <details className={styles.completedReading} key={passage.passageId}>
              <summary>
                <div>
                  <small>{area.label}</small>
                  <h3>{passage.title}</h3>
                </div>
                <span className={styles.completedReadingScore}>
                  {attempt.attemptType === "PRIMARY" ? "기본" : "보너스"} · {attempt.score}/{attempt.totalQuestions || 3}
                  <ChevronRight size={18} />
                </span>
              </summary>

              <p className={styles.completedPassageText}>{passage.content}</p>

              <details className={styles.completedQuestions}>
                <summary>
                  <span>
                    <NotebookPen size={17} />
                    오늘 문제 {passage.questions.length}개 다시 보기
                  </span>
                  <ChevronRight size={17} />
                </summary>
                <ol>
                  {passage.questions.map((question) => (
                    <li key={question.questionId}>
                      <strong>{question.content}</strong>
                      <ul>
                        {question.options.map((option, optionIndex) => (
                          <li key={option.optionId}>
                            <span>{optionIndex + 1}</span>
                            {option.content}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </details>
            </details>
          );
        })}
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

function GroupActionDialog({ mode, onClose, onSubmit, submitting, error }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    setName("");
    setDescription("");
    setInviteCode("");
  }, [mode]);

  if (!mode) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(
      mode === "create"
        ? { name, description: description || null }
        : { inviteCode },
    );
  }

  const creating = mode === "create";
  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <section className={styles.groupDialog} role="dialog" aria-modal="true" aria-labelledby="group-dialog-title">
        <header>
          <div>
            <p className={styles.eyebrow}>{creating ? "NEW GROUP" : "JOIN GROUP"}</p>
            <h2 id="group-dialog-title">{creating ? "스터디 그룹 만들기" : "초대 코드로 참여하기"}</h2>
          </div>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="닫기" title="닫기">
            <X size={18} />
          </button>
        </header>

        <form className={styles.groupForm} onSubmit={handleSubmit}>
          {creating ? (
            <>
              <label>
                그룹 이름
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={100}
                  placeholder="평일 독해 모임"
                  autoFocus
                  required
                />
              </label>
              <label>
                소개 <small>선택</small>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  placeholder="함께 공부할 그룹을 소개해 주세요."
                  rows={4}
                />
              </label>
            </>
          ) : (
            <label>
              초대 코드
              <input
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                maxLength={20}
                pattern="[A-Za-z0-9 -]+"
                placeholder="ABCDE-FGHIJ"
                autoFocus
                required
              />
            </label>
          )}

          {error && <p className={styles.formError}>{error}</p>}
          <button className={styles.primaryButton} type="submit" disabled={submitting}>
            {submitting ? "처리 중..." : creating ? "그룹 만들기" : "그룹 참여하기"}
            {!submitting && (creating ? <Plus size={17} /> : <KeyRound size={17} />)}
          </button>
        </form>
      </section>
    </div>
  );
}

function AccountPinDialog({ open, onClose, onChanged }) {
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setCurrentPin("");
      setNewPin("");
      setConfirmPin("");
      setError("");
    }
  }, [open]);

  if (!open) return null;

  async function submit(event) {
    event.preventDefault();
    if (newPin !== confirmPin) {
      setError("새 PIN 확인이 일치하지 않아요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/api/auth/pin", {
        method: "PATCH",
        body: JSON.stringify({ currentPin, newPin }),
      });
      onChanged();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <section className={styles.groupDialog} role="dialog" aria-modal="true" aria-labelledby="pin-dialog-title">
        <header>
          <div><p className={styles.eyebrow}>ACCOUNT SECURITY</p><h2 id="pin-dialog-title">PIN 변경</h2></div>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="닫기" title="닫기"><X size={18} /></button>
        </header>
        <form className={styles.groupForm} onSubmit={submit}>
          <label>현재 PIN<input type="password" inputMode="numeric" pattern="[0-9]{4,12}" value={currentPin} onChange={(event) => setCurrentPin(event.target.value)} autoComplete="current-password" required autoFocus /></label>
          <label>새 PIN<input type="password" inputMode="numeric" pattern="[0-9]{4,12}" value={newPin} onChange={(event) => setNewPin(event.target.value)} autoComplete="new-password" required /></label>
          <label>새 PIN 확인<input type="password" inputMode="numeric" pattern="[0-9]{4,12}" value={confirmPin} onChange={(event) => setConfirmPin(event.target.value)} autoComplete="new-password" required /></label>
          <p className={styles.formHint}>변경 후 모든 기기에서 로그아웃됩니다.</p>
          {error && <p className={styles.formError}>{error}</p>}
          <button className={styles.primaryButton} type="submit" disabled={submitting}>{submitting ? "변경 중..." : "PIN 변경"}<KeyRound size={17} /></button>
        </form>
      </section>
    </div>
  );
}

function InvitePolicyDialog({ open, submitting, error, onClose, onSubmit }) {
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [maxUses, setMaxUses] = useState(20);
  const [revokeExisting, setRevokeExisting] = useState(true);

  if (!open) return null;

  return (
    <div className={styles.dialogBackdrop} role="presentation">
      <section className={styles.groupDialog} role="dialog" aria-modal="true" aria-labelledby="invite-dialog-title">
        <header>
          <div><p className={styles.eyebrow}>INVITE POLICY</p><h2 id="invite-dialog-title">새 초대 코드</h2></div>
          <button className={styles.iconButton} type="button" onClick={onClose} aria-label="닫기" title="닫기"><X size={18} /></button>
        </header>
        <form className={styles.groupForm} onSubmit={(event) => { event.preventDefault(); onSubmit({ expiresInDays: Number(expiresInDays), maxUses: Number(maxUses), revokeExisting }); }}>
          <label>유효 기간<input type="number" min="1" max="30" value={expiresInDays} onChange={(event) => setExpiresInDays(event.target.value)} required /><small>1일에서 30일까지</small></label>
          <label>최대 사용 횟수<input type="number" min="1" max="100" value={maxUses} onChange={(event) => setMaxUses(event.target.value)} required /><small>1회에서 100회까지</small></label>
          <label className={styles.checkboxLabel}><input type="checkbox" checked={revokeExisting} onChange={(event) => setRevokeExisting(event.target.checked)} /> 기존 초대 코드 모두 폐기</label>
          {error && <p className={styles.formError}>{error}</p>}
          <button className={styles.primaryButton} type="submit" disabled={submitting}>{submitting ? "발급 중..." : "코드 발급"}<KeyRound size={17} /></button>
        </form>
      </section>
    </div>
  );
}

function GroupHub({
  groups,
  selectedGroup,
  activity,
  loading,
  error,
  latestInviteCode,
  invites,
  actionMode,
  actionSubmitting,
  actionError,
  onActionModeChange,
  onActionSubmit,
  onSelectGroup,
  onRenewInvite,
  onRevokeInvite,
  onRemoveMember,
  onTransferOwnership,
  onReload,
}) {
  const [copied, setCopied] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  async function copyInviteCode() {
    if (!latestInviteCode) {
      return;
    }
    await navigator.clipboard.writeText(latestInviteCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className={styles.groupHub}>
      <aside className={styles.groupRail}>
        <div className={styles.groupRailHeading}>
          <div>
            <span>MY GROUPS</span>
            <strong>내 그룹</strong>
          </div>
          <span className={styles.groupCount}>{groups.length}</span>
        </div>

        <div className={styles.groupCommands}>
          <button className={styles.primaryButton} type="button" onClick={() => onActionModeChange("create")}>
            <Plus size={17} />
            만들기
          </button>
          <button className={styles.secondaryButton} type="button" onClick={() => onActionModeChange("join")}>
            <KeyRound size={17} />
            코드 참여
          </button>
        </div>

        <nav className={styles.groupList} aria-label="내 그룹 목록">
          {groups.map((group) => (
            <button
              key={group.groupId}
              type="button"
              className={selectedGroup?.groupId === group.groupId ? styles.groupListActive : styles.groupListItem}
              onClick={() => onSelectGroup(group.groupId)}
            >
              <span className={styles.groupListMark}>{group.name.slice(0, 1)}</span>
              <span>
                <strong>{group.name}</strong>
                <small>{group.memberCount}명 · {group.role === "OWNER" ? "소유자" : "멤버"}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.groupWorkspace}>
        {loading ? (
          <div className={styles.groupState}>
            <Orbit size={28} />
            그룹 정보를 불러오는 중...
          </div>
        ) : error ? (
          <div className={styles.groupState}>
            <UsersRound size={30} />
            <h1>그룹 정보를 불러오지 못했어요</h1>
            <p>{error}</p>
            <button className={styles.secondaryButton} type="button" onClick={onReload}>
              <RefreshCw size={17} />
              다시 확인
            </button>
          </div>
        ) : selectedGroup ? (
          <>
            <header className={styles.groupDetailHeader}>
              <div>
                <p className={styles.eyebrow}>STUDY GROUP</p>
                <h1>{selectedGroup.name}</h1>
                <p>{selectedGroup.description || "함께 독해 기록을 쌓는 그룹입니다."}</p>
              </div>
              <span className={selectedGroup.role === "OWNER" ? styles.ownerBadge : styles.memberBadge}>
                {selectedGroup.role === "OWNER" ? <Crown size={15} /> : <UsersRound size={15} />}
                {selectedGroup.role === "OWNER" ? "소유자" : "멤버"}
              </span>
            </header>

            {selectedGroup.role === "OWNER" && (
              <section className={styles.inviteBand}>
                <div>
                  <KeyRound size={20} />
                  <span>
                    <strong>{latestInviteCode || "초대 코드는 발급 직후 한 번만 표시됩니다"}</strong>
                    <small>{latestInviteCode ? "친구에게 이 코드를 전달하세요." : "새 코드를 발급하면 기존 코드는 사용할 수 없어요."}</small>
                  </span>
                </div>
                <div>
                  {latestInviteCode && (
                    <button className={styles.iconButton} type="button" onClick={copyInviteCode} aria-label="초대 코드 복사" title="초대 코드 복사">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  )}
                  <button className={styles.secondaryButton} type="button" onClick={() => setInviteDialogOpen(true)}>
                    <RefreshCw size={16} />
                    새 코드 발급
                  </button>
                </div>
              </section>
            )}

            {selectedGroup.role === "OWNER" && invites.length > 0 && (
              <section className={styles.inviteListSection}>
                <div className={styles.sectionHeading}><div><span>INVITES</span><h2>초대 코드 현황</h2></div><strong>{invites.filter((invite) => invite.enabled).length}개 사용 가능</strong></div>
                <div className={styles.inviteList}>
                  {invites.map((invite) => {
                    const expired = new Date(invite.expiresAt) <= new Date();
                    const usable = invite.enabled && !expired && invite.usedCount < invite.maxUses;
                    return <article key={invite.inviteId}>
                      <span className={usable ? styles.inviteEnabled : styles.inviteDisabled}>{usable ? "사용 가능" : "종료"}</span>
                      <div><strong>초대 #{invite.inviteId}</strong><small>{invite.usedCount}/{invite.maxUses}회 사용 · {new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(invite.expiresAt))} 만료</small></div>
                      {invite.enabled && <button className={styles.dangerTextButton} type="button" onClick={() => onRevokeInvite(invite.inviteId)}><X size={15} /> 폐기</button>}
                    </article>;
                  })}
                </div>
              </section>
            )}

            <section className={styles.groupActivitySection}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>WEEKLY ACTIVITY</span>
                  <h2>이번 주 랭킹</h2>
                </div>
                <strong>{activity?.todayCompletedCount || 0}/{activity?.memberCount || selectedGroup.memberCount} 오늘 완료</strong>
              </div>
              <div className={styles.activityRule}>
                <Sparkles size={17} />
                퀴즈 완료 10점 + 정답 1점 + 오답 회복 2점
              </div>
              <div className={styles.rankingList}>
                {(activity?.ranking || []).map((member) => (
                  <article className={styles.rankingRow} key={member.userId}>
                    <span className={member.rank <= 3 ? styles.rankTop : styles.rankNumber}>
                      {member.rank === 1 ? <Crown size={18} /> : member.rank}
                    </span>
                    <span className={styles.memberAvatar}>{member.displayName.slice(0, 1)}</span>
                    <div className={styles.rankingIdentity}>
                      <strong>{member.displayName}</strong>
                      <small>{member.todayCompleted ? "오늘 퀴즈 완료" : "오늘 미참여"}</small>
                    </div>
                    <div className={styles.rankingMetrics}>
                      <span><small>풀이</small><strong>{member.completedDays}일</strong></span>
                      <span><small>평균</small><strong>{member.averageScore}점</strong></span>
                      <span><small>만점</small><strong>{member.perfectCount}회</strong></span>
                      <span><small>점등</small><strong>{member.fullyLitCount}개</strong></span>
                    </div>
                    <strong className={styles.activityScore}>{member.activityScore} pt</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.memberSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <span>MEMBERS</span>
                  <h2>함께하는 사람</h2>
                </div>
                <strong>{selectedGroup.memberCount}명</strong>
              </div>
              <div className={styles.memberList}>
                {selectedGroup.members.map((member) => (
                  <div key={member.userId} className={styles.memberRow}>
                    <span className={styles.memberAvatar}>{member.displayName.slice(0, 1)}</span>
                    <div>
                      <strong>{member.displayName}</strong>
                      <small>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(member.joinedAt))} 참여</small>
                    </div>
                    {member.role === "OWNER" ? <span>OWNER</span> : selectedGroup.role === "OWNER" ? (
                      <div className={styles.memberActions}>
                        <button type="button" onClick={() => onTransferOwnership(member)} title="소유권 이전"><Crown size={15} /> 소유권 이전</button>
                        <button type="button" onClick={() => onRemoveMember(member)} title="그룹에서 제외"><UserMinus size={15} /> 제외</button>
                      </div>
                    ) : <span>MEMBER</span>}
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className={styles.groupState}>
            <span className={styles.groupEmptyIcon}><UsersRound size={31} /></span>
            <h1>함께 공부할 그룹을 시작하세요</h1>
            <p>직접 그룹을 만들거나 친구에게 받은 초대 코드로 참여할 수 있어요.</p>
            <div className={styles.emptyGroupActions}>
              <button className={styles.primaryButton} type="button" onClick={() => onActionModeChange("create")}>
                <Plus size={17} />
                그룹 만들기
              </button>
              <button className={styles.secondaryButton} type="button" onClick={() => onActionModeChange("join")}>
                <KeyRound size={17} />
                코드로 참여
              </button>
            </div>
          </div>
        )}
      </div>

      <GroupActionDialog
        mode={actionMode}
        onClose={() => onActionModeChange(null)}
        onSubmit={onActionSubmit}
        submitting={actionSubmitting}
        error={actionError}
      />
      <InvitePolicyDialog
        open={inviteDialogOpen}
        submitting={actionSubmitting}
        error={actionError}
        onClose={() => setInviteDialogOpen(false)}
        onSubmit={async (policy) => {
          const created = await onRenewInvite(policy);
          if (created) setInviteDialogOpen(false);
        }}
      />
    </section>
  );
}

function ReviewHub({
  reviewData,
  selectedReviewId,
  filter,
  loading,
  error,
  updating,
  onFilterChange,
  onSelectReview,
  onUpdateReview,
  onReload,
}) {
  const reviews = reviewData?.reviews || [];
  const selectedReview = reviews.find((review) => review.reviewId === selectedReviewId) || null;
  const totalCount = reviewData?.totalCount || 0;
  const recoveredCount = reviewData?.recoveredCount || 0;
  const completionRate = totalCount === 0 ? 100 : Math.round((recoveredCount / totalCount) * 100);
  const filters = [
    { value: "OPEN", label: "복습할 문제", count: reviewData?.openCount || 0 },
    { value: "RECOVERED", label: "복습 완료", count: recoveredCount },
    { value: "ALL", label: "전체", count: totalCount },
  ];

  return (
    <section className={styles.reviewHub}>
      <aside className={styles.reviewRail}>
        <div className={styles.reviewRailHeading}>
          <div>
            <span>ANSWER NOTE</span>
            <strong>오답노트</strong>
          </div>
          <NotebookPen size={20} />
        </div>

        <div className={styles.reviewOrbitProgress}>
          <div>
            <span>궤도 밝기</span>
            <strong>{completionRate}%</strong>
          </div>
          <div className={styles.progressTrack}>
            <span style={{ width: `${completionRate}%` }} />
          </div>
          <small>{totalCount === 0 ? "해결할 오답이 없어요" : `${recoveredCount} / ${totalCount} 복습 완료`}</small>
        </div>

        <nav className={styles.reviewFilters} aria-label="오답노트 필터">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              className={filter === item.value ? styles.reviewFilterActive : styles.reviewFilterItem}
              onClick={() => onFilterChange(item.value)}
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </nav>

        <nav className={styles.reviewList} aria-label="오답 문제 목록">
          {reviews.map((review) => (
            <button
              key={review.reviewId}
              type="button"
              className={selectedReviewId === review.reviewId ? styles.reviewListActive : styles.reviewListItem}
              onClick={() => onSelectReview(review.reviewId)}
            >
              <span className={review.status === "RECOVERED" ? styles.reviewDoneMark : styles.reviewOpenMark}>
                {review.status === "RECOVERED" ? <Check size={15} /> : `Q${review.questionPosition}`}
              </span>
              <span>
                <strong>{review.questionContent}</strong>
                <small>{review.passageTopic} · {review.challengeDate}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.reviewWorkspace}>
        {loading ? (
          <div className={styles.reviewState}>
            <Orbit size={28} />
            오답 기록을 불러오는 중...
          </div>
        ) : error ? (
          <div className={styles.reviewState}>
            <NotebookPen size={30} />
            <h1>오답 기록을 불러오지 못했어요</h1>
            <p>{error}</p>
            <button className={styles.secondaryButton} type="button" onClick={onReload}>
              <RefreshCw size={17} />
              다시 확인
            </button>
          </div>
        ) : selectedReview ? (
          <article className={styles.reviewDetail}>
            <header className={styles.reviewDetailHeader}>
              <div>
                <p className={styles.eyebrow}>{selectedReview.passageTopic || "READING REVIEW"}</p>
                <h1>{selectedReview.passageTitle || "오늘의 독해"}</h1>
                <span>{selectedReview.challengeDate} · {selectedReview.retryCount}회 복습</span>
              </div>
              <span className={selectedReview.status === "RECOVERED" ? styles.recoveredBadge : styles.pendingBadge}>
                {selectedReview.status === "RECOVERED" ? <CheckCircle2 size={15} /> : <Clock3 size={15} />}
                {selectedReview.status === "RECOVERED" ? "복습 완료" : "복습 필요"}
              </span>
            </header>

            {selectedReview.passageContent && (
              <details className={styles.reviewPassage} open>
                <summary>
                  <span>지문 다시 보기</span>
                  <small>문제의 근거를 본문에서 다시 확인해 보세요.</small>
                  <ChevronRight size={18} aria-hidden="true" />
                </summary>
                <div>
                  {selectedReview.passageContent
                    .split(/\n+/)
                    .filter(Boolean)
                    .map((paragraph, index) => (
                      <p key={`${selectedReview.reviewId}-passage-${index}`}>{paragraph}</p>
                    ))}
                </div>
              </details>
            )}

            <section className={styles.reviewQuestion}>
              <span>Q{selectedReview.questionPosition}</span>
              <h2>{selectedReview.questionContent}</h2>
            </section>

            <div className={styles.answerComparison}>
              <section className={styles.wrongAnswerPanel}>
                <span>내가 고른 답</span>
                <div>
                  <i>{selectedReview.selectedOption.position}</i>
                  <p>{selectedReview.selectedOption.content}</p>
                  <XCircle size={20} />
                </div>
              </section>
              <section className={styles.correctAnswerPanel}>
                <span>정답</span>
                <div>
                  <i>{selectedReview.correctOption.position}</i>
                  <p>{selectedReview.correctOption.content}</p>
                  <CheckCircle2 size={20} />
                </div>
              </section>
            </div>

            <section className={styles.reviewExplanation}>
              <span>WHY</span>
              <h2>정답 해설</h2>
              <p>{selectedReview.explanation}</p>
              {selectedReview.evidence && <blockquote>{selectedReview.evidence}</blockquote>}
            </section>

            <footer className={styles.reviewFooter}>
              <div>
                <Orbit size={20} />
                <span>
                  <strong>{selectedReview.status === "RECOVERED" ? "이 오답은 궤도에 반영됐어요" : "이해했다면 오늘의 빛을 더 밝힐 수 있어요"}</strong>
                  <small>전부 맞힌 날은 복습 없이 바로 완료됩니다.</small>
                </span>
              </div>
              <button
                className={selectedReview.status === "RECOVERED" ? styles.secondaryButton : styles.primaryButton}
                type="button"
                onClick={() => onUpdateReview(selectedReview.status === "RECOVERED" ? "PENDING" : "RECOVERED")}
                disabled={updating}
              >
                {updating
                  ? "반영 중..."
                  : selectedReview.status === "RECOVERED"
                    ? "다시 복습하기"
                    : "복습 완료"}
                {!updating && (selectedReview.status === "RECOVERED" ? <RefreshCw size={17} /> : <Sparkles size={17} />)}
              </button>
            </footer>
          </article>
        ) : (
          <div className={styles.reviewState}>
            <span className={styles.reviewEmptyIcon}>
              {filter === "RECOVERED" ? <NotebookPen size={31} /> : <Sparkles size={31} />}
            </span>
            <h1>{filter === "RECOVERED" ? "아직 완료한 복습이 없어요" : "쌓인 오답이 없어요"}</h1>
            <p>
              {filter === "RECOVERED"
                ? "오답을 복습하면 완료 기록이 여기에 모입니다."
                : "모두 맞힌 날은 복습 없이 바로 완료됩니다."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function AppHeader({ user, streak, view, onAccountOpen, onLogout, loggingOut }) {
  return (
    <header className={styles.appHeader}>
      <Brand />
      <nav className={styles.headerNav} aria-label="주요 화면">
        <Link
          href={VIEW_PATHS.quiz}
          className={view === "quiz" ? styles.headerNavActive : styles.headerNavItem}
        >
          <BookOpen size={17} />
          오늘 퀴즈
        </Link>
        <Link
          href={VIEW_PATHS.groups}
          className={view === "groups" ? styles.headerNavActive : styles.headerNavItem}
        >
          <UsersRound size={17} />
          그룹
        </Link>
        <Link
          href={VIEW_PATHS.orbit}
          className={view === "orbit" ? styles.headerNavActive : styles.headerNavItem}
        >
          <CalendarDays size={17} />
          학습 기록
        </Link>
        <Link
          href={VIEW_PATHS.reviews}
          className={view === "reviews" ? styles.headerNavActive : styles.headerNavItem}
        >
          <NotebookPen size={17} />
          오답노트
        </Link>
        {user.role === "ADMIN" && (
          <Link
            href={VIEW_PATHS.admin}
            className={view === "admin" ? styles.headerNavActive : styles.headerNavItem}
          >
            <Rocket size={17} />
            퀴즈 관리
          </Link>
        )}
      </nav>
      <div className={styles.headerActions}>
        <span
          className={`${styles.streakBadge} ${streak.completedToday ? styles.streakBadgeActive : ""}`}
          title={streak.completedToday ? "오늘 학습 완료" : "오늘 학습을 완료하면 연속 기록이 이어져요"}
        >
          <Flame size={19} fill="currentColor" />
          <strong>{streak.currentStreak}</strong>
          <small>일 연속</small>
        </span>
        <button className={styles.userBadge} type="button" onClick={onAccountOpen} title="계정 보안 설정">
          <CircleUserRound size={18} />
          {user.displayName}
          <UserCog size={14} />
        </button>
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

function blankAdminQuiz() {
  return {
    challengeDate: new Date().toISOString().slice(0, 10),
    passages: Array.from({ length: 3 }, () => ({
      title: "", topic: "", content: "",
      questions: Array.from({ length: 3 }, () => ({
        content: "", options: ["", "", "", ""], correctOptionPosition: 1,
        explanation: "", evidence: "",
      })),
    })),
  };
}

const ADMIN_VALIDATION_LABELS = {
  RULE: "구조 규칙",
  DIVERSITY: "주제 중복",
  AI: "AI 품질",
};

function AdminPagination({ pagination, onPageChange, dark = false }) {
  if (!pagination || pagination.totalElements === 0) return null;
  const currentPage = pagination.page + 1;
  const totalPages = Math.max(1, pagination.totalPages);
  return (
    <div className={`${styles.adminPagination} ${dark ? styles.adminPaginationDark : ""}`}>
      <span>전체 {pagination.totalElements}건</span>
      <div>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
          aria-label="이전 페이지"
          title="이전 페이지"
        >
          <ArrowLeft size={15} />
        </button>
        <strong>{currentPage} / {totalPages}</strong>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={currentPage >= totalPages}
          aria-label="다음 페이지"
          title="다음 페이지"
        >
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function AdminPromptPanel({ promptPage, loading, actionLoading, error, onLoad, onCreate, onActivate }) {
  const [promptType, setPromptType] = useState("GENERATION");
  const [content, setContent] = useState("");
  const [changeNote, setChangeNote] = useState("");
  const versions = promptPage?.page?.items || [];
  const active = promptPage?.active;

  useEffect(() => {
    onLoad(promptType, 0);
  }, [promptType]);

  useEffect(() => {
    if (active?.promptType === promptType) {
      setContent(active.content);
    }
  }, [promptType, active?.promptTemplateId]);

  async function saveVersion(event) {
    event.preventDefault();
    try {
      await onCreate({ promptType, content, changeNote });
      setChangeNote("");
    } catch {
      // The parent exposes the API error in the shared admin error panel.
    }
  }

  async function activateVersion(version) {
    const action = version.status === "ARCHIVED" ? "이전 버전으로 되돌릴까요?" : "이 버전을 활성화할까요?";
    if (!window.confirm(`v${version.versionNumber} ${action}`)) return;
    try {
      await onActivate(version.promptTemplateId, promptType, promptPage?.page?.page || 0);
    } catch {
      // The parent exposes the API error in the shared admin error panel.
    }
  }

  function changeType(nextType) {
    setPromptType(nextType);
    setContent("");
    setChangeNote("");
  }

  return (
    <div className={styles.adminWorkspace}>
      <header className={styles.adminEditorHeader}>
        <div><span>PROMPT REGISTRY</span><h1>AI 프롬프트</h1><p>새 버전을 저장하고 검토한 뒤 실제 생성에 사용할 버전을 선택합니다.</p></div>
        <div className={styles.adminPromptTypeTabs}>
          {[["GENERATION", "생성"], ["VALIDATION", "검증"]].map(([value, label]) => (
            <button key={value} type="button" className={promptType === value ? styles.adminPromptTypeActive : ""} onClick={() => changeType(value)}>{label}</button>
          ))}
        </div>
      </header>
      {error && <div className={styles.adminError}>{error}</div>}
      <div className={styles.adminPromptSummary}>
        <div><span>현재 활성 버전</span><strong>{active ? `v${active.versionNumber}` : "없음"}</strong></div>
        <div><span>등록된 버전</span><strong>{promptPage?.page?.totalElements || 0}</strong></div>
        <div><span>최근 활성화</span><strong>{active?.lastActivatedAt ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(new Date(active.lastActivatedAt)) : "-"}</strong></div>
      </div>

      <div className={styles.adminPromptLayout}>
        <form className={styles.adminPromptEditor} onSubmit={saveVersion}>
          <div className={styles.adminSectionHeading}><div><span>NEW IMMUTABLE VERSION</span><h2>새 버전 작성</h2></div><small>저장만으로는 활성화되지 않습니다.</small></div>
          <label>프롬프트 내용<textarea rows="22" value={content} onChange={(event) => setContent(event.target.value)} maxLength={20000} required /></label>
          <label>변경 사유<input value={changeNote} onChange={(event) => setChangeNote(event.target.value)} maxLength={300} placeholder="무엇을 왜 변경했는지 남겨 주세요." required /></label>
          <div className={styles.adminPromptEditorFooter}><span>{content.length.toLocaleString()} / 20,000자</span><button className={styles.primaryButton} type="submit" disabled={actionLoading === "prompt-create"}><FileText size={15} /> {actionLoading === "prompt-create" ? "저장 중..." : "새 버전 저장"}</button></div>
        </form>

        <section className={styles.adminPromptVersions}>
          <div className={styles.adminSectionHeading}><div><span>VERSION HISTORY</span><h2>버전 목록</h2></div></div>
          {loading && !versions.length ? <div className={styles.adminEmpty}>버전 목록을 불러오는 중...</div> : versions.length ? versions.map((version) => (
            <article key={version.promptTemplateId} className={version.status === "ACTIVE" ? styles.adminPromptVersionActive : ""}>
              <header><div><strong>v{version.versionNumber}</strong><span className={`${styles.adminStatus} ${styles[`adminPromptStatus${version.status}`] || ""}`}>{version.status}</span></div><time>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.createdAt))}</time></header>
              <p>{version.changeNote}</p>
              <small>{version.createdByName} · {version.contentHash.slice(0, 10)}</small>
              <div className={styles.adminPromptVersionActions}>
                <button type="button" onClick={() => setContent(version.content)}><Copy size={14} /> 내용 불러오기</button>
                {version.status !== "ACTIVE" && <button type="button" onClick={() => activateVersion(version)} disabled={actionLoading === `prompt-activate-${version.promptTemplateId}`}>
                  {version.status === "ARCHIVED" ? <RotateCcw size={14} /> : <CheckCircle2 size={14} />}
                  {version.status === "ARCHIVED" ? "이 버전으로 되돌리기" : "활성화"}
                </button>}
              </div>
            </article>
          )) : <div className={styles.adminEmpty}>등록된 프롬프트 버전이 없습니다.</div>}
          <AdminPagination pagination={promptPage?.page} onPageChange={(page) => onLoad(promptType, page)} />
        </section>
      </div>

      <section className={styles.adminPromptActivations}>
        <div className={styles.adminSectionHeading}><div><span>ACTIVATION LOG</span><h2>활성화 이력</h2></div></div>
        <div>{(promptPage?.recentActivations || []).map((activation) => <p key={activation.activationId}><History size={14} /><strong>v{activation.versionNumber}</strong><span>{activation.activatedByName}</span><time>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(activation.activatedAt))}</time></p>)}</div>
      </section>
    </div>
  );
}

function AdminOperationsPanel({ summary, loading, error, onLoad }) {
  const ai = summary?.aiToday || {};
  const quality = summary?.quality || {};
  const healthItems = [
    ["애플리케이션", summary?.applicationStatus, Server],
    ["PostgreSQL", summary?.databaseStatus, Database],
    ["HTTPS", typeof window !== "undefined" && window.location.protocol === "https:" ? "UP" : "CHECK", ShieldCheck],
  ];

  return (
    <div className={styles.adminWorkspace}>
      <header className={styles.adminEditorHeader}>
        <div>
          <span>OPERATIONS</span>
          <h1>운영 현황</h1>
          <p>서비스 상태, 생성 품질, 퀴즈 재고와 최근 장애를 한곳에서 확인합니다.</p>
        </div>
        <button className={styles.adminOutlineButton} type="button" onClick={onLoad} disabled={loading}>
          <RefreshCw size={15} /> {loading ? "확인 중" : "새로고침"}
        </button>
      </header>
      {error && <div className={styles.adminError}>{error}</div>}
      {!summary ? <div className={styles.adminEmpty}>운영 정보를 불러오는 중입니다.</div> : <>
        <section className={styles.opsHealthGrid}>
          {healthItems.map(([label, status, Icon]) => (
            <article key={label}>
              <Icon size={18} />
              <div><span>{label}</span><strong className={status === "UP" ? styles.opsHealthy : styles.opsWarning}>{status || "UNKNOWN"}</strong></div>
            </article>
          ))}
          <article><Activity size={18} /><div><span>가동 시간</span><strong>{formatDuration(summary.uptimeSeconds)}</strong></div></article>
          <article><Gauge size={18} /><div><span>배포 버전</span><strong>{summary.version}</strong><small>{formatDateTime(summary.startedAt)} 시작</small></div></article>
          <article><Database size={18} /><div><span>DB 크기</span><strong>{formatBytes(summary.databaseSizeBytes)}</strong></div></article>
        </section>

        <section className={styles.opsSection}>
          <div className={styles.adminSectionHeading}><div><span>TODAY</span><h2>Gemini API</h2></div><b>평균 {Math.round(ai.averageLatencyMs || 0)}ms</b></div>
          <div className={styles.adminMetrics}>
            <div><span>전체 호출</span><strong>{ai.totalCount || 0}</strong></div>
            <div><span>성공</span><strong>{ai.successCount || 0}</strong></div>
            <div><span>실패</span><strong>{ai.failureCount || 0}</strong></div>
            <div><span>오류 코드</span><strong>{summary.aiErrorsToday?.length || 0}<small>종</small></strong></div>
          </div>
          {summary.aiErrorsToday?.length > 0 && <div className={styles.opsErrorCodes}>
            {summary.aiErrorsToday.map((item) => <span key={item.errorCode}>{item.errorCode || "UNKNOWN"} <b>{item.count}</b></span>)}
          </div>}
        </section>

        <section className={styles.opsSection}>
          <div className={styles.adminSectionHeading}><div><span>NEXT 7 DAYS</span><h2>퀴즈 재고</h2></div></div>
          <div className={styles.opsInventory}>
            {summary.inventory?.map((item) => (
              <article key={item.challengeDate} className={item.shortage ? styles.opsInventoryShortage : ""}>
                <time>{item.challengeDate}</time>
                <strong>{item.publishedCount}/{item.requiredCount}</strong>
                <span>{item.shortage ? "부족" : "준비 완료"}</span>
              </article>
            ))}
          </div>
        </section>

        <div className={styles.opsTwoColumns}>
          <section className={styles.opsSection}>
            <div className={styles.adminSectionHeading}><div><span>LAST 7 DAYS</span><h2>생성 품질</h2></div></div>
            <dl className={styles.opsDefinitionList}>
              <div><dt>평균 검증 점수</dt><dd>{Math.round(quality.averageValidationScore || 0)}점</dd></div>
              <div><dt>발행 성공</dt><dd>{quality.publishedCount || 0}건</dd></div>
              <div><dt>실패율</dt><dd>{quality.completedCount ? (quality.failedCount * 100 / quality.completedCount).toFixed(1) : "0.0"}%</dd></div>
              <div><dt>재시도율</dt><dd>{quality.completedCount ? (quality.retryCount * 100 / quality.completedCount).toFixed(1) : "0.0"}%</dd></div>
              <div><dt>중복 거절률</dt><dd>{quality.completedCount ? (quality.duplicateRejectedCount * 100 / quality.completedCount).toFixed(1) : "0.0"}%</dd></div>
              <div><dt>근거 자료</dt><dd>{summary.groundedBriefCount}회 · {summary.groundedSourceCount}개</dd></div>
            </dl>
          </section>
          <section className={styles.opsSection}>
            <div className={styles.adminSectionHeading}><div><span>AUTOMATION</span><h2>스케줄러·백업</h2></div></div>
            <dl className={styles.opsDefinitionList}>
              <div><dt>최근 생성</dt><dd>{summary.lastSchedulerRun?.status || "기록 없음"}</dd></div>
              <div><dt>생성 완료</dt><dd>{formatDateTime(summary.lastSchedulerRun?.completedAt)}</dd></div>
              <div><dt>다음 생성</dt><dd>{formatDateTime(summary.nextSchedulerRun)}</dd></div>
              <div><dt>최근 DB 백업</dt><dd>{summary.lastBackupRun?.status || "기록 없음"}</dd></div>
              <div><dt>백업 완료</dt><dd>{formatDateTime(summary.lastBackupRun?.completedAt)}</dd></div>
              <div><dt>로그인 잠금</dt><dd>{summary.activeLoginLocks}건</dd></div>
            </dl>
          </section>
        </div>

        <div className={styles.opsTwoColumns}>
          <section className={styles.opsSection}>
            <div className={styles.adminSectionHeading}><div><span>FAILURES</span><h2>최근 생성 실패</h2></div></div>
            {summary.recentFailures?.length ? <div className={styles.opsRows}>
              {summary.recentFailures.map((failure) => <article key={failure.generationLogId}>
                <div><strong>#{failure.generationLogId} · {failure.targetDate}</strong><span>{failure.errorMessage || failure.status}</span></div>
                <time>{formatDateTime(failure.updatedAt)}</time>
              </article>)}
            </div> : <div className={styles.adminEmpty}>최근 실패가 없습니다.</div>}
          </section>
          <section className={styles.opsSection}>
            <div className={styles.adminSectionHeading}><div><span>AUDIT</span><h2>최근 관리자 작업</h2></div></div>
            {summary.recentAdminActions?.length ? <div className={styles.opsRows}>
              {summary.recentAdminActions.map((audit) => <article key={audit.auditLogId}>
                <div><strong>{audit.action}</strong><span>@{audit.actorLoginName || "system"} · {audit.targetType}</span></div>
                <time>{formatDateTime(audit.createdAt)}</time>
              </article>)}
            </div> : <div className={styles.adminEmpty}>최근 관리자 작업이 없습니다.</div>}
          </section>
        </div>
      </>}
    </div>
  );
}

function AdminQuizHub({
  currentUser, quizPage, generationPage, generationDetail, userPage, promptPage, loading, actionLoading, error,
  generationFilters, loginLocks, auditPage, operationsSummary,
  onCreate, onUpdate, onDelete, onLoad, onPublish, onGenerate, onRetry,
  onLoadGeneration, onUpdateRole, onUpdateEnabled, onResetPin, onLoadPrompts, onCreatePrompt, onActivatePrompt, onRefresh, onQuizPageChange,
  onGenerationPageChange, onGenerationFilterChange, onUserPageChange, onLoadSecurity, onUnlockLogin, onLoadOperations,
}) {
  const quizzes = quizPage?.page?.items || [];
  const generationLogs = generationPage?.page?.items || [];
  const users = userPage?.items || [];
  const [section, setSection] = useState("overview");
  const [draft, setDraft] = useState(blankAdminQuiz);
  const [activePassage, setActivePassage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [generationDate, setGenerationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [filterStatus, setFilterStatus] = useState(generationFilters?.status || "");
  const [filterDate, setFilterDate] = useState(generationFilters?.targetDate || "");

  useEffect(() => {
    if (section === "security") onLoadSecurity(auditPage?.page || 0);
    if (section === "overview") onLoadOperations();
  }, [section]);

  useEffect(() => {
    setFilterStatus(generationFilters?.status || "");
    setFilterDate(generationFilters?.targetDate || "");
  }, [generationFilters?.status, generationFilters?.targetDate]);

  function updatePassage(field, value) {
    setDraft((current) => ({ ...current, passages: current.passages.map((p, i) => i === activePassage ? { ...p, [field]: value } : p) }));
  }
  function updateQuestion(questionIndex, field, value) {
    setDraft((current) => ({ ...current, passages: current.passages.map((p, i) => i !== activePassage ? p : {
      ...p, questions: p.questions.map((q, qi) => qi === questionIndex ? { ...q, [field]: value } : q),
    }) }));
  }
  function updateOption(questionIndex, optionIndex, value) {
    const options = [...draft.passages[activePassage].questions[questionIndex].options];
    options[optionIndex] = value;
    updateQuestion(questionIndex, "options", options);
  }
  async function submit(event) {
    event.preventDefault(); setSaving(true);
    try { editingId ? await onUpdate(editingId, draft) : await onCreate(draft); resetEditor(); }
    finally { setSaving(false); }
  }
  function resetEditor() { setEditingId(null); setDraft(blankAdminQuiz()); setActivePassage(0); }
  async function editQuiz(quizSetId) {
    const detail = await onLoad(quizSetId);
    setEditingId(quizSetId);
    setDraft({ challengeDate: detail.quiz.challengeDate, passages: detail.passages.map((p) => ({
      title: p.title || "", topic: p.topic || "", content: p.content,
      questions: p.questions.map((q) => ({ content: q.content,
        options: q.options.map((o) => o.content), correctOptionPosition: q.correctOptionPosition,
        explanation: q.explanation, evidence: q.evidence || "" })),
    })) });
    setActivePassage(0);
    setSection("editor");
  }
  async function deleteQuiz(quizSetId) {
    if (!window.confirm("이 DRAFT를 삭제할까요?")) return;
    await onDelete(quizSetId); if (editingId === quizSetId) resetEditor();
  }

  async function generateQuiz() {
    await onGenerate(generationDate);
  }

  function statusForGeneration(log) {
    const linkedQuiz = quizzes.find((quiz) => quiz.quizSetId === log.quizSetId);
    return linkedQuiz?.status === "PUBLISHED" ? "PUBLISHED" : log.status;
  }

  const sectionItems = [
    ["overview", Activity, "운영 현황"],
    ["operations", Sparkles, "퀴즈 생성"],
    ["prompts", FileText, "지문 생성 프롬프트 관리"],
    ["editor", NotebookPen, "수동 편집"],
    ["access", ShieldCheck, "권한 관리"],
    ["security", LockKeyhole, "보안·감사"],
  ];

  return (
    <section className={styles.adminHub}>
      <aside className={styles.adminRail}>
        <div className={styles.adminRailHeading}><span>ADMIN CONSOLE</span><h2>운영 관리</h2></div>
        <nav className={styles.adminSectionNav} aria-label="관리자 메뉴">
          {sectionItems.map(([value, Icon, label]) => (
            <button key={value} type="button" className={section === value ? styles.adminSectionActive : ""} onClick={() => setSection(value)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </nav>
        {section === "editor" && <>
          <button className={styles.adminNewButton} type="button" onClick={() => { resetEditor(); setSection("editor"); }}><Plus size={15} /> 새 퀴즈</button>
          <div className={styles.adminQuizList}>
            {quizzes.map((quiz) => (
              <article key={quiz.quizSetId}>
                <div><strong>{quiz.challengeDate}</strong><small>{quiz.status} · #{quiz.quizSetId}</small></div>
                {quiz.status !== "PUBLISHED" && <div className={styles.adminListActions}>
                  <button type="button" onClick={() => editQuiz(quiz.quizSetId)}>수정</button>
                  <button type="button" onClick={() => onPublish(quiz.quizSetId)}>발행</button>
                  <button type="button" onClick={() => deleteQuiz(quiz.quizSetId)} aria-label={`${quiz.challengeDate} 초안 삭제`} title="초안 삭제"><X size={14} /></button>
                </div>}
              </article>
            ))}
          </div>
          <AdminPagination pagination={quizPage?.page} onPageChange={onQuizPageChange} dark />
        </>}
        <button className={styles.adminRefreshButton} type="button" onClick={() => onRefresh()} disabled={loading}>
          <RefreshCw size={15} /> {loading ? "갱신 중" : "전체 새로고침"}
        </button>
      </aside>

      {section === "overview" ? (
        <AdminOperationsPanel
          summary={operationsSummary}
          loading={loading}
          error={error}
          onLoad={onLoadOperations}
        />
      ) : section === "operations" ? (
        <div className={styles.adminWorkspace}>
          <header className={styles.adminEditorHeader}>
            <div><span>AI PIPELINE</span><h1>퀴즈 생성 운영</h1><p>Gemini 생성, 자동 검증, 편집과 발행 상태를 확인합니다.</p></div>
            <div className={styles.adminGenerateControls}>
              <label>대상 날짜<input type="date" value={generationDate} onChange={(event) => setGenerationDate(event.target.value)} /></label>
              <button className={styles.primaryButton} type="button" onClick={generateQuiz} disabled={Boolean(actionLoading)}><Sparkles size={16} /> {actionLoading === "generate" ? "생성 중..." : "Gemini로 생성"}</button>
            </div>
          </header>
          {error && <div className={styles.adminError}>{error}</div>}
          <div className={styles.adminMetrics}>
            <div><span>발행 대기</span><strong>{quizPage?.pendingCount || 0}</strong></div>
            <div><span>생성 성공</span><strong>{generationPage?.successCount || 0}</strong></div>
            <div><span>생성 실패</span><strong>{generationPage?.failureCount || 0}</strong></div>
            <div>
              <span>오늘 Gemini 호출</span>
              <strong>{generationPage?.apiUsage?.totalCount || 0}<small> / {generationPage?.apiUsage?.limit || 0}</small></strong>
            </div>
          </div>
          <section className={styles.adminLogSection}>
            <div className={styles.adminSectionHeading}>
              <div><span>전체 {generationPage?.page?.totalElements || 0}건</span><h2>생성 기록</h2></div>
              <span className={styles.adminValidationMode}>{generationPage?.aiValidationEnabled ? "AI 2차 검증 사용" : "로컬 자동 검증 사용"}</span>
            </div>
            <form className={styles.adminLogFilters} onSubmit={(event) => {
              event.preventDefault();
              onGenerationFilterChange({ status: filterStatus, targetDate: filterDate });
            }}>
              <label>상태<select value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
                <option value="">전체</option>
                <option value="GENERATING">생성 중</option>
                <option value="VALIDATING">검증 중</option>
                <option value="READY">생성 성공</option>
                <option value="FAILED">생성 실패</option>
              </select></label>
              <label>대상 날짜<input type="date" value={filterDate} onChange={(event) => setFilterDate(event.target.value)} /></label>
              <button type="submit">조회</button>
              <button type="button" onClick={() => {
                setFilterStatus("");
                setFilterDate("");
                onGenerationFilterChange({ status: "", targetDate: "" });
              }}>초기화</button>
            </form>
            {generationLogs.length ? <div className={styles.adminLogList}>
              {generationLogs.map((log) => {
                const displayStatus = statusForGeneration(log);
                return <article key={log.generationLogId} className={generationDetail?.log?.generationLogId === log.generationLogId ? styles.adminLogSelected : ""}>
                  <button className={styles.adminLogMain} type="button" onClick={() => onLoadGeneration(log.generationLogId)}>
                    <span className={`${styles.adminStatus} ${styles[`adminStatus${displayStatus}`] || ""}`}>{displayStatus}</span>
                    <strong>{log.targetDate}</strong>
                    <small>{log.aiModel} · {log.promptVersion || "프롬프트 미기록"} · {log.attemptCount}회 시도</small>
                    <b>{log.validationScore == null ? "-" : `${log.validationScore}점`}</b>
                  </button>
                  <div className={styles.adminLogActions}>
                    {log.quizSetId && displayStatus !== "PUBLISHED" && <button type="button" onClick={() => editQuiz(log.quizSetId)}>편집</button>}
                    {log.quizSetId && displayStatus !== "PUBLISHED" && <button type="button" onClick={() => onPublish(log.quizSetId)}>발행</button>}
                    {log.status === "FAILED" && <button type="button" onClick={() => onRetry(log.generationLogId)} disabled={actionLoading === `retry-${log.generationLogId}`}><RefreshCw size={14} /> 재시도</button>}
                  </div>
                </article>;
              })}
            </div> : <div className={styles.adminEmpty}>아직 생성 기록이 없습니다.</div>}
            <AdminPagination pagination={generationPage?.page} onPageChange={onGenerationPageChange} />
          </section>
          {generationDetail && <section className={styles.adminValidationPanel}>
            <header><div><span>GENERATION #{generationDetail.log.generationLogId}</span><h2>검증 상세</h2></div><button type="button" onClick={() => onLoadGeneration(null)} aria-label="검증 상세 닫기" title="닫기"><X size={17} /></button></header>
            {generationDetail.log.errorMessage && <p className={styles.adminFailureReason}>{generationDetail.log.errorMessage}</p>}
            {generationDetail.sources?.length > 0 && <section className={styles.adminSourceReview}>
              <div className={styles.adminSectionHeading}><div><span>GROUNDING</span><h2>지문 생성 참고 자료</h2></div><b>{generationDetail.sources.length}개</b></div>
              <div>
                {generationDetail.sources.map((source) => <article key={`${source.passagePosition}-${source.contentSourceId}`}>
                  <span>지문 {source.passagePosition}</span>
                  <a href={source.sourceUrl} target="_blank" rel="noreferrer">
                    <strong>{source.title}</strong>
                    <small>{source.publisher}{source.publishedOn ? ` · ${source.publishedOn}` : ""}</small>
                    <ExternalLink size={14} />
                  </a>
                </article>)}
              </div>
            </section>}
            <div className={styles.adminValidationList}>
              {generationDetail.validations.map((validation) => <article key={validation.validationResultId}>
                <div><strong>{ADMIN_VALIDATION_LABELS[validation.validationType] || validation.validationType}</strong><span>{validation.attemptNumber}차 · {validation.score}점 · {validation.passed ? "통과" : "실패"}</span></div>
                {validation.issues.length ? <ul>{validation.issues.map((issue, index) => <li key={`${issue.code}-${index}`}><b>{issue.severity}</b> {issue.message}</li>)}</ul> : <p>발견된 문제가 없습니다.</p>}
              </article>)}
            </div>
          </section>}
        </div>
      ) : section === "prompts" ? (
        <AdminPromptPanel
          promptPage={promptPage}
          loading={loading}
          actionLoading={actionLoading}
          error={error}
          onLoad={onLoadPrompts}
          onCreate={onCreatePrompt}
          onActivate={onActivatePrompt}
        />
      ) : section === "access" ? (
        <div className={styles.adminWorkspace}>
          <header className={styles.adminEditorHeader}><div><span>ACCESS CONTROL</span><h1>사용자 권한</h1><p>권한·상태·PIN 변경 시 해당 사용자의 기존 로그인은 즉시 종료됩니다.</p></div></header>
          {error && <div className={styles.adminError}>{error}</div>}
          <div className={styles.adminUserTable}>
            <div className={styles.adminUserHeader}><span>사용자</span><span>최근 로그인</span><span>권한</span><span>계정 관리</span></div>
            {users.map((account) => <article key={account.userId}>
              <div><strong>{account.displayName}</strong><small>@{account.loginName}{account.userId === currentUser.userId ? " · 현재 계정" : ""}</small></div>
              <time>{account.lastLoginAt ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(account.lastLoginAt)) : "로그인 기록 없음"}</time>
              <select value={account.role} disabled={!account.enabled || actionLoading === `role-${account.userId}` || account.userId === currentUser.userId} onChange={(event) => onUpdateRole(account.userId, event.target.value)} aria-label={`${account.displayName} 권한`}>
                <option value="USER">사용자</option><option value="ADMIN">관리자</option>
              </select>
              <div className={styles.adminAccountActions}>
                <button type="button" onClick={() => onResetPin(account)} disabled={!account.enabled || Boolean(actionLoading)} title="PIN 초기화"><KeyRound size={14} /></button>
                <button type="button" onClick={() => onUpdateEnabled(account.userId, !account.enabled)} disabled={account.userId === currentUser.userId || Boolean(actionLoading)} className={account.enabled ? styles.adminDisableButton : styles.adminEnableButton} title={account.enabled ? "계정 중지" : "계정 활성화"}><Power size={14} /><span>{account.enabled ? "중지" : "활성화"}</span></button>
              </div>
            </article>)}
          </div>
          <AdminPagination pagination={userPage} onPageChange={onUserPageChange} />
        </div>
      ) : section === "security" ? (
        <div className={styles.adminWorkspace}>
          <header className={styles.adminEditorHeader}><div><span>SECURITY & AUDIT</span><h1>보안·감사</h1><p>현재 잠긴 로그인과 관리자 변경 이력을 확인합니다.</p></div></header>
          {error && <div className={styles.adminError}>{error}</div>}
          <section className={styles.adminSecuritySection}>
            <div className={styles.adminSectionHeading}><div><span>LOGIN LOCKS</span><h2>로그인 잠금</h2></div><strong>{loginLocks.length}건</strong></div>
            {loginLocks.length ? <div className={styles.adminLockList}>
              {loginLocks.map((lock) => <article key={`${lock.loginName}-${lock.expiresAt}`}>
                <div><strong>@{lock.loginName}</strong><small>{lock.clientAddress} · 실패 {lock.failures}회</small></div>
                <time>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lock.expiresAt))}까지</time>
                <button type="button" onClick={() => onUnlockLogin(lock.loginName)} disabled={actionLoading === `unlock-${lock.loginName}`}>잠금 해제</button>
              </article>)}
            </div> : <div className={styles.adminEmpty}>현재 잠긴 로그인이 없습니다.</div>}
          </section>
          <section className={styles.adminSecuritySection}>
            <div className={styles.adminSectionHeading}><div><span>ADMIN AUDIT</span><h2>관리자 작업 이력</h2></div></div>
            {(auditPage?.items || []).length ? <div className={styles.adminAuditList}>
              {auditPage.items.map((audit) => <article key={audit.auditLogId}>
                <span className={styles.adminAuditAction}>{audit.action}</span>
                <div><strong>{audit.targetType}{audit.targetId ? ` #${audit.targetId}` : ""}</strong><small>@{audit.actorLoginName || "삭제된 사용자"}</small></div>
                <time>{new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(audit.createdAt))}</time>
              </article>)}
            </div> : <div className={styles.adminEmpty}>기록된 관리자 작업이 없습니다.</div>}
            <AdminPagination pagination={auditPage} onPageChange={onLoadSecurity} />
          </section>
        </div>
      ) : (
      <form className={styles.adminEditor} onSubmit={submit}>
        <header className={styles.adminEditorHeader}>
          <div><span>MANUAL DRAFT</span><h1>{editingId ? `DRAFT #${editingId} 수정` : "새 퀴즈 만들기"}</h1><p>고3 난이도 · 3지문 · 9문제</p></div>
          <label>발행 예정일<input type="date" value={draft.challengeDate} onChange={(e) => setDraft({ ...draft, challengeDate: e.target.value })} required /></label>
        </header>
        {error && <div className={styles.adminError}>{error}</div>}
        <div className={styles.adminPassageTabs}>
          {[0, 1, 2].map((index) => <button key={index} type="button" className={activePassage === index ? styles.adminPassageActive : ""} onClick={() => setActivePassage(index)}>지문 {index + 1}</button>)}
        </div>
        <section className={styles.adminPassageEditor}>
          <div className={styles.adminTwoColumns}>
            <label>제목<input value={draft.passages[activePassage].title} onChange={(e) => updatePassage("title", e.target.value)} /></label>
            <label>주제<input value={draft.passages[activePassage].topic} onChange={(e) => updatePassage("topic", e.target.value)} /></label>
          </div>
          <label>지문<textarea rows="9" value={draft.passages[activePassage].content} onChange={(e) => updatePassage("content", e.target.value)} required /></label>
        </section>
        <div className={styles.adminQuestions}>
          {draft.passages[activePassage].questions.map((question, qi) => (
            <section className={styles.adminQuestion} key={qi}>
              <h2>문제 {qi + 1}</h2>
              <label>질문<textarea rows="2" value={question.content} onChange={(e) => updateQuestion(qi, "content", e.target.value)} required /></label>
              <div className={styles.adminOptions}>{question.options.map((option, oi) => <label key={oi}><input type="radio" name={`correct-${activePassage}-${qi}`} checked={question.correctOptionPosition === oi + 1} onChange={() => updateQuestion(qi, "correctOptionPosition", oi + 1)} /><span>{oi + 1}</span><input value={option} onChange={(e) => updateOption(qi, oi, e.target.value)} required /></label>)}</div>
              <label>해설<textarea rows="2" value={question.explanation} onChange={(e) => updateQuestion(qi, "explanation", e.target.value)} required /></label>
              <label>근거<textarea rows="2" value={question.evidence} onChange={(e) => updateQuestion(qi, "evidence", e.target.value)} /></label>
            </section>
          ))}
        </div>
        <footer className={styles.adminFooter}><span>{loading ? "목록 갱신 중" : editingId ? "발행 전 DRAFT만 수정할 수 있습니다." : "모든 지문 입력 후 초안으로 저장됩니다."}</span><button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "저장 중..." : editingId ? "수정 저장" : "DRAFT 저장"}</button></footer>
      </form>
      )}
    </section>
  );
}

function OrbitHub({ data, period, loading, error, onPeriodChange, onMove, onReload }) {
  const title = data
    ? period === "WEEK"
      ? `${data.startDate.replaceAll("-", ".")} - ${data.endDate.replaceAll("-", ".")}`
      : new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" })
          .format(new Date(`${data.startDate}T00:00:00`))
    : "학습 기록";

  return (
    <section className={styles.orbitHub}>
      <header className={styles.orbitHeader}>
        <div>
          <span>학습 현황</span>
          <h1>학습 기록</h1>
          <p>문제를 푼 날과 오답 복습 현황을 한눈에 확인하세요.</p>
        </div>
        <div className={styles.orbitControls}>
          <div className={styles.orbitSegment}>
            {[
              ["WEEK", "주간"],
              ["MONTH", "월간"],
            ].map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={period === value ? styles.orbitSegmentActive : ""}
                onClick={() => onPeriodChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className={styles.orbitPager}>
            <button type="button" onClick={() => onMove(-1)} aria-label="이전 기간" title="이전 기간">
              <ArrowLeft size={17} />
            </button>
            <strong>{title}</strong>
            <button type="button" onClick={() => onMove(1)} aria-label="다음 기간" title="다음 기간">
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className={styles.orbitState}><Orbit size={28} /> 학습 기록을 불러오는 중...</div>
      ) : error ? (
        <div className={styles.orbitState}><p>{error}</p><button type="button" onClick={onReload}>다시 시도</button></div>
      ) : data ? (
        <>
          <div className={styles.orbitSummary}>
            <div><span>학습한 날</span><strong>{data.completedDays}</strong><small>일</small></div>
            <div><span>복습 완료</span><strong>{data.fullyLitDays}</strong><small>일</small></div>
            <div><span>완료율</span><strong>{data.completedDays ? Math.round(data.fullyLitDays * 100 / data.completedDays) : 0}</strong><small>%</small></div>
          </div>
          <div className={`${styles.orbitGrid} ${period === "WEEK" ? styles.orbitGridWeek : ""}`}>
            {data.days.map((day) => {
              const date = new Date(`${day.date}T00:00:00`);
              return (
                <article className={styles.orbitDay} key={day.date}>
                  <div className={styles.planetStage}>
                    {day.weekendMakeUp && <small className={styles.makeUpBadge}>주말 보충</small>}
                    <span
                      className={day.status === "EMPTY" ? styles.planetEmpty : styles.planetLit}
                      style={{ opacity: Math.max(0.35, day.brightness / 100) }}
                    >
                      <i />
                    </span>
                  </div>
                  <div className={styles.orbitDayMeta}>
                    <span>{new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(date)}</span>
                    <strong>{date.getDate()}</strong>
                  </div>
                  {day.score === null ? (
                    <small>미완료</small>
                  ) : day.status === "LIT" ? (
                    <small className={styles.orbitComplete}>{day.score}/{day.score + day.wrongCount} · 복습 완료</small>
                  ) : (
                    <small>{day.score}/{day.score + day.wrongCount} · 복습 {day.recoveredCount}/{day.wrongCount}</small>
                  )}
                </article>
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default function TriReadApp() {
  const pathname = usePathname();
  const router = useRouter();
  const view = getViewFromPathname(pathname);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState("");
  const [activePassage, setActivePassage] = useState(null);
  const [selections, setSelections] = useState({});
  const [result, setResult] = useState(null);
  const [streak, setStreak] = useState({ currentStreak: 0, completedToday: false });
  const [weekOrbit, setWeekOrbit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupActivity, setGroupActivity] = useState(null);
  const [groupAction, setGroupAction] = useState(null);
  const [groupActionSubmitting, setGroupActionSubmitting] = useState(false);
  const [groupActionError, setGroupActionError] = useState("");
  const [latestInviteCode, setLatestInviteCode] = useState("");
  const [groupInvites, setGroupInvites] = useState([]);
  const [reviewData, setReviewData] = useState(null);
  const [reviewFilter, setReviewFilter] = useState("OPEN");
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewUpdating, setReviewUpdating] = useState(false);
  const [orbitData, setOrbitData] = useState(null);
  const [orbitPeriod, setOrbitPeriod] = useState("WEEK");
  const [orbitAnchor, setOrbitAnchor] = useState(() => new Date().toISOString().slice(0, 10));
  const [orbitLoading, setOrbitLoading] = useState(false);
  const [orbitError, setOrbitError] = useState("");
  const [adminQuizPage, setAdminQuizPage] = useState({
    page: { items: [], page: 0, size: 6, totalElements: 0, totalPages: 0 },
    pendingCount: 0,
  });
  const [adminGenerationPage, setAdminGenerationPage] = useState({
    page: { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    successCount: 0,
    failureCount: 0,
    apiUsage: { totalCount: 0, successCount: 0, failureCount: 0, limit: 0 },
    aiValidationEnabled: false,
  });
  const [adminGenerationFilters, setAdminGenerationFilters] = useState({ status: "", targetDate: "" });
  const [adminGenerationDetail, setAdminGenerationDetail] = useState(null);
  const [adminUserPage, setAdminUserPage] = useState({
    items: [], page: 0, size: 10, totalElements: 0, totalPages: 0,
  });
  const [adminPromptPage, setAdminPromptPage] = useState({
    page: { items: [], page: 0, size: 8, totalElements: 0, totalPages: 0 },
    active: null,
    recentActivations: [],
  });
  const [adminLoginLocks, setAdminLoginLocks] = useState([]);
  const [adminAuditPage, setAdminAuditPage] = useState({
    items: [], page: 0, size: 10, totalElements: 0, totalPages: 0,
  });
  const [adminOperationsSummary, setAdminOperationsSummary] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState("");
  const [adminError, setAdminError] = useState("");

  async function loadQuiz() {
    setQuizLoading(true);
    setQuizError("");
    try {
      const todayQuiz = await apiFetch("/api/quizzes/today");
      setQuiz(todayQuiz);
      setSelections({});
      setResult(null);
      setActivePassage(null);
    } catch (error) {
      setQuiz(null);
      setQuizError(getErrorMessage(error));
    } finally {
      setQuizLoading(false);
    }
  }

  async function loadStreak() {
    try {
      setStreak(await apiFetch("/api/orbit/streak"));
    } catch {
      setStreak({ currentStreak: 0, completedToday: false });
    }
  }

  async function loadWeekOrbit() {
    try {
      setWeekOrbit(await apiFetch("/api/orbit?period=WEEK"));
    } catch {
      setWeekOrbit(null);
    }
  }

  async function loadGroupDetail(groupId) {
    const [detail, activity] = await Promise.all([
      apiFetch(`/api/groups/${groupId}`),
      apiFetch(`/api/groups/${groupId}/activity`),
    ]);
    const invites = detail.role === "OWNER" ? await apiFetch(`/api/groups/${groupId}/invites`) : [];
    setSelectedGroup(detail);
    setGroupActivity(activity);
    setGroupInvites(invites);
    return detail;
  }

  async function loadGroups(preferredGroupId = null) {
    setGroupsLoading(true);
    setGroupError("");
    try {
      const myGroups = await apiFetch("/api/groups/my");
      setGroups(myGroups);
      const groupId = preferredGroupId || selectedGroup?.groupId || myGroups[0]?.groupId;
      if (groupId) {
        await loadGroupDetail(groupId);
      } else {
        setSelectedGroup(null);
        setGroupActivity(null);
        setGroupInvites([]);
      }
    } catch (error) {
      setGroupError(getErrorMessage(error));
    } finally {
      setGroupsLoading(false);
    }
  }

  async function handleSelectGroup(groupId) {
    setGroupsLoading(true);
    setGroupError("");
    setLatestInviteCode("");
    try {
      await loadGroupDetail(groupId);
    } catch (error) {
      setGroupError(getErrorMessage(error));
    } finally {
      setGroupsLoading(false);
    }
  }

  async function handleGroupAction(payload) {
    setGroupActionSubmitting(true);
    setGroupActionError("");
    try {
      const response = await apiFetch(groupAction === "create" ? "/api/groups" : "/api/groups/join", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const detail = groupAction === "create" ? response.group : response;
      setLatestInviteCode(groupAction === "create" ? response.inviteCode : "");
      await loadGroupDetail(detail.groupId);
      setGroupAction(null);
      const myGroups = await apiFetch("/api/groups/my");
      setGroups(myGroups);
    } catch (error) {
      setGroupActionError(getErrorMessage(error));
    } finally {
      setGroupActionSubmitting(false);
    }
  }

  async function handleRenewInvite(policy) {
    if (!selectedGroup) {
      return;
    }
    setGroupActionSubmitting(true);
    setGroupActionError("");
    try {
      const response = await apiFetch(`/api/groups/${selectedGroup.groupId}/invites`, {
        method: "POST",
        body: JSON.stringify(policy),
      });
      setLatestInviteCode(response.inviteCode);
      setGroupInvites((current) => [response.invite, ...current.map((invite) => policy.revokeExisting ? { ...invite, enabled: false } : invite)]);
      return true;
    } catch (error) {
      setGroupActionError(getErrorMessage(error));
      return false;
    } finally {
      setGroupActionSubmitting(false);
    }
  }

  async function handleRevokeInvite(inviteId) {
    if (!selectedGroup || !window.confirm("이 초대 코드를 폐기할까요?")) return;
    setGroupError("");
    try {
      await apiFetch(`/api/groups/${selectedGroup.groupId}/invites/${inviteId}`, { method: "DELETE" });
      setGroupInvites((current) => current.map((invite) => invite.inviteId === inviteId ? { ...invite, enabled: false } : invite));
    } catch (error) { setGroupError(getErrorMessage(error)); }
  }

  async function handleRemoveMember(member) {
    if (!selectedGroup || !window.confirm(`${member.displayName} 님을 그룹에서 제외할까요?`)) return;
    setGroupError("");
    try {
      await apiFetch(`/api/groups/${selectedGroup.groupId}/members/${member.userId}`, { method: "DELETE" });
      await loadGroups(selectedGroup.groupId);
    } catch (error) { setGroupError(getErrorMessage(error)); }
  }

  async function handleTransferOwnership(member) {
    if (!selectedGroup || !window.confirm(`${member.displayName} 님에게 소유권을 이전할까요? 이전 후에는 일반 멤버가 됩니다.`)) return;
    setGroupError("");
    try {
      await apiFetch(`/api/groups/${selectedGroup.groupId}/owner`, { method: "PATCH", body: JSON.stringify({ newOwnerUserId: member.userId }) });
      setLatestInviteCode("");
      await loadGroups(selectedGroup.groupId);
    } catch (error) { setGroupError(getErrorMessage(error)); }
  }

  async function loadReviews(filter = reviewFilter, preferredReviewId = null) {
    setReviewsLoading(true);
    setReviewError("");
    try {
      const data = await apiFetch(`/api/reviews?status=${filter}`);
      setReviewData(data);
      const availableIds = new Set(data.reviews.map((review) => review.reviewId));
      const nextReviewId = availableIds.has(preferredReviewId)
        ? preferredReviewId
        : availableIds.has(selectedReviewId)
          ? selectedReviewId
          : data.reviews[0]?.reviewId || null;
      setSelectedReviewId(nextReviewId);
    } catch (error) {
      setReviewError(getErrorMessage(error));
    } finally {
      setReviewsLoading(false);
    }
  }

  async function handleReviewFilter(nextFilter) {
    setReviewFilter(nextFilter);
    setSelectedReviewId(null);
    await loadReviews(nextFilter);
  }

  async function handleReviewUpdate(status) {
    if (!selectedReviewId) {
      return;
    }
    setReviewUpdating(true);
    setReviewError("");
    try {
      await apiFetch(`/api/reviews/${selectedReviewId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadReviews(reviewFilter);
    } catch (error) {
      setReviewError(getErrorMessage(error));
    } finally {
      setReviewUpdating(false);
    }
  }

  async function loadOrbit(period = orbitPeriod, anchor = orbitAnchor) {
    setOrbitLoading(true);
    setOrbitError("");
    try {
      setOrbitData(await apiFetch(`/api/orbit?period=${period}&anchor=${anchor}`));
    } catch (error) {
      setOrbitError(getErrorMessage(error));
    } finally {
      setOrbitLoading(false);
    }
  }

  function changeOrbitPeriod(period) {
    setOrbitPeriod(period);
    loadOrbit(period, orbitAnchor);
  }

  function moveOrbit(direction) {
    const next = new Date(`${orbitAnchor}T00:00:00`);
    if (orbitPeriod === "WEEK") {
      next.setDate(next.getDate() + direction * 7);
    } else {
      next.setMonth(next.getMonth() + direction, 1);
    }
    const nextAnchor = next.toISOString().slice(0, 10);
    setOrbitAnchor(nextAnchor);
    loadOrbit(orbitPeriod, nextAnchor);
  }

  async function loadAdminQuizzes(page = adminQuizPage.page.page) {
    setAdminLoading(true); setAdminError("");
    try {
      const response = await apiFetch(`/api/admin/quizzes?page=${page}&size=6`);
      setAdminQuizPage(response);
      return response;
    }
    catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function loadAdminGenerationPage(page = adminGenerationPage.page.page, filters = adminGenerationFilters) {
    setAdminLoading(true); setAdminError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: "10" });
      if (filters.status) params.set("status", filters.status);
      if (filters.targetDate) params.set("targetDate", filters.targetDate);
      const response = await apiFetch(`/api/admin/quiz-generations?${params}`);
      setAdminGenerationPage(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function loadAdminUsers(page = adminUserPage.page) {
    setAdminLoading(true); setAdminError("");
    try {
      const response = await apiFetch(`/api/admin/users?page=${page}&size=10`);
      setAdminUserPage(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function loadAdminOperations() {
    setAdminLoading(true); setAdminError("");
    try {
      const response = await apiFetch("/api/admin/operations/summary");
      setAdminOperationsSummary(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function filterAdminGeneration(filters) {
    setAdminGenerationFilters(filters);
    setAdminGenerationDetail(null);
    return loadAdminGenerationPage(0, filters);
  }
  async function loadAdminPrompts(promptType = "GENERATION", page = 0) {
    setAdminLoading(true); setAdminError("");
    try {
      const response = await apiFetch(`/api/admin/prompts?type=${promptType}&page=${page}&size=8`);
      setAdminPromptPage(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function loadAdminSecurity(page = adminAuditPage.page) {
    setAdminLoading(true); setAdminError("");
    try {
      const [locks, audits] = await Promise.all([
        apiFetch("/api/admin/security/login-locks"),
        apiFetch(`/api/admin/audit-logs?page=${page}&size=10`),
      ]);
      setAdminLoginLocks(locks);
      setAdminAuditPage(audits);
      return { locks, audits };
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function unlockAdminLogin(loginName) {
    setAdminActionLoading(`unlock-${loginName}`); setAdminError("");
    try {
      await apiFetch(`/api/admin/security/login-locks/${encodeURIComponent(loginName)}`, { method: "DELETE" });
      await loadAdminSecurity(0);
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function createAdminPrompt(payload) {
    setAdminActionLoading("prompt-create"); setAdminError("");
    try {
      await apiFetch("/api/admin/prompts", { method: "POST", body: JSON.stringify(payload) });
      await loadAdminPrompts(payload.promptType, 0);
    } catch (error) {
      setAdminError(getErrorMessage(error));
      throw error;
    } finally { setAdminActionLoading(""); }
  }
  async function activateAdminPrompt(promptTemplateId, promptType, page) {
    setAdminActionLoading(`prompt-activate-${promptTemplateId}`); setAdminError("");
    try {
      await apiFetch(`/api/admin/prompts/${promptTemplateId}/activate`, { method: "POST" });
      await loadAdminPrompts(promptType, page);
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function loadAdminConsole(pages = {}) {
    const quizIndex = Number.isInteger(pages.quiz) ? pages.quiz : adminQuizPage.page.page;
    const generationIndex = Number.isInteger(pages.generation)
      ? pages.generation
      : adminGenerationPage.page.page;
    const userIndex = Number.isInteger(pages.user) ? pages.user : adminUserPage.page;
    setAdminLoading(true); setAdminError("");
    try {
      const [quizzes, logs, accounts] = await Promise.all([
        apiFetch(`/api/admin/quizzes?page=${quizIndex}&size=6`),
        apiFetch(`/api/admin/quiz-generations?page=${generationIndex}&size=10`),
        apiFetch(`/api/admin/users?page=${userIndex}&size=10`),
      ]);
      setAdminQuizPage(quizzes);
      setAdminGenerationPage(logs);
      setAdminUserPage(accounts);
      return { quizzes, logs, accounts };
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function refreshAdminConsole() {
    setAdminGenerationFilters({ status: "", targetDate: "" });
    const [consoleData] = await Promise.all([
      loadAdminConsole({ generation: 0 }),
      loadAdminOperations(),
    ]);
    return consoleData;
  }
  async function generateAdminQuiz(targetDate) {
    setAdminActionLoading("generate"); setAdminError("");
    setAdminGenerationFilters({ status: "", targetDate: "" });
    try {
      const result = await apiFetch("/api/admin/quiz-generations", { method: "POST", body: JSON.stringify({ targetDate }) });
      await loadAdminConsole({ quiz: 0, generation: 0 });
      await loadAdminGeneration(result.generationLogId);
    } catch (error) {
      const message = getErrorMessage(error);
      const refreshed = await loadAdminConsole({ generation: 0 });
      const latestLog = refreshed?.logs?.page?.items?.[0];
      if (latestLog) await loadAdminGeneration(latestLog.generationLogId);
      setAdminError(message);
    }
    finally { setAdminActionLoading(""); }
  }
  async function retryAdminGeneration(generationLogId) {
    setAdminActionLoading(`retry-${generationLogId}`); setAdminError("");
    setAdminGenerationFilters({ status: "", targetDate: "" });
    try {
      const result = await apiFetch(`/api/admin/quiz-generations/${generationLogId}/retry`, { method: "POST" });
      await loadAdminConsole({ quiz: 0, generation: 0 });
      await loadAdminGeneration(result.generationLogId);
    } catch (error) {
      const message = getErrorMessage(error);
      const refreshed = await loadAdminConsole({ generation: 0 });
      const latestLog = refreshed?.logs?.page?.items?.[0];
      if (latestLog) await loadAdminGeneration(latestLog.generationLogId);
      setAdminError(message);
    }
    finally { setAdminActionLoading(""); }
  }
  async function loadAdminGeneration(generationLogId) {
    if (!generationLogId) { setAdminGenerationDetail(null); return; }
    setAdminError("");
    try { setAdminGenerationDetail(await apiFetch(`/api/admin/quiz-generations/${generationLogId}`)); }
    catch (error) { setAdminError(getErrorMessage(error)); }
  }
  async function updateAdminRole(userId, role) {
    setAdminActionLoading(`role-${userId}`); setAdminError("");
    try {
      const updated = await apiFetch(`/api/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      setAdminUserPage((current) => ({
        ...current,
        items: current.items.map((account) => account.userId === userId ? updated : account),
      }));
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function updateAdminEnabled(userId, enabled) {
    const actionLabel = enabled ? "활성화" : "중지";
    if (!window.confirm(`이 계정을 ${actionLabel}할까요? 기존 로그인은 종료됩니다.`)) return;
    setAdminActionLoading(`enabled-${userId}`); setAdminError("");
    try {
      const updated = await apiFetch(`/api/admin/users/${userId}/enabled`, { method: "PATCH", body: JSON.stringify({ enabled }) });
      setAdminUserPage((current) => ({ ...current, items: current.items.map((account) => account.userId === userId ? updated : account) }));
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function resetAdminPin(account) {
    const newPin = window.prompt(`${account.displayName} 님의 새 PIN(숫자 4~12자리)을 입력하세요.`);
    if (newPin === null) return;
    if (!/^\d{4,12}$/.test(newPin)) { setAdminError("PIN은 숫자 4~12자리로 입력해 주세요."); return; }
    if (!window.confirm("PIN을 초기화하고 해당 사용자의 기존 로그인을 종료할까요?")) return;
    setAdminActionLoading(`pin-${account.userId}`); setAdminError("");
    try {
      await apiFetch(`/api/admin/users/${account.userId}/pin`, { method: "PATCH", body: JSON.stringify({ newPin }) });
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function createAdminQuiz(draft) {
    setAdminError("");
    try { await apiFetch("/api/admin/quizzes", { method: "POST", body: JSON.stringify(draft) }); await loadAdminQuizzes(0); }
    catch (error) { setAdminError(getErrorMessage(error)); throw error; }
  }
  async function loadAdminQuiz(quizSetId) {
    setAdminError("");
    try { return await apiFetch(`/api/admin/quizzes/${quizSetId}`); }
    catch (error) { setAdminError(getErrorMessage(error)); throw error; }
  }
  async function updateAdminQuiz(quizSetId, draft) {
    setAdminError("");
    try { await apiFetch(`/api/admin/quizzes/${quizSetId}`, { method: "PUT", body: JSON.stringify(draft) }); await loadAdminQuizzes(); }
    catch (error) { setAdminError(getErrorMessage(error)); throw error; }
  }
  async function deleteAdminQuiz(quizSetId) {
    setAdminError("");
    try { await apiFetch(`/api/admin/quizzes/${quizSetId}`, { method: "DELETE" }); await loadAdminQuizzes(); }
    catch (error) { setAdminError(getErrorMessage(error)); }
  }
  async function publishAdminQuiz(quizSetId) {
    setAdminError("");
    try { await apiFetch(`/api/admin/quizzes/${quizSetId}/publish`, { method: "POST" }); await loadAdminQuizzes(); }
    catch (error) { setAdminError(getErrorMessage(error)); }
  }

  useEffect(() => {
    if (user && view === "groups") {
      loadGroups();
    }
    if (user && view === "reviews") {
      loadReviews(reviewFilter);
    }
    if (user && view === "orbit") {
      loadOrbit(orbitPeriod, orbitAnchor);
    }
    if (user?.role === "ADMIN" && view === "admin") loadAdminConsole();
  }, [user, view]);

  useEffect(() => {
    if (user && view === "admin" && user.role !== "ADMIN") {
      router.replace(VIEW_PATHS.quiz);
    }
  }, [router, user, view]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const currentUser = await apiFetch("/api/auth/me");
        setUser(currentUser);
        if (pathname === "/") {
          router.replace(VIEW_PATHS.quiz);
        }
        await Promise.all([loadQuiz(), loadStreak(), loadWeekOrbit()]);
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
    if (pathname === "/") {
      router.replace(VIEW_PATHS.quiz);
    }
    await Promise.all([loadQuiz(), loadStreak(), loadWeekOrbit()]);
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      resetCsrfToken();
      setUser(null);
      setQuiz(null);
      setResult(null);
      setSelections({});
      setActivePassage(null);
      setStreak({ currentStreak: 0, completedToday: false });
      setWeekOrbit(null);
      router.replace(VIEW_PATHS.quiz);
      setGroups([]);
      setSelectedGroup(null);
      setGroupActivity(null);
      setGroupInvites([]);
      setLatestInviteCode("");
      setReviewData(null);
      setSelectedReviewId(null);
      setOrbitData(null);
      setLoggingOut(false);
    }
  }

  async function handlePinChanged() {
    setAccountDialogOpen(false);
    window.alert("PIN이 변경되었습니다. 새 PIN으로 다시 로그인해 주세요.");
    try { await handleLogout(); } catch { /* PIN 변경으로 이미 만료된 세션입니다. */ }
  }

  function handleSelect(questionId, optionId) {
    if (result) {
      return;
    }
    setSelections((current) => ({ ...current, [questionId]: optionId }));
    setSubmitError("");
  }

  async function handleSubmit() {
    if (!quiz || activePassage === null || Object.keys(selections).length !== 3) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    const answers = quiz.passages[activePassage].questions.map((question) => ({
        questionId: question.questionId,
        selectedOptionId: selections[question.questionId],
      }));

    try {
      const quizResult = await apiFetch(`/api/quizzes/${quiz.quizSetId}/attempts`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(quizResult);
      await Promise.all([loadStreak(), loadWeekOrbit()]);
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
      <AppHeader
        user={user}
        streak={streak}
        view={view}
        onAccountOpen={() => setAccountDialogOpen(true)}
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      {view === "groups" ? (
        <GroupHub
          groups={groups}
          selectedGroup={selectedGroup}
          activity={groupActivity}
          loading={groupsLoading}
          error={groupError}
          latestInviteCode={latestInviteCode}
          invites={groupInvites}
          actionMode={groupAction}
          actionSubmitting={groupActionSubmitting}
          actionError={groupActionError}
          onActionModeChange={(mode) => {
            setGroupActionError("");
            setGroupAction(mode);
          }}
          onActionSubmit={handleGroupAction}
          onSelectGroup={handleSelectGroup}
          onRenewInvite={handleRenewInvite}
          onRevokeInvite={handleRevokeInvite}
          onRemoveMember={handleRemoveMember}
          onTransferOwnership={handleTransferOwnership}
          onReload={() => loadGroups()}
        />
      ) : view === "orbit" ? (
        <OrbitHub
          data={orbitData}
          period={orbitPeriod}
          loading={orbitLoading}
          error={orbitError}
          onPeriodChange={changeOrbitPeriod}
          onMove={moveOrbit}
          onReload={() => loadOrbit(orbitPeriod, orbitAnchor)}
        />
      ) : view === "admin" && user.role === "ADMIN" ? (
        <AdminQuizHub
          currentUser={user}
          quizPage={adminQuizPage}
          generationPage={adminGenerationPage}
          generationDetail={adminGenerationDetail}
          userPage={adminUserPage}
          promptPage={adminPromptPage}
          generationFilters={adminGenerationFilters}
          loginLocks={adminLoginLocks}
          auditPage={adminAuditPage}
          operationsSummary={adminOperationsSummary}
          loading={adminLoading}
          actionLoading={adminActionLoading}
          error={adminError}
          onCreate={createAdminQuiz}
          onUpdate={updateAdminQuiz}
          onDelete={deleteAdminQuiz}
          onLoad={loadAdminQuiz}
          onPublish={publishAdminQuiz}
          onGenerate={generateAdminQuiz}
          onRetry={retryAdminGeneration}
          onLoadGeneration={loadAdminGeneration}
          onUpdateRole={updateAdminRole}
          onUpdateEnabled={updateAdminEnabled}
          onResetPin={resetAdminPin}
          onLoadPrompts={loadAdminPrompts}
          onCreatePrompt={createAdminPrompt}
          onActivatePrompt={activateAdminPrompt}
          onRefresh={refreshAdminConsole}
          onQuizPageChange={loadAdminQuizzes}
          onGenerationPageChange={loadAdminGenerationPage}
          onGenerationFilterChange={filterAdminGeneration}
          onUserPageChange={loadAdminUsers}
          onLoadSecurity={loadAdminSecurity}
          onUnlockLogin={unlockAdminLogin}
          onLoadOperations={loadAdminOperations}
        />
      ) : view === "reviews" ? (
        <ReviewHub
          reviewData={reviewData}
          selectedReviewId={selectedReviewId}
          filter={reviewFilter}
          loading={reviewsLoading}
          error={reviewError}
          updating={reviewUpdating}
          onFilterChange={handleReviewFilter}
          onSelectReview={setSelectedReviewId}
          onUpdateReview={handleReviewUpdate}
          onReload={() => loadReviews(reviewFilter)}
        />
      ) : quizLoading ? (
        <section className={styles.quizLoading}>
          <Orbit size={28} />
          오늘의 지문을 불러오는 중...
        </section>
      ) : quiz ? (
        activePassage === null ? (
          <PassagePicker
            quiz={quiz}
            onChoose={(index) => {
              setActivePassage(index);
              setSelections({});
              setSubmitError("");
            }}
          />
        ) : (
          <div className={styles.appBody}>
            <QuizRail
              quiz={quiz}
              selectedCount={Object.keys(selections).length}
              activePassage={activePassage}
              onChangeArea={() => {
                setActivePassage(null);
                setSelections({});
                setSubmitError("");
              }}
              result={result}
              weekOrbit={weekOrbit}
            />
            <QuizWorkspace
              quiz={quiz}
              selections={selections}
              onSelect={handleSelect}
              activePassage={activePassage}
              result={result}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
              onContinue={loadQuiz}
            />
          </div>
        )
      ) : (
        <EmptyQuiz message={quizError} onRetry={loadQuiz} />
      )}
      <AccountPinDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} onChanged={handlePinChanged} />
    </main>
  );
}
