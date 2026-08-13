"use client";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  NotebookPen,
  Orbit,
  Send,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { PassageParagraphs } from "../../components/PassageParagraphs";
import { WEEKDAYS, PASSAGE_AREAS, formatToday } from "../../lib/triReadUi";
import styles from "./QuizViews.module.css";

export function WeekOrbit({ days = [] }) {
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

export function getQuizAttempts(quiz) {
  if (Array.isArray(quiz.attempts) && quiz.attempts.length > 0) {
    return quiz.attempts;
  }
  return quiz.attempt ? [quiz.attempt] : [];
}

export function PassagePicker({ quiz, onChoose }) {
  const attempts = getQuizAttempts(quiz);
  const attemptsByPassage = new Map(attempts.map((attempt) => [attempt.passageId, attempt]));
  const primaryCompleted = attempts.some((attempt) => attempt.attemptType === "PRIMARY") || Boolean(quiz.attempt);
  const allCompleted = attempts.length === quiz.passages.length;

  return (
    <section className={styles.passagePicker}>
      <header className={styles.passagePickerHeader}>
        <p className={styles.eyebrow}>{primaryCompleted ? "오늘 기본 학습 완료" : formatToday()}</p>
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
                <small>{area.label}{primaryCompleted ? " · 보너스" : ""}</small>
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

export function QuizRail({ quiz, selectedCount, activePassage, onChangeArea, result, weekOrbit }) {
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

export function QuestionBlock({ question, number, selectedOptionId, onSelect, resultItem }) {
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

export function QuizWorkspace({
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
  const [passageOpen, setPassageOpen] = useState(false);
  const totalQuestions = passage.questions.length;
  const nextQuestionIndex = passage.questions.findIndex(
    (question) => !selections[question.questionId],
  );
  const progressCount = result ? totalQuestions : selectedCount;
  const progressLabel = result
    ? "채점 완료"
    : nextQuestionIndex === -1
      ? "제출 준비"
      : `다음 Q${nextQuestionIndex + 1}`;

  return (
    <section className={styles.quizWorkspace}>
      {result && (
        <header className={styles.resultBanner}>
          <div className={styles.scoreOrb}>
            <strong>{result.score}</strong>
            <span>/ 3</span>
          </div>
          <div>
            <p className={styles.eyebrow}>{result.attemptType === "BONUS" ? "보너스 학습 완료" : "오늘 학습 완료"}</p>
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

      <div className={styles.mobileQuizTools} data-testid="mobile-quiz-tools">
        <div className={styles.mobileQuizProgress}>
          <div>
            <span>{progressLabel}</span>
            <strong>{progressCount} / {totalQuestions} 답변</strong>
          </div>
          <div className={styles.mobileProgressTrack} aria-hidden="true">
            <span style={{ width: `${(progressCount / totalQuestions) * 100}%` }} />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setPassageOpen(true)}
          data-testid="open-passage-review"
        >
          <BookOpen size={16} />
          지문 다시 보기
        </button>
      </div>

      {passageOpen && (
        <div
          className={styles.mobilePassageOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-passage-title"
          data-testid="mobile-passage-dialog"
        >
          <section className={styles.mobilePassageDialog}>
            <header>
              <div>
                <small>{area.label}</small>
                <h2 id="mobile-passage-title">{passage.title}</h2>
              </div>
              <button
                type="button"
                aria-label="지문 닫기"
                onClick={() => setPassageOpen(false)}
                data-testid="close-passage-review"
              >
                <X size={20} />
              </button>
            </header>
            <PassageParagraphs content={passage.content} className={styles.passageBody} />
          </section>
        </div>
      )}

      <div className={styles.readingLayout}>
        <article className={styles.passageText}>
          <div className={styles.readingMeta}>
            <BookOpen size={18} />
            <span>고3 고정 난이도</span>
            <Clock3 size={17} />
            <span>권장 15분</span>
          </div>
          <PassageParagraphs content={passage.content} className={styles.passageBody} />
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
            <p className={styles.eyebrow}>참고 자료</p>
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

export function CompletedView({ quiz, attempts = getQuizAttempts(quiz) }) {
  const attemptsByPassage = new Map(attempts.map((attempt) => [attempt.passageId, attempt]));
  const completedPassages = quiz.passages.filter((passage) => attemptsByPassage.has(passage.passageId));

  return (
    <section className={styles.completedView}>
      <div className={styles.completedReadingList}>
        <div className={styles.completedReadingHeading}>
          <div>
            <p className={styles.eyebrow}>학습 기록</p>
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

              <PassageParagraphs content={passage.content} className={styles.completedPassageText} />

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

export function EmptyQuiz({ code, message, onRetry }) {
  const isEmpty = code === "TODAY_QUIZ_NOT_FOUND";

  return (
    <section className={styles.emptyQuiz} role={isEmpty ? "status" : "alert"}>
      <span>
        <Orbit size={30} />
      </span>
      <h1>{isEmpty ? "오늘 준비된 퀴즈가 없어요" : "오늘의 퀴즈를 불러오지 못했어요"}</h1>
      <p>{message || (isEmpty ? "오늘은 아직 등록된 퀴즈가 없어요." : "잠시 후 다시 시도해 주세요.")}</p>
      <button className={styles.secondaryButton} type="button" onClick={onRetry}>
        {isEmpty ? "다시 확인" : "다시 시도"}
      </button>
    </section>
  );
}
