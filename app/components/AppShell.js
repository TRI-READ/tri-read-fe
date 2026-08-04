"use client";

import {
  BookOpen,
  CalendarDays,
  CircleUserRound,
  Flame,
  LogOut,
  NotebookPen,
  Orbit,
  Rocket,
  UserCog,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { VIEW_PATHS } from "../lib/triReadUi";
import styles from "../page.module.css";

export function Brand() {
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

export function LoadingScreen() {
  return (
    <main className={styles.loadingScreen}>
      <Brand />
      <span className={styles.loadingLine} />
    </main>
  );
}

export function AppHeader({ user, streak, view, onAccountOpen, onLogout, loggingOut }) {
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
