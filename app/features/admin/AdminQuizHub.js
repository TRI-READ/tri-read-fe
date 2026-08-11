"use client";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  History,
  KeyRound,
  LockKeyhole,
  NotebookPen,
  Plus,
  Power,
  RefreshCw,
  RotateCcw,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatDateTime, formatDuration, formatBytes } from "../../lib/triReadUi";
import styles from "../../page.module.css";

export function blankAdminQuiz() {
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

const QUALITY_STATUS_LABELS = {
  REVIEW_REQUIRED: "검토 필요",
  DATA_INSUFFICIENT: "데이터 부족",
  NORMAL: "정상",
};

export function AdminPagination({ pagination, onPageChange, dark = false }) {
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

function AdminQuizQualityPanel({ qualityPage, filters, loading, error, onFilter, onPageChange }) {
  const [status, setStatus] = useState(filters?.status || "");
  const [keyword, setKeyword] = useState(filters?.keyword || "");
  const questions = qualityPage?.page?.items || [];
  const totalQuestionCount = qualityPage?.totalQuestionCount || 0;
  const reviewRequiredCount = qualityPage?.reviewRequiredCount || 0;
  const dataInsufficientCount = qualityPage?.dataInsufficientCount || 0;
  const normalCount = qualityPage?.normalCount || 0;
  const statusCards = [
    ["", "전체 문항", totalQuestionCount, "All"],
    ["REVIEW_REQUIRED", "검토 필요", reviewRequiredCount, "Review"],
    ["DATA_INSUFFICIENT", "데이터 부족", dataInsufficientCount, "Waiting"],
    ["NORMAL", "정상", normalCount, "Normal"],
  ];

  useEffect(() => {
    setStatus(filters?.status || "");
    setKeyword(filters?.keyword || "");
  }, [filters?.status, filters?.keyword]);

  function submit(event) {
    event.preventDefault();
    onFilter({ status, keyword: keyword.trim() });
  }

  function applyStatus(nextStatus) {
    setStatus(nextStatus);
    onFilter({ status: nextStatus, keyword: keyword.trim() });
  }

  return (
    <div className={styles.adminWorkspace}>
      <header className={styles.adminEditorHeader}>
        <div>
          <span>LEARNING DATA</span>
          <h1>퀴즈 품질</h1>
          <p>실제 풀이 결과에서 너무 쉽거나 어려운 문항과 오답 쏠림을 확인합니다.</p>
        </div>
      </header>
      {error && <div className={styles.adminError}>{error}</div>}
      <div className={styles.qualityMetricGrid}>
        {statusCards.map(([value, label, count, tone]) => (
          <button
            key={value || "ALL"}
            type="button"
            className={`${styles.qualityMetricCard} ${styles[`qualityMetric${tone}`]} ${status === value ? styles.qualityMetricActive : ""}`}
            onClick={() => applyStatus(value)}
            aria-pressed={status === value}
          >
            <span>{label}</span>
            <strong>{count}</strong>
            <small>{value ? "해당 문항만 보기" : "발행 문항 기준"}</small>
          </button>
        ))}
      </div>

      <section className={styles.qualityPolicy} aria-label="문항 품질 판정 기준">
        <div><strong>검토 필요</strong><span>응답 5건 이상에서 정답률이 30% 미만·90% 초과이거나 특정 오답에 70% 이상 집중</span></div>
        <div><strong>데이터 부족</strong><span>응답이 5건 미만이라 아직 난이도를 판단하기 어려운 문항</span></div>
        <div><strong>운영 원칙</strong><span>지표는 검토 우선순위만 제시하며 문항을 자동 삭제하거나 발행 취소하지 않음</span></div>
      </section>

      <form className={styles.qualityFilters} onSubmit={submit}>
        <label>상태<select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">전체</option>
          <option value="REVIEW_REQUIRED">검토 필요</option>
          <option value="DATA_INSUFFICIENT">데이터 부족</option>
          <option value="NORMAL">정상</option>
        </select></label>
        <label>검색<input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="지문 제목, 주제, 문제" /></label>
        <button type="submit">조회</button>
        <button type="button" onClick={() => {
          setStatus("");
          setKeyword("");
          onFilter({ status: "", keyword: "" });
        }}>초기화</button>
      </form>

      <div className={styles.qualityResultHeading}>
        <div><span>REVIEW QUEUE</span><h2>{status ? QUALITY_STATUS_LABELS[status] : "검토 우선순위"}</h2></div>
        <strong>{qualityPage?.page?.totalElements || 0}개 문항</strong>
      </div>

      {loading && !questions.length ? <div className={styles.adminEmpty}>품질 정보를 불러오는 중입니다.</div>
        : questions.length ? <div className={styles.qualityList}>
          {questions.map((question) => (
            <article className={styles.qualityItem} key={question.questionId}>
              <header>
                <div>
                  <span>{question.challengeDate} · {question.variantCode}형 · 지문 {question.passagePosition}</span>
                  <h2>Q{question.questionPosition}. {question.questionContent}</h2>
                  <p>{question.passageTitle || "제목 없음"} · {question.topic || "주제 미분류"}</p>
                </div>
                <span className={`${styles.qualityStatus} ${styles[`qualityStatus${question.status}`] || ""}`}>
                  {QUALITY_STATUS_LABELS[question.status] || question.status}
                </span>
              </header>
              <div className={styles.qualitySummary}>
                <div><span>응답</span><strong>{question.responseCount}건</strong></div>
                <div><span>정답률</span><strong>{Math.round(question.correctRate)}%</strong></div>
                <div><span>오답</span><strong>{question.incorrectCount}건</strong></div>
              </div>
              {question.reasons?.length > 0 && <ul className={styles.qualityReasons}>
                {question.reasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>}
              <div className={styles.qualityOptions}>
                {question.options.map((option) => (
                  <div key={option.optionId}>
                    <span className={option.correct ? styles.qualityCorrectOption : ""}>
                      {option.position}. {option.content}{option.correct ? " · 정답" : ""}
                    </span>
                    <div><i style={{ width: `${Math.min(100, option.selectionRate)}%` }} /></div>
                    <b>{option.selectedCount}명 · {Math.round(option.selectionRate)}%</b>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div> : <div className={styles.adminEmpty}>조건에 맞는 문항이 없습니다.</div>}
      <AdminPagination pagination={qualityPage?.page} onPageChange={onPageChange} />
    </div>
  );
}

export function AdminPromptPanel({ promptPage, loading, actionLoading, error, onLoad, onCreate, onActivate }) {
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

export function AdminOperationsPanel({
  summary, qualityPage, notificationStatus, notice, loading, actionLoading, error,
  onLoad, onTestNotification, onOpenQuality, onOpenGeneration,
}) {
  const ai = summary?.aiToday || {};
  const quality = summary?.quality || {};
  const reviewRequiredCount = qualityPage?.reviewRequiredCount || 0;
  const dataInsufficientCount = qualityPage?.dataInsufficientCount || 0;
  const normalCount = qualityPage?.normalCount || 0;
  const totalQuestionCount = qualityPage?.totalQuestionCount || 0;
  const shortageCount = summary?.inventory?.filter((item) => item.shortage).length || 0;
  const backupStatus = summary?.lastBackupRun?.status || "UNKNOWN";
  const aiLimit = summary?.aiDailyLimit || 0;
  const aiUsageRate = aiLimit ? Math.min(100, (ai.totalCount || 0) * 100 / aiLimit) : 0;
  const attentionCount = reviewRequiredCount + shortageCount
    + (backupStatus === "FAILED" ? 1 : 0) + (summary?.activeLoginLocks || 0);
  const notificationUnknown = notificationStatus == null;
  const notificationReady = notificationStatus?.enabled && notificationStatus?.configured;
  const notificationLabel = notificationUnknown
    ? (loading ? "Discord 확인 중" : "Discord 상태 확인 실패")
    : (notificationReady ? "Discord 연결됨" : "Discord 설정 필요");
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
        <div className={styles.adminHeaderActions}>
          <span className={`${styles.opsAttentionBadge} ${attentionCount ? styles.opsAttentionWarning : styles.opsAttentionClear}`}>
            {attentionCount ? `확인 필요 ${attentionCount}` : "운영 정상"}
          </span>
          <span className={`${styles.adminNotificationState} ${notificationReady ? styles.adminNotificationReady : ""}`}>
            <Send size={14} /> {notificationLabel}
          </span>
          <button
            className={styles.adminOutlineButton}
            type="button"
            onClick={onTestNotification}
            disabled={!notificationReady || Boolean(actionLoading)}
          >
            <Send size={15} /> {actionLoading === "discord-test" ? "전송 중" : "테스트 알림"}
          </button>
          <button className={styles.adminOutlineButton} type="button" onClick={onLoad} disabled={loading}>
            <RefreshCw size={15} /> {loading ? "확인 중" : "새로고침"}
          </button>
        </div>
      </header>
      {error && <div className={styles.adminError}>{error}</div>}
      {notice && <div className={styles.adminSuccess}>{notice}</div>}
      {!summary ? <div className={styles.adminEmpty}>운영 정보를 불러오는 중입니다.</div> : <>
        <section className={styles.opsFocusGrid} aria-label="운영 우선 확인 항목">
          <article className={shortageCount ? styles.opsFocusWarning : styles.opsFocusHealthy}>
            <span>QUIZ INVENTORY</span>
            <strong>{shortageCount ? `${shortageCount}일 부족` : "7일 준비 완료"}</strong>
            <p>{shortageCount ? "생성 일정과 발행 대기 문항을 확인하세요." : "향후 7일 필수 재고가 확보됐습니다."}</p>
          </article>
          <article className={reviewRequiredCount ? styles.opsFocusWarning : styles.opsFocusHealthy}>
            <span>QUESTION QUALITY</span>
            <strong>{reviewRequiredCount ? `${reviewRequiredCount}개 검토 필요` : "검토 대기 없음"}</strong>
            <p>전체 {totalQuestionCount}개 · 정상 {normalCount}개 · 데이터 부족 {dataInsufficientCount}개</p>
            <button type="button" onClick={onOpenQuality}>검토 문항 보기 <ArrowRight size={14} /></button>
          </article>
          <article className={backupStatus === "FAILED" ? styles.opsFocusWarning : styles.opsFocusHealthy}>
            <span>BACKUP & RESTORE</span>
            <strong>{backupStatus === "UNKNOWN" ? "실행 기록 없음" : backupStatus}</strong>
            <p>{summary.lastBackupRun?.message || "암호화 백업과 격리 복원 검증 결과를 기다리는 중입니다."}</p>
            <time>{formatDateTime(summary.lastBackupRun?.completedAt)}</time>
          </article>
        </section>

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
          <div className={styles.adminSectionHeading}>
            <div><span>TODAY</span><h2>Gemini API</h2></div>
            <b>{ai.totalCount || 0} / {aiLimit || "-"}회 · 평균 {Math.round(ai.averageLatencyMs || 0)}ms</b>
          </div>
          <div className={styles.opsUsageTrack} aria-label={`Gemini 일일 호출량 ${Math.round(aiUsageRate)}%`}>
            <i style={{ width: `${aiUsageRate}%` }} />
          </div>
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
            <div className={styles.adminSectionHeading}><div><span>LAST 7 DAYS</span><h2>AI 생성 품질</h2></div></div>
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
              <div><dt>복원 검증</dt><dd>{summary.lastBackupRun?.message?.includes("restore") || summary.lastBackupRun?.message?.includes("복원") ? "확인됨" : "기록 확인"}</dd></div>
              <div><dt>로그인 잠금</dt><dd>{summary.activeLoginLocks}건</dd></div>
            </dl>
          </section>
        </div>

        <div className={styles.opsTwoColumns}>
          <section className={styles.opsSection}>
            <div className={styles.adminSectionHeading}><div><span>FAILURES</span><h2>최근 생성 실패</h2></div></div>
            {summary.recentFailures?.length ? <div className={styles.opsRows}>
              {summary.recentFailures.map((failure) => <button type="button" className={styles.opsRowButton} key={failure.generationLogId} onClick={() => onOpenGeneration(failure.generationLogId)}>
                <div><strong>#{failure.generationLogId} · {failure.targetDate}</strong><span>{failure.errorMessage || failure.status}</span></div>
                <time>{formatDateTime(failure.updatedAt)} <ArrowRight size={13} /></time>
              </button>)}
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

export function AdminQuizHub({
  currentUser, quizPage, generationPage, generationDetail, userPage, promptPage, loading, actionLoading, error,
  generationFilters, qualityPage, qualityFilters, loginLocks, auditPage, operationsSummary, operationsNotificationStatus, operationsNotice,
  onCreate, onUpdate, onDelete, onLoad, onPublish, onGenerate, onRetry,
  onLoadGeneration, onUpdateRole, onUpdateEnabled, onResetPin, onLoadPrompts, onCreatePrompt, onActivatePrompt, onRefresh, onQuizPageChange,
  onGenerationPageChange, onGenerationFilterChange, onQualityFilterChange, onQualityPageChange,
  onUserPageChange, onLoadSecurity, onUnlockLogin, onLoadOperations, onLoadQuality, onTestNotification,
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
    if (section === "overview") {
      onLoadOperations();
      onLoadQuality(0, { status: "", keyword: "" });
    }
    if (section === "quality") onLoadQuality(0, qualityFilters);
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

  function openQuality() {
    setSection("quality");
  }

  async function openGeneration(generationLogId) {
    setSection("operations");
    await onLoadGeneration(generationLogId);
  }

  const sectionItems = [
    ["overview", Activity, "운영 현황"],
    ["quality", BarChart3, "퀴즈 품질"],
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
          qualityPage={qualityPage}
          notificationStatus={operationsNotificationStatus}
          notice={operationsNotice}
          loading={loading}
          actionLoading={actionLoading}
          error={error}
          onLoad={onLoadOperations}
          onTestNotification={onTestNotification}
          onOpenQuality={openQuality}
          onOpenGeneration={openGeneration}
        />
      ) : section === "quality" ? (
        <AdminQuizQualityPanel
          qualityPage={qualityPage}
          filters={qualityFilters}
          loading={loading}
          error={error}
          onFilter={onQualityFilterChange}
          onPageChange={onQualityPageChange}
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
