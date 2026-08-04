"use client";

import {
  Check,
  ChevronRight,
  Copy,
  Crown,
  KeyRound,
  Orbit,
  Plus,
  RefreshCw,
  Sparkles,
  UserMinus,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "../../lib/triReadUi";
import styles from "../../page.module.css";

export function GroupActionDialog({ mode, onClose, onSubmit, submitting, error }) {
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

export function AccountPinDialog({ open, onClose, onChanged }) {
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

export function InvitePolicyDialog({ open, submitting, error, onClose, onSubmit }) {
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

export function GroupHub({
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
