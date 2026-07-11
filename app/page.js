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
  Copy,
  Crown,
  Clock3,
  KeyRound,
  LogIn,
  LogOut,
  NotebookPen,
  Orbit,
  Plus,
  RefreshCw,
  Rocket,
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
                      <span><small>평균</small><strong>{member.averageScore}/9</strong></span>
                      <span><small>9/9</small><strong>{member.perfectCount}회</strong></span>
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
                  <small>9/9인 날은 복습 없이 처음부터 완전히 빛납니다.</small>
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
                : "9/9인 날의 행성은 복습 없이 처음부터 완전히 빛나요."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function AppHeader({ user, view, onViewChange, onLogout, loggingOut }) {
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
          <Orbit size={17} />
          나의 Orbit
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

function AdminQuizHub({ quizzes, loading, error, onCreate, onPublish }) {
  const [draft, setDraft] = useState(blankAdminQuiz);
  const [activePassage, setActivePassage] = useState(0);
  const [saving, setSaving] = useState(false);

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
    try { await onCreate(draft); setDraft(blankAdminQuiz()); setActivePassage(0); }
    finally { setSaving(false); }
  }

  return (
    <section className={styles.adminHub}>
      <aside className={styles.adminRail}>
        <div className={styles.adminRailHeading}><span>QUIZ STUDIO</span><h2>퀴즈 관리</h2></div>
        <div className={styles.adminQuizList}>
          {quizzes.map((quiz) => (
            <article key={quiz.quizSetId}>
              <div><strong>{quiz.challengeDate}</strong><small>{quiz.status}</small></div>
              {quiz.status !== "PUBLISHED" && <button type="button" onClick={() => onPublish(quiz.quizSetId)}>발행</button>}
            </article>
          ))}
        </div>
      </aside>
      <form className={styles.adminEditor} onSubmit={submit}>
        <header className={styles.adminEditorHeader}>
          <div><span>MANUAL DRAFT</span><h1>새 퀴즈 만들기</h1><p>고3 난이도 · 3지문 · 9문제</p></div>
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
        <footer className={styles.adminFooter}><span>{loading ? "목록 갱신 중" : "모든 지문 입력 후 초안으로 저장됩니다."}</span><button className={styles.primaryButton} type="submit" disabled={saving}>{saving ? "저장 중..." : "DRAFT 저장"}</button></footer>
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
    : "나의 학습 궤도";

  return (
    <section className={styles.orbitHub}>
      <header className={styles.orbitHeader}>
        <div>
          <span>STUDY CONSTELLATION</span>
          <h1>나의 Orbit</h1>
          <p>문제를 푼 날은 행성이 생기고, 오답을 모두 회복하면 완전히 빛나요.</p>
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
        <div className={styles.orbitState}><Orbit size={28} /> 궤도를 불러오는 중...</div>
      ) : error ? (
        <div className={styles.orbitState}><p>{error}</p><button type="button" onClick={onReload}>다시 시도</button></div>
      ) : data ? (
        <>
          <div className={styles.orbitSummary}>
            <div><span>학습한 날</span><strong>{data.completedDays}</strong><small>일</small></div>
            <div><span>완전히 빛난 행성</span><strong>{data.fullyLitDays}</strong><small>개</small></div>
            <div><span>점등률</span><strong>{data.completedDays ? Math.round(data.fullyLitDays * 100 / data.completedDays) : 0}</strong><small>%</small></div>
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
                    <small>미응시</small>
                  ) : day.status === "LIT" ? (
                    <small className={styles.orbitComplete}>{day.score}/9 · 점등 완료</small>
                  ) : (
                    <small>{day.score}/9 · 복습 {day.recoveredCount}/{day.wrongCount}</small>
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
  const [activePassage, setActivePassage] = useState(0);
  const [selections, setSelections] = useState({});
  const [result, setResult] = useState(null);
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
      setActivePassage(0);
    } catch (error) {
      setQuiz(null);
      setQuizError(getErrorMessage(error));
    } finally {
      setQuizLoading(false);
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
    setView("quiz");
    await loadQuiz();
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
      <AppHeader
        user={user}
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
        <AdminQuizHub quizzes={adminQuizzes} loading={adminLoading} error={adminError} onCreate={createAdminQuiz} onPublish={publishAdminQuiz} />
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
