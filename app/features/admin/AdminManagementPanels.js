"use client";

import { CheckCircle2, KeyRound, Power, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDateTime } from "../../lib/triReadUi";
import styles from "../../page.module.css";
import { AdminPagination } from "./AdminShared";

export function AdminQuizManagementPanel({ quizPage, filters, loading, actionLoading, error, onFilter, onPageChange, onEdit, onReview, onPublish, onDelete, onBulk }) {
  const quizzes = quizPage?.page?.items || [];
  const [status, setStatus] = useState(filters?.status || "");
  const [challengeDate, setChallengeDate] = useState(filters?.challengeDate || "");
  const [keyword, setKeyword] = useState(filters?.keyword || "");
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setStatus(filters?.status || "");
    setChallengeDate(filters?.challengeDate || "");
    setKeyword(filters?.keyword || "");
    setSelectedIds([]);
  }, [filters?.status, filters?.challengeDate, filters?.keyword, quizPage?.page?.page]);

  function submit(event) {
    event.preventDefault();
    onFilter({ status, challengeDate, keyword: keyword.trim() });
  }

  function toggle(quizSetId) {
    setSelectedIds((current) => current.includes(quizSetId)
      ? current.filter((id) => id !== quizSetId)
      : [...current, quizSetId]);
  }

  async function runBulk(action) {
    if (!selectedIds.length) return;
    const label = action === "publish" ? "발행" : "삭제";
    if (!window.confirm(`선택한 ${selectedIds.length}개 퀴즈를 ${label}할까요?`)) return;
    await onBulk(action, selectedIds);
    setSelectedIds([]);
  }

  return (
    <div className={styles.adminWorkspace}>
      <header className={styles.adminEditorHeader}>
        <div><span>QUIZ WORKFLOW</span><h1>퀴즈 관리</h1><p>초안 검토부터 발행까지 한 화면에서 처리합니다.</p></div>
      </header>
      {error && <div className={styles.adminError}>{error}</div>}
      <form className={styles.adminLogFilters} onSubmit={submit}>
        <label>상태<select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">전체</option><option value="DRAFT">초안</option><option value="REVIEWED">검토 완료</option><option value="PUBLISHED">발행</option>
        </select></label>
        <label>대상 날짜<input type="date" value={challengeDate} onChange={(event) => setChallengeDate(event.target.value)} /></label>
        <label>제목·주제<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="검색어" /></label>
        <button type="submit"><Search size={14} /> 조회</button>
        <button type="button" onClick={() => { setStatus(""); setChallengeDate(""); setKeyword(""); onFilter({ status: "", challengeDate: "", keyword: "" }); }}>초기화</button>
      </form>
      {selectedIds.length > 0 && <div className={styles.adminSelectionBar}>
        <strong>{selectedIds.length}개 선택</strong>
        <button type="button" onClick={() => runBulk("publish")} disabled={Boolean(actionLoading)}><CheckCircle2 size={14} /> 일괄 발행</button>
        <button type="button" onClick={() => runBulk("delete")} disabled={Boolean(actionLoading)}><Trash2 size={14} /> 일괄 삭제</button>
      </div>}
      {quizzes.length ? <div className={styles.adminQuizTable}>
        {quizzes.map((quiz) => <article key={quiz.quizSetId} className={selectedIds.includes(quiz.quizSetId) ? styles.adminQuizRowSelected : ""}>
          <input type="checkbox" checked={selectedIds.includes(quiz.quizSetId)} onChange={() => toggle(quiz.quizSetId)} aria-label={`퀴즈 ${quiz.quizSetId} 선택`} />
          <div><strong>{quiz.challengeDate}</strong><small>#{quiz.quizSetId} · 영역 {quiz.variantCode || "-"}</small></div>
          <span className={`${styles.adminStatus} ${styles[`adminStatus${quiz.status}`] || ""}`}>{quiz.status}</span>
          <time>{formatDateTime(quiz.createdAt)}</time>
          <div className={styles.adminQuizActions}>
            {quiz.status === "DRAFT" && <button type="button" onClick={() => onEdit(quiz.quizSetId)}>편집</button>}
            {quiz.status === "DRAFT" && <button type="button" onClick={() => onReview(quiz.quizSetId)}>검토 완료</button>}
            {quiz.status === "REVIEWED" && <button type="button" onClick={() => onPublish(quiz.quizSetId)}>발행</button>}
            {quiz.status !== "PUBLISHED" && <button type="button" onClick={() => onDelete(quiz.quizSetId)}>삭제</button>}
          </div>
        </article>)}
      </div> : <div className={styles.adminEmpty}>{loading ? "퀴즈를 불러오는 중입니다." : "조건에 맞는 퀴즈가 없습니다."}</div>}
      <AdminPagination pagination={quizPage?.page} onPageChange={onPageChange} />
    </div>
  );
}

export function AdminUsersPanel({ currentUser, userPage, activity, actionLoading, error, onPageChange, onLoadActivity, onUpdateRole, onUpdateEnabled, onResetPin }) {
  const users = userPage?.items || [];
  return (
    <div className={styles.adminWorkspace}>
      <header className={styles.adminEditorHeader}><div><span>USER OPERATIONS</span><h1>사용자 관리</h1><p>권한과 계정 상태, 최근 학습 활동을 함께 확인합니다.</p></div></header>
      {error && <div className={styles.adminError}>{error}</div>}
      <div className={styles.adminUserTable}>
        <div className={styles.adminUserHeader}><span>사용자</span><span>최근 로그인</span><span>권한</span><span>계정 관리</span></div>
        {users.map((account) => <article key={account.userId}>
          <button className={styles.adminUserIdentity} type="button" onClick={() => onLoadActivity(account.userId)}>
            <strong>{account.displayName}</strong><small>@{account.loginName}{account.userId === currentUser.userId ? " · 현재 계정" : ""}</small>
          </button>
          <time>{account.lastLoginAt ? formatDateTime(account.lastLoginAt) : "로그인 기록 없음"}</time>
          <select value={account.role} disabled={!account.enabled || actionLoading === `role-${account.userId}` || account.userId === currentUser.userId} onChange={(event) => onUpdateRole(account.userId, event.target.value)} aria-label={`${account.displayName} 권한`}>
            <option value="USER">사용자</option><option value="ADMIN">관리자</option>
          </select>
          <div className={styles.adminAccountActions}>
            <button type="button" onClick={() => onLoadActivity(account.userId)} title="활동 보기"><ShieldCheck size={14} /></button>
            <button type="button" onClick={() => onResetPin(account)} disabled={!account.enabled || Boolean(actionLoading)} title="PIN 초기화"><KeyRound size={14} /></button>
            <button type="button" onClick={() => onUpdateEnabled(account.userId, !account.enabled)} disabled={account.userId === currentUser.userId || Boolean(actionLoading)} className={account.enabled ? styles.adminDisableButton : styles.adminEnableButton} title={account.enabled ? "계정 중지" : "계정 활성화"}><Power size={14} /><span>{account.enabled ? "중지" : "활성화"}</span></button>
          </div>
        </article>)}
      </div>
      <AdminPagination pagination={userPage} onPageChange={onPageChange} />
      {activity && <section className={styles.adminUserActivity}>
        <div className={styles.adminSectionHeading}><div><span>USER #{activity.user?.userId}</span><h2>{activity.user?.displayName} 학습 활동</h2></div></div>
        <div className={styles.adminActivityMetrics}>
          <div><span>풀이</span><strong>{activity.stats?.totalAttempts || 0}회</strong></div>
          <div><span>학습일</span><strong>{activity.stats?.learningDays || 0}일</strong></div>
          <div><span>평균</span><strong>{Math.round(activity.stats?.averageScore || 0)}점</strong></div>
          <div><span>최근 완료</span><strong>{activity.stats?.lastCompletedAt ? formatDateTime(activity.stats.lastCompletedAt) : "-"}</strong></div>
        </div>
        <div className={styles.adminActivityList}>
          {(activity.recentAttempts || []).map((attempt) => <article key={attempt.attemptId}>
            <div><strong>{attempt.passageTitle || `지문 #${attempt.passageId}`}</strong><small>{attempt.challengeDate} · {attempt.attemptType}</small></div>
            <b>{attempt.score}점</b><time>{formatDateTime(attempt.completedAt)}</time>
          </article>)}
          {!activity.recentAttempts?.length && <div className={styles.adminEmpty}>최근 풀이 기록이 없습니다.</div>}
        </div>
      </section>}
    </div>
  );
}

export function AdminSecurityPanel({ loginLocks, auditPage, filters, actionLoading, error, onFilter, onPageChange, onUnlockLogin }) {
  const [action, setAction] = useState(filters?.action || "");
  const [actor, setActor] = useState(filters?.actor || "");
  const [from, setFrom] = useState(filters?.from || "");
  const [to, setTo] = useState(filters?.to || "");

  function submit(event) {
    event.preventDefault();
    onFilter({ action: action.trim(), actor: actor.trim(), from, to });
  }

  return (
    <div className={styles.adminWorkspace}>
      <header className={styles.adminEditorHeader}><div><span>SECURITY & AUDIT</span><h1>보안·감사</h1><p>잠긴 로그인과 관리자 변경 이력을 추적합니다.</p></div></header>
      {error && <div className={styles.adminError}>{error}</div>}
      <section className={styles.adminSecuritySection}>
        <div className={styles.adminSectionHeading}><div><span>LOGIN LOCKS</span><h2>로그인 잠금</h2></div><strong>{loginLocks.length}건</strong></div>
        {loginLocks.length ? <div className={styles.adminLockList}>{loginLocks.map((lock) => <article key={`${lock.loginName}-${lock.expiresAt}`}>
          <div><strong>@{lock.loginName}</strong><small>{lock.clientAddress} · 실패 {lock.failures}회</small></div>
          <time>{formatDateTime(lock.expiresAt)}까지</time>
          <button type="button" onClick={() => onUnlockLogin(lock.loginName)} disabled={actionLoading === `unlock-${lock.loginName}`}>잠금 해제</button>
        </article>)}</div> : <div className={styles.adminEmpty}>현재 잠긴 로그인이 없습니다.</div>}
      </section>
      <section className={styles.adminSecuritySection}>
        <div className={styles.adminSectionHeading}><div><span>ADMIN AUDIT</span><h2>관리자 작업 이력</h2></div></div>
        <form className={styles.adminLogFilters} onSubmit={submit}>
          <label>작업<input value={action} onChange={(event) => setAction(event.target.value)} placeholder="예: QUIZ_PUBLISH" /></label>
          <label>작업자<input value={actor} onChange={(event) => setActor(event.target.value)} placeholder="로그인 아이디" /></label>
          <label>시작일<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label>종료일<input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
          <button type="submit"><Search size={14} /> 조회</button>
        </form>
        {(auditPage?.items || []).length ? <div className={styles.adminAuditList}>{auditPage.items.map((audit) => <article key={audit.auditLogId}>
          <span className={styles.adminAuditAction}>{audit.action}</span>
          <div><strong>{audit.targetType}{audit.targetId ? ` #${audit.targetId}` : ""}</strong><small>@{audit.actorLoginName || "삭제된 사용자"}</small></div>
          <time>{formatDateTime(audit.createdAt)}</time>
        </article>)}</div> : <div className={styles.adminEmpty}>조건에 맞는 관리자 작업이 없습니다.</div>}
        <AdminPagination pagination={auditPage} onPageChange={onPageChange} />
      </section>
    </div>
  );
}
