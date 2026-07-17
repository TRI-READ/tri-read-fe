"use client";

import {
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
  Flame,
  KeyRound,
  Landmark,
  LogIn,
  LogOut,
  NotebookPen,
  Orbit,
  Plus,
  RefreshCw,
  Rocket,
  Scale,
  Send,
  Sparkles,
  UserPlus,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";
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
    QUIZ_ALREADY_COMPLETED: "이미 완료한 지문이에요. 다른 영역을 골라 주세요.",
    AUTHENTICATION_REQUIRED: "다시 로그인해 주세요.",
    GROUP_ALREADY_JOINED: "이미 참여 중인 그룹이에요.",
    GROUP_NOT_FOUND: "그룹을 찾을 수 없어요.",
    GROUP_OWNER_REQUIRED: "그룹 소유자만 초대 코드를 바꿀 수 있어요.",
    INVALID_INVITE_CODE: "초대 코드가 올바르지 않거나 만료됐어요.",
    ANSWER_REVIEW_NOT_FOUND: "오답 기록을 찾을 수 없어요.",
    INVALID_REVIEW_FILTER: "오답 필터를 다시 확인해 주세요.",
    INVALID_REVIEW_STATUS: "복습 상태를 변경하지 못했어요.",
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

function GroupHub({
  groups,
  selectedGroup,
  activity,
  loading,
  error,
  latestInviteCode,
  actionMode,
  actionSubmitting,
  actionError,
  onActionModeChange,
  onActionSubmit,
  onSelectGroup,
  onRenewInvite,
  onReload,
}) {
  const [copied, setCopied] = useState(false);

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
                  <button className={styles.secondaryButton} type="button" onClick={onRenewInvite}>
                    <RefreshCw size={16} />
                    새 코드 발급
                  </button>
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
                    <span>{member.role === "OWNER" ? "OWNER" : "MEMBER"}</span>
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

function AppHeader({ user, streak, view, onViewChange, onLogout, loggingOut }) {
  return (
    <header className={styles.appHeader}>
      <Brand />
      <nav className={styles.headerNav} aria-label="주요 화면">
        <button
          type="button"
          className={view === "quiz" ? styles.headerNavActive : styles.headerNavItem}
          onClick={() => onViewChange("quiz")}
        >
          <BookOpen size={17} />
          오늘 퀴즈
        </button>
        <button
          type="button"
          className={view === "groups" ? styles.headerNavActive : styles.headerNavItem}
          onClick={() => onViewChange("groups")}
        >
          <UsersRound size={17} />
          그룹
        </button>
        <button
          type="button"
          className={view === "orbit" ? styles.headerNavActive : styles.headerNavItem}
          onClick={() => onViewChange("orbit")}
        >
          <CalendarDays size={17} />
          학습 기록
        </button>
        <button
          type="button"
          className={view === "reviews" ? styles.headerNavActive : styles.headerNavItem}
          onClick={() => onViewChange("reviews")}
        >
          <NotebookPen size={17} />
          오답노트
        </button>
        {user.role === "ADMIN" && (
          <button
            type="button"
            className={view === "admin" ? styles.headerNavActive : styles.headerNavItem}
            onClick={() => onViewChange("admin")}
          >
            <Rocket size={17} />
            퀴즈 관리
          </button>
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

function AdminQuizHub({ quizzes, loading, error, onCreate, onUpdate, onDelete, onLoad, onPublish }) {
  const [draft, setDraft] = useState(blankAdminQuiz);
  const [activePassage, setActivePassage] = useState(0);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

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
  }
  async function deleteQuiz(quizSetId) {
    if (!window.confirm("이 DRAFT를 삭제할까요?")) return;
    await onDelete(quizSetId); if (editingId === quizSetId) resetEditor();
  }

  return (
    <section className={styles.adminHub}>
      <aside className={styles.adminRail}>
        <div className={styles.adminRailHeading}><span>QUIZ STUDIO</span><h2>퀴즈 관리</h2></div>
        <button className={styles.adminNewButton} type="button" onClick={resetEditor}><Plus size={15} /> 새 퀴즈</button>
        <div className={styles.adminQuizList}>
          {quizzes.map((quiz) => (
            <article key={quiz.quizSetId}>
              <div><strong>{quiz.challengeDate}</strong><small>{quiz.status}</small></div>
              {quiz.status !== "PUBLISHED" && <div className={styles.adminListActions}>
                <button type="button" onClick={() => editQuiz(quiz.quizSetId)}>수정</button>
                <button type="button" onClick={() => onPublish(quiz.quizSetId)}>발행</button>
                <button type="button" onClick={() => deleteQuiz(quiz.quizSetId)} aria-label={`${quiz.challengeDate} 초안 삭제`} title="초안 삭제"><X size={14} /></button>
              </div>}
            </article>
          ))}
        </div>
      </aside>
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

export default function Home() {
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
  const [view, setView] = useState("quiz");
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupActivity, setGroupActivity] = useState(null);
  const [groupAction, setGroupAction] = useState(null);
  const [groupActionSubmitting, setGroupActionSubmitting] = useState(false);
  const [groupActionError, setGroupActionError] = useState("");
  const [latestInviteCode, setLatestInviteCode] = useState("");
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
  const [adminQuizzes, setAdminQuizzes] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
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

  async function loadGroups(preferredGroupId = null) {
    setGroupsLoading(true);
    setGroupError("");
    try {
      const myGroups = await apiFetch("/api/groups/my");
      setGroups(myGroups);
      const groupId = preferredGroupId || selectedGroup?.groupId || myGroups[0]?.groupId;
      if (groupId) {
        const [detail, activity] = await Promise.all([
          apiFetch(`/api/groups/${groupId}`),
          apiFetch(`/api/groups/${groupId}/activity`),
        ]);
        setSelectedGroup(detail);
        setGroupActivity(activity);
      } else {
        setSelectedGroup(null);
        setGroupActivity(null);
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
      const [detail, activity] = await Promise.all([
        apiFetch(`/api/groups/${groupId}`),
        apiFetch(`/api/groups/${groupId}/activity`),
      ]);
      setSelectedGroup(detail);
      setGroupActivity(activity);
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
      setSelectedGroup(detail);
      setGroupActivity(await apiFetch(`/api/groups/${detail.groupId}/activity`));
      setLatestInviteCode(groupAction === "create" ? response.inviteCode : "");
      setGroupAction(null);
      const myGroups = await apiFetch("/api/groups/my");
      setGroups(myGroups);
    } catch (error) {
      setGroupActionError(getErrorMessage(error));
    } finally {
      setGroupActionSubmitting(false);
    }
  }

  async function handleRenewInvite() {
    if (!selectedGroup) {
      return;
    }
    setGroupError("");
    try {
      const response = await apiFetch(`/api/groups/${selectedGroup.groupId}/invites`, {
        method: "POST",
      });
      setLatestInviteCode(response.inviteCode);
    } catch (error) {
      setGroupError(getErrorMessage(error));
    }
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

  async function loadAdminQuizzes() {
    setAdminLoading(true); setAdminError("");
    try { setAdminQuizzes(await apiFetch("/api/admin/quizzes")); }
    catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function createAdminQuiz(draft) {
    setAdminError("");
    try { await apiFetch("/api/admin/quizzes", { method: "POST", body: JSON.stringify(draft) }); await loadAdminQuizzes(); }
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
    if (user?.role === "ADMIN" && view === "admin") loadAdminQuizzes();
  }, [user, view]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const currentUser = await apiFetch("/api/auth/me");
        setUser(currentUser);
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
    setView("quiz");
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
      setView("quiz");
      setGroups([]);
      setSelectedGroup(null);
      setGroupActivity(null);
      setLatestInviteCode("");
      setReviewData(null);
      setSelectedReviewId(null);
      setOrbitData(null);
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
        onViewChange={setView}
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
        <AdminQuizHub quizzes={adminQuizzes} loading={adminLoading} error={adminError} onCreate={createAdminQuiz} onUpdate={updateAdminQuiz} onDelete={deleteAdminQuiz} onLoad={loadAdminQuiz} onPublish={publishAdminQuiz} />
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
    </main>
  );
}
