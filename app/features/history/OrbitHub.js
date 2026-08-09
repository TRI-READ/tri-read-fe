"use client";

import { ArrowLeft, ArrowRight, Orbit } from "lucide-react";
import styles from "../../page.module.css";

export function OrbitHub({ data, period, loading, error, onPeriodChange, onMove, onReload }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
              const isFuture = date > today;
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
                    <small>{isFuture ? "예정" : "미완료"}</small>
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
