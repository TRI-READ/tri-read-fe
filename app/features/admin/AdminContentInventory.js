"use client";

import Link from "next/link";
import { formatDateTime } from "../../lib/triReadUi";
import styles from "./AdminContentInventory.module.css";

const STATUS_LABELS = {
  HEALTHY: "정상", LOW: "주의", CRITICAL: "긴급", NO_ACTIVE_USERS: "판단 보류",
};

export function AdminContentInventory({ inventory }) {
  if (!inventory) {
    return <section className={styles.section} aria-label="사용자별 실제 재고">
      <h2>사용자별 실제 재고</h2>
      <p>재고 정보를 확인할 수 없습니다. 백엔드 배포 상태를 확인해 주세요.</p>
    </section>;
  }

  const { users, pool, lowestStockUsers = [], alerts = [] } = inventory;
  const pendingCount = pool.draftCount + pool.reviewedCount;
  const userStatus = (remaining) => remaining < inventory.criticalThreshold ? "긴급"
    : remaining < inventory.warningThreshold ? "주의" : "정상";

  return (
    <section className={styles.section} aria-labelledby="content-inventory-heading">
      <div className={styles.heading}>
        <div><span>CONTENT POOL · {inventory.asOfDate}</span><h2 id="content-inventory-heading">사용자별 실제 재고</h2></div>
        <strong className={styles[`state${inventory.status}`]}>{STATUS_LABELS[inventory.status] || "확인 필요"}</strong>
      </div>
      <p>최근 {inventory.activeWindowDays}일 내 로그인 또는 풀이한 활성 계정 기준입니다. 관리자도 포함하며, 정지 계정은 제외합니다.</p>
      <div className={styles.metrics}>
        <div><span>활성 사용자 최저 재고</span><strong>{users.minimumRemainingSets == null ? "—" : `${users.minimumRemainingSets}세트`}</strong></div>
        <div><span>주의 대상 / 활성 사용자</span><strong>{users.lowStockUserCount} / {users.activeUserCount}명</strong></div>
        <div><span>현재 배정 가능한 공통 풀</span><strong>{pool.availablePublishedCount}세트</strong></div>
        <div><span>장기 검수·발행 대기</span><strong>{pool.overduePendingCount}세트</strong></div>
      </div>
      <p>개인 재고 = 미배정 발행 세트 + 오늘·이월 가능한 미시작 세트. 완료 세트의 남은 보너스는 제외합니다. 단위는 일수가 아닌 세트 수입니다.</p>
      <p>주의: {inventory.warningThreshold}세트 미만 · 긴급: {inventory.criticalThreshold}세트 미만</p>

      {alerts.map((alert) => <div key={alert.code} role="alert" className={alert.severity === "CRITICAL" ? styles.critical : styles.warning}>
        <strong>{alert.severity === "CRITICAL" ? "긴급" : "주의"}</strong> {alert.message}
      </div>)}

      {users.activeUserCount === 0 ? <p className={styles.empty}>활성 사용자가 없어 개인 재고 부족 판정을 보류합니다.</p> : <>
        <div className={styles.tableWrap}>
          <table>
            <caption>재고가 적은 사용자 순 · 최대 20명 / 전체 {users.activeUserCount}명</caption>
            <thead><tr><th scope="col">사용자</th><th scope="col">미배정</th><th scope="col">미시작</th><th scope="col">합계</th><th scope="col">상태</th></tr></thead>
            <tbody>{lowestStockUsers.map((user) => <tr key={user.userId}>
              <th scope="row">{user.displayName}<small>@{user.loginName}</small></th>
              <td>{user.unassignedSetCount}</td><td>{user.unstartedSetCount}</td><td>{user.remainingSetCount}</td><td>{userStatus(user.remainingSetCount)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </>}

      <div className={styles.heading}><h3>검수·발행 대기</h3><Link href="/admin/quizzes">퀴즈 관리에서 확인 →</Link></div>
      <dl className={styles.pending}>
        <div><dt>초안</dt><dd>{pool.draftCount}세트</dd></div>
        <div><dt>검수 완료·미발행</dt><dd>{pool.reviewedCount}세트</dd></div>
        <div><dt>전체 미발행</dt><dd>{pendingCount}세트</dd></div>
        <div><dt>발행됨·사용 가능일 대기</dt><dd>{pool.scheduledPublishedCount}세트</dd></div>
        <div><dt>배정 중단된 발행 세트</dt><dd>{pool.retiredPublishedCount}세트</dd></div>
      </dl>
      <p>장기 대기는 사용 가능일이 되었고 생성 후 {inventory.reviewWaitHours}시간 이상 지난 초안·검수 완료 세트입니다.
        {pool.oldestOverduePendingAt && ` 가장 오래된 생성 시각: ${formatDateTime(pool.oldestOverduePendingAt)}`}</p>
    </section>
  );
}
