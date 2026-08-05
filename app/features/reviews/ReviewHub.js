"use client";

import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  NotebookPen,
  Orbit,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import { PassageParagraphs } from "../../components/PassageParagraphs";
import styles from "../../page.module.css";

export function ReviewHub({
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
                <PassageParagraphs content={selectedReview.passageContent} />
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
