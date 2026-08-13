"use client";

import { Orbit } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, apiFetch, resetCsrfToken } from "@/lib/api";
import {
  VIEW_PATHS,
  getViewFromPathname,
  getErrorMessage,
} from "./lib/triReadUi";
import { AppHeader, LoadingScreen } from "./components/AppShell";
import { AuthScreen } from "./features/auth/AuthScreen";
import {
  PassagePicker,
  QuizRail,
  QuizWorkspace,
  EmptyQuiz,
} from "./features/quiz/QuizViews";
import { AccountPinDialog, GroupHub } from "./features/groups/GroupHub";
import { ReviewHub } from "./features/reviews/ReviewHub";
import { AdminQuizHub } from "./features/admin/AdminQuizHub";
import { OrbitHub } from "./features/history/OrbitHub";
import styles from "./page.module.css";

const QUIZ_DRAFT_PREFIX = "tri-read-quiz-draft";

function getQuizDraftKey(userId, quizSetId, passageId) {
  return `${QUIZ_DRAFT_PREFIX}:${userId}:${quizSetId}:${passageId}`;
}

function readQuizDraft(userId, quiz, passageIndex) {
  const passage = quiz?.passages?.[passageIndex];
  if (typeof window === "undefined" || !userId || !passage) {
    return {};
  }

  try {
    const saved = window.localStorage.getItem(
      getQuizDraftKey(userId, quiz.quizSetId, passage.passageId),
    );
    const draft = saved ? JSON.parse(saved) : {};
    return draft && typeof draft === "object" && !Array.isArray(draft) ? draft : {};
  } catch {
    return {};
  }
}

function saveQuizDraft(userId, quiz, passageIndex, selections) {
  const passage = quiz?.passages?.[passageIndex];
  if (typeof window === "undefined" || !userId || !passage) {
    return;
  }

  window.localStorage.setItem(
    getQuizDraftKey(userId, quiz.quizSetId, passage.passageId),
    JSON.stringify(selections),
  );
}

function removeQuizDraft(userId, quiz, passageIndex) {
  const passage = quiz?.passages?.[passageIndex];
  if (typeof window === "undefined" || !userId || !passage) {
    return;
  }

  window.localStorage.removeItem(
    getQuizDraftKey(userId, quiz.quizSetId, passage.passageId),
  );
}

function findQuizDraft(userId, quiz) {
  const attempts = Array.isArray(quiz?.attempts)
    ? quiz.attempts
    : quiz?.attempt
      ? [quiz.attempt]
      : [];
  const completedPassageIds = new Set(attempts.map((attempt) => attempt.passageId));

  for (let index = 0; index < (quiz?.passages?.length || 0); index += 1) {
    if (completedPassageIds.has(quiz.passages[index].passageId)) {
      continue;
    }
    const selections = readQuizDraft(userId, quiz, index);
    if (Object.keys(selections).length > 0) {
      return { passageIndex: index, selections };
    }
  }

  return null;
}

export default function TriReadApp() {
  const pathname = usePathname();
  const router = useRouter();
  const view = getViewFromPathname(pathname);
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
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupError, setGroupError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupActivity, setGroupActivity] = useState(null);
  const [groupAction, setGroupAction] = useState(null);
  const [groupActionSubmitting, setGroupActionSubmitting] = useState(false);
  const [groupActionError, setGroupActionError] = useState("");
  const [latestInviteCode, setLatestInviteCode] = useState("");
  const [groupInvites, setGroupInvites] = useState([]);
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
  const [adminQuizPage, setAdminQuizPage] = useState({
    page: { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    pendingCount: 0,
  });
  const [adminQuizFilters, setAdminQuizFilters] = useState({ status: "", challengeDate: "", keyword: "" });
  const [adminGenerationPage, setAdminGenerationPage] = useState({
    page: { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    successCount: 0,
    failureCount: 0,
    apiUsage: { totalCount: 0, successCount: 0, failureCount: 0, limit: 0 },
    aiValidationEnabled: false,
  });
  const [adminGenerationFilters, setAdminGenerationFilters] = useState({ status: "", targetDate: "" });
  const [adminGenerationFailures, setAdminGenerationFailures] = useState([]);
  const [adminGenerationDetail, setAdminGenerationDetail] = useState(null);
  const [adminQualityPage, setAdminQualityPage] = useState({
    page: { items: [], page: 0, size: 10, totalElements: 0, totalPages: 0 },
    reviewRequiredCount: 0,
    dataInsufficientCount: 0,
  });
  const [adminQualityFilters, setAdminQualityFilters] = useState({ status: "", keyword: "" });
  const [adminUserPage, setAdminUserPage] = useState({
    items: [], page: 0, size: 10, totalElements: 0, totalPages: 0,
  });
  const [adminUserActivity, setAdminUserActivity] = useState(null);
  const [adminPromptPage, setAdminPromptPage] = useState({
    page: { items: [], page: 0, size: 8, totalElements: 0, totalPages: 0 },
    active: null,
    recentActivations: [],
  });
  const [adminLoginLocks, setAdminLoginLocks] = useState([]);
  const [adminAuditPage, setAdminAuditPage] = useState({
    items: [], page: 0, size: 10, totalElements: 0, totalPages: 0,
  });
  const [adminAuditFilters, setAdminAuditFilters] = useState({ action: "", actor: "", from: "", to: "" });
  const [adminOperationsSummary, setAdminOperationsSummary] = useState(null);
  const [adminOperationsNotificationStatus, setAdminOperationsNotificationStatus] = useState(null);
  const [adminOperationsNotice, setAdminOperationsNotice] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminActionLoading, setAdminActionLoading] = useState("");
  const [adminError, setAdminError] = useState("");

  async function loadQuiz(currentUserId = user?.userId) {
    setQuizLoading(true);
    setQuizError("");
    try {
      const todayQuiz = await apiFetch("/api/quizzes/today", {
        method: "POST",
      });
      const draft = findQuizDraft(currentUserId, todayQuiz);
      setQuiz(todayQuiz);
      setSelections(draft?.selections || {});
      setResult(null);
      setActivePassage(draft?.passageIndex ?? null);
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

  async function loadGroupDetail(groupId) {
    const [detail, activity] = await Promise.all([
      apiFetch(`/api/groups/${groupId}`),
      apiFetch(`/api/groups/${groupId}/activity`),
    ]);
    const invites = detail.role === "OWNER" ? await apiFetch(`/api/groups/${groupId}/invites`) : [];
    setSelectedGroup(detail);
    setGroupActivity(activity);
    setGroupInvites(invites);
    return detail;
  }

  async function loadGroups(preferredGroupId = null) {
    setGroupsLoading(true);
    setGroupError("");
    try {
      const myGroups = await apiFetch("/api/groups/my");
      setGroups(myGroups);
      const groupId = preferredGroupId || selectedGroup?.groupId || myGroups[0]?.groupId;
      if (groupId) {
        await loadGroupDetail(groupId);
      } else {
        setSelectedGroup(null);
        setGroupActivity(null);
        setGroupInvites([]);
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
      await loadGroupDetail(groupId);
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
      setLatestInviteCode(groupAction === "create" ? response.inviteCode : "");
      await loadGroupDetail(detail.groupId);
      setGroupAction(null);
      const myGroups = await apiFetch("/api/groups/my");
      setGroups(myGroups);
    } catch (error) {
      setGroupActionError(getErrorMessage(error));
    } finally {
      setGroupActionSubmitting(false);
    }
  }

  async function handleRenewInvite(policy) {
    if (!selectedGroup) {
      return;
    }
    setGroupActionSubmitting(true);
    setGroupActionError("");
    try {
      const response = await apiFetch(`/api/groups/${selectedGroup.groupId}/invites`, {
        method: "POST",
        body: JSON.stringify(policy),
      });
      setLatestInviteCode(response.inviteCode);
      setGroupInvites((current) => [response.invite, ...current.map((invite) => policy.revokeExisting ? { ...invite, enabled: false } : invite)]);
      return true;
    } catch (error) {
      setGroupActionError(getErrorMessage(error));
      return false;
    } finally {
      setGroupActionSubmitting(false);
    }
  }

  async function handleRevokeInvite(inviteId) {
    if (!selectedGroup || !window.confirm("이 초대 코드를 폐기할까요?")) return;
    setGroupError("");
    try {
      await apiFetch(`/api/groups/${selectedGroup.groupId}/invites/${inviteId}`, { method: "DELETE" });
      setGroupInvites((current) => current.map((invite) => invite.inviteId === inviteId ? { ...invite, enabled: false } : invite));
    } catch (error) { setGroupError(getErrorMessage(error)); }
  }

  async function handleRemoveMember(member) {
    if (!selectedGroup || !window.confirm(`${member.displayName} 님을 그룹에서 제외할까요?`)) return;
    setGroupError("");
    try {
      await apiFetch(`/api/groups/${selectedGroup.groupId}/members/${member.userId}`, { method: "DELETE" });
      await loadGroups(selectedGroup.groupId);
    } catch (error) { setGroupError(getErrorMessage(error)); }
  }

  async function handleTransferOwnership(member) {
    if (!selectedGroup || !window.confirm(`${member.displayName} 님에게 소유권을 이전할까요? 이전 후에는 일반 멤버가 됩니다.`)) return;
    setGroupError("");
    try {
      await apiFetch(`/api/groups/${selectedGroup.groupId}/owner`, { method: "PATCH", body: JSON.stringify({ newOwnerUserId: member.userId }) });
      setLatestInviteCode("");
      await loadGroups(selectedGroup.groupId);
    } catch (error) { setGroupError(getErrorMessage(error)); }
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

  async function loadAdminQuizzes(page = adminQuizPage.page.page, filters = adminQuizFilters) {
    setAdminLoading(true); setAdminError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: "10" });
      if (filters.status) params.set("status", filters.status);
      if (filters.challengeDate) params.set("challengeDate", filters.challengeDate);
      if (filters.keyword) params.set("keyword", filters.keyword);
      const response = await apiFetch(`/api/admin/quizzes?${params}`);
      setAdminQuizPage(response);
      return response;
    }
    catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function filterAdminQuizzes(filters) {
    setAdminQuizFilters(filters);
    return loadAdminQuizzes(0, filters);
  }
  async function loadAdminGenerationPage(page = adminGenerationPage.page.page, filters = adminGenerationFilters) {
    setAdminLoading(true); setAdminError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: "10" });
      if (filters.status) params.set("status", filters.status);
      if (filters.targetDate) params.set("targetDate", filters.targetDate);
      const response = await apiFetch(`/api/admin/quiz-generations?${params}`);
      setAdminGenerationPage(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function loadAdminQuality(page = adminQualityPage.page.page, filters = adminQualityFilters) {
    setAdminLoading(true); setAdminError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: "10" });
      if (filters.status) params.set("status", filters.status);
      if (filters.keyword) params.set("keyword", filters.keyword);
      const response = await apiFetch(`/api/admin/quiz-quality?${params}`);
      setAdminQualityPage(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function filterAdminQuality(filters) {
    setAdminQualityFilters(filters);
    return loadAdminQuality(0, filters);
  }
  async function loadAdminUsers(page = adminUserPage.page) {
    setAdminLoading(true); setAdminError("");
    try {
      const response = await apiFetch(`/api/admin/users?page=${page}&size=10`);
      setAdminUserPage(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function loadAdminOperations() {
    setAdminLoading(true); setAdminError(""); setAdminOperationsNotice("");
    try {
      const [summaryResult, notificationResult] = await Promise.allSettled([
        apiFetch("/api/admin/operations/summary"),
        apiFetch("/api/admin/operations/notifications"),
      ]);
      if (summaryResult.status === "fulfilled") {
        setAdminOperationsSummary(summaryResult.value);
      }
      if (notificationResult.status === "fulfilled") {
        setAdminOperationsNotificationStatus(notificationResult.value);
      }

      const failedRequest = [summaryResult, notificationResult]
        .find((result) => result.status === "rejected");
      if (failedRequest) {
        setAdminError(getErrorMessage(failedRequest.reason));
      }

      return summaryResult.status === "fulfilled" ? summaryResult.value : null;
    }
    finally { setAdminLoading(false); }
  }
  async function testAdminNotification() {
    setAdminActionLoading("discord-test"); setAdminError(""); setAdminOperationsNotice("");
    try {
      const response = await apiFetch("/api/admin/operations/notifications/test", { method: "POST" });
      setAdminOperationsNotice(response.message || "Discord 테스트 알림을 전송했습니다.");
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function filterAdminGeneration(filters) {
    setAdminGenerationFilters(filters);
    setAdminGenerationDetail(null);
    return loadAdminGenerationPage(0, filters);
  }
  async function loadAdminGenerationFailures() {
    setAdminError("");
    try {
      const response = await apiFetch("/api/admin/quiz-generations/failures?limit=10");
      setAdminGenerationFailures(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
  }
  async function loadAdminPrompts(promptType = "GENERATION", page = 0) {
    setAdminLoading(true); setAdminError("");
    try {
      const response = await apiFetch(`/api/admin/prompts?type=${promptType}&page=${page}&size=8`);
      setAdminPromptPage(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function loadAdminUserActivity(userId) {
    setAdminError("");
    try {
      const response = await apiFetch(`/api/admin/users/${userId}/activity`);
      setAdminUserActivity(response);
      return response;
    } catch (error) { setAdminError(getErrorMessage(error)); }
  }
  async function loadAdminSecurity(page = adminAuditPage.page, filters = adminAuditFilters) {
    setAdminLoading(true); setAdminError("");
    try {
      const params = new URLSearchParams({ page: String(page), size: "10" });
      if (filters.action) params.set("action", filters.action);
      if (filters.actor) params.set("actor", filters.actor);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const [locks, audits] = await Promise.all([
        apiFetch("/api/admin/security/login-locks"),
        apiFetch(`/api/admin/audit-logs?${params}`),
      ]);
      setAdminLoginLocks(locks);
      setAdminAuditPage(audits);
      return { locks, audits };
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function filterAdminAudit(filters) {
    setAdminAuditFilters(filters);
    return loadAdminSecurity(0, filters);
  }
  async function unlockAdminLogin(loginName) {
    setAdminActionLoading(`unlock-${loginName}`); setAdminError("");
    try {
      await apiFetch(`/api/admin/security/login-locks/${encodeURIComponent(loginName)}`, { method: "DELETE" });
      await loadAdminSecurity(0, adminAuditFilters);
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function createAdminPrompt(payload) {
    setAdminActionLoading("prompt-create"); setAdminError("");
    try {
      await apiFetch("/api/admin/prompts", { method: "POST", body: JSON.stringify(payload) });
      await loadAdminPrompts(payload.promptType, 0);
    } catch (error) {
      setAdminError(getErrorMessage(error));
      throw error;
    } finally { setAdminActionLoading(""); }
  }
  async function activateAdminPrompt(promptTemplateId, promptType, page) {
    setAdminActionLoading(`prompt-activate-${promptTemplateId}`); setAdminError("");
    try {
      await apiFetch(`/api/admin/prompts/${promptTemplateId}/activate`, { method: "POST" });
      await loadAdminPrompts(promptType, page);
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function loadAdminConsole(pages = {}) {
    const quizIndex = Number.isInteger(pages.quiz) ? pages.quiz : adminQuizPage.page.page;
    const generationIndex = Number.isInteger(pages.generation)
      ? pages.generation
      : adminGenerationPage.page.page;
    const userIndex = Number.isInteger(pages.user) ? pages.user : adminUserPage.page;
    setAdminLoading(true); setAdminError("");
    try {
      const [quizzes, logs, accounts] = await Promise.all([
        apiFetch(`/api/admin/quizzes?page=${quizIndex}&size=10`),
        apiFetch(`/api/admin/quiz-generations?page=${generationIndex}&size=10`),
        apiFetch(`/api/admin/users?page=${userIndex}&size=10`),
      ]);
      setAdminQuizPage(quizzes);
      setAdminGenerationPage(logs);
      setAdminUserPage(accounts);
      return { quizzes, logs, accounts };
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminLoading(false); }
  }
  async function refreshAdminConsole() {
    setAdminGenerationFilters({ status: "", targetDate: "" });
    const [consoleData] = await Promise.all([
      loadAdminConsole({ generation: 0 }),
      loadAdminOperations(),
    ]);
    return consoleData;
  }
  async function generateAdminQuiz(targetDate) {
    setAdminActionLoading("generate"); setAdminError("");
    setAdminGenerationFilters({ status: "", targetDate: "" });
    try {
      const result = await apiFetch("/api/admin/quiz-generations", { method: "POST", body: JSON.stringify({ targetDate }) });
      await loadAdminConsole({ quiz: 0, generation: 0 });
      await loadAdminGeneration(result.generationLogId);
    } catch (error) {
      const message = getErrorMessage(error);
      const refreshed = await loadAdminConsole({ generation: 0 });
      const latestLog = refreshed?.logs?.page?.items?.[0];
      if (latestLog) await loadAdminGeneration(latestLog.generationLogId);
      setAdminError(message);
    }
    finally { setAdminActionLoading(""); }
  }
  async function retryAdminGeneration(generationLogId) {
    setAdminActionLoading(`retry-${generationLogId}`); setAdminError("");
    setAdminGenerationFilters({ status: "", targetDate: "" });
    try {
      const result = await apiFetch(`/api/admin/quiz-generations/${generationLogId}/retry`, { method: "POST" });
      await loadAdminConsole({ quiz: 0, generation: 0 });
      await loadAdminGeneration(result.generationLogId);
    } catch (error) {
      const message = getErrorMessage(error);
      const refreshed = await loadAdminConsole({ generation: 0 });
      const latestLog = refreshed?.logs?.page?.items?.[0];
      if (latestLog) await loadAdminGeneration(latestLog.generationLogId);
      setAdminError(message);
    }
    finally { setAdminActionLoading(""); }
  }
  async function cleanupStaleAdminGenerations() {
    setAdminActionLoading("cleanup-stale"); setAdminError("");
    try {
      const result = await apiFetch("/api/admin/quiz-generations/stale/cleanup?staleMinutes=30", { method: "POST" });
      await Promise.all([
        loadAdminConsole({ generation: 0 }),
        loadAdminGenerationFailures(),
      ]);
      return result;
    } catch (error) {
      setAdminError(getErrorMessage(error));
      return null;
    } finally {
      setAdminActionLoading("");
    }
  }
  async function loadAdminGeneration(generationLogId) {
    if (!generationLogId) { setAdminGenerationDetail(null); return; }
    setAdminError("");
    try { setAdminGenerationDetail(await apiFetch(`/api/admin/quiz-generations/${generationLogId}`)); }
    catch (error) { setAdminError(getErrorMessage(error)); }
  }
  async function updateAdminRole(userId, role) {
    setAdminActionLoading(`role-${userId}`); setAdminError("");
    try {
      const updated = await apiFetch(`/api/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
      setAdminUserPage((current) => ({
        ...current,
        items: current.items.map((account) => account.userId === userId ? updated : account),
      }));
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function updateAdminEnabled(userId, enabled) {
    const actionLabel = enabled ? "활성화" : "중지";
    if (!window.confirm(`이 계정을 ${actionLabel}할까요? 기존 로그인은 종료됩니다.`)) return;
    setAdminActionLoading(`enabled-${userId}`); setAdminError("");
    try {
      const updated = await apiFetch(`/api/admin/users/${userId}/enabled`, { method: "PATCH", body: JSON.stringify({ enabled }) });
      setAdminUserPage((current) => ({ ...current, items: current.items.map((account) => account.userId === userId ? updated : account) }));
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function resetAdminPin(account) {
    const newPin = window.prompt(`${account.displayName} 님의 새 PIN(숫자 4~12자리)을 입력하세요.`);
    if (newPin === null) return;
    if (!/^\d{4,12}$/.test(newPin)) { setAdminError("PIN은 숫자 4~12자리로 입력해 주세요."); return; }
    if (!window.confirm("PIN을 초기화하고 해당 사용자의 기존 로그인을 종료할까요?")) return;
    setAdminActionLoading(`pin-${account.userId}`); setAdminError("");
    try {
      await apiFetch(`/api/admin/users/${account.userId}/pin`, { method: "PATCH", body: JSON.stringify({ newPin }) });
    } catch (error) { setAdminError(getErrorMessage(error)); }
    finally { setAdminActionLoading(""); }
  }
  async function createAdminQuiz(draft) {
    setAdminError("");
    try { await apiFetch("/api/admin/quizzes", { method: "POST", body: JSON.stringify(draft) }); await loadAdminQuizzes(0); }
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
  async function reviewAdminQuiz(quizSetId) {
    setAdminError("");
    try {
      await apiFetch(`/api/admin/quizzes/${quizSetId}/review`, { method: "POST" });
      await loadAdminQuizzes(adminQuizPage.page.page, adminQuizFilters);
    } catch (error) { setAdminError(getErrorMessage(error)); }
  }
  async function bulkAdminQuizzes(action, quizSetIds) {
    setAdminActionLoading(`bulk-${action}`); setAdminError("");
    try {
      await apiFetch(`/api/admin/quizzes/bulk/${action}`, {
        method: "POST",
        body: JSON.stringify({ quizSetIds }),
      });
      await loadAdminQuizzes(adminQuizPage.page.page, adminQuizFilters);
    } catch (error) {
      setAdminError(getErrorMessage(error));
      throw error;
    } finally { setAdminActionLoading(""); }
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
  }, [user, view]);

  useEffect(() => {
    if (user && view === "admin" && user.role !== "ADMIN") {
      router.replace(VIEW_PATHS.quiz);
    }
  }, [router, user, view]);

  useEffect(() => {
    async function bootstrap() {
      try {
        const currentUser = await apiFetch("/api/auth/me");
        setUser(currentUser);
        if (pathname === "/") {
          router.replace(VIEW_PATHS.quiz);
        }
        await Promise.all([loadQuiz(currentUser.userId), loadStreak(), loadWeekOrbit()]);
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
    if (pathname === "/") {
      router.replace(VIEW_PATHS.quiz);
    }
    await Promise.all([loadQuiz(authenticatedUser.userId), loadStreak(), loadWeekOrbit()]);
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
      router.replace(VIEW_PATHS.quiz);
      setGroups([]);
      setSelectedGroup(null);
      setGroupActivity(null);
      setGroupInvites([]);
      setLatestInviteCode("");
      setReviewData(null);
      setSelectedReviewId(null);
      setOrbitData(null);
      setLoggingOut(false);
    }
  }

  async function handlePinChanged() {
    setAccountDialogOpen(false);
    window.alert("PIN이 변경되었습니다. 새 PIN으로 다시 로그인해 주세요.");
    try { await handleLogout(); } catch { /* PIN 변경으로 이미 만료된 세션입니다. */ }
  }

  function handleSelect(questionId, optionId) {
    if (result) {
      return;
    }
    setSelections((current) => {
      const nextSelections = { ...current, [questionId]: optionId };
      saveQuizDraft(user.userId, quiz, activePassage, nextSelections);
      return nextSelections;
    });
    setSubmitError("");
  }

  function handleChoosePassage(index) {
    setActivePassage(index);
    setSelections(readQuizDraft(user.userId, quiz, index));
    setSubmitError("");
  }

  function handleChangeArea() {
    setActivePassage(null);
    setSelections({});
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
      removeQuizDraft(user.userId, quiz, activePassage);
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
        onAccountOpen={() => setAccountDialogOpen(true)}
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
          invites={groupInvites}
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
          onRevokeInvite={handleRevokeInvite}
          onRemoveMember={handleRemoveMember}
          onTransferOwnership={handleTransferOwnership}
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
        <AdminQuizHub
          currentUser={user}
          quizPage={adminQuizPage}
          generationPage={adminGenerationPage}
          generationDetail={adminGenerationDetail}
          userPage={adminUserPage}
          promptPage={adminPromptPage}
          quizFilters={adminQuizFilters}
          generationFilters={adminGenerationFilters}
          generationFailures={adminGenerationFailures}
          qualityPage={adminQualityPage}
          qualityFilters={adminQualityFilters}
          userActivity={adminUserActivity}
          loginLocks={adminLoginLocks}
          auditPage={adminAuditPage}
          auditFilters={adminAuditFilters}
          operationsSummary={adminOperationsSummary}
          operationsNotificationStatus={adminOperationsNotificationStatus}
          operationsNotice={adminOperationsNotice}
          loading={adminLoading}
          actionLoading={adminActionLoading}
          error={adminError}
          onCreate={createAdminQuiz}
          onUpdate={updateAdminQuiz}
          onDelete={deleteAdminQuiz}
          onLoad={loadAdminQuiz}
          onReview={reviewAdminQuiz}
          onPublish={publishAdminQuiz}
          onBulk={bulkAdminQuizzes}
          onGenerate={generateAdminQuiz}
          onRetry={retryAdminGeneration}
          onCleanupStale={cleanupStaleAdminGenerations}
          onLoadGeneration={loadAdminGeneration}
          onUpdateRole={updateAdminRole}
          onUpdateEnabled={updateAdminEnabled}
          onResetPin={resetAdminPin}
          onLoadPrompts={loadAdminPrompts}
          onCreatePrompt={createAdminPrompt}
          onActivatePrompt={activateAdminPrompt}
          onRefresh={refreshAdminConsole}
          onQuizPageChange={loadAdminQuizzes}
          onQuizFilterChange={filterAdminQuizzes}
          onGenerationPageChange={loadAdminGenerationPage}
          onGenerationFilterChange={filterAdminGeneration}
          onLoadGenerationFailures={loadAdminGenerationFailures}
          onQualityFilterChange={filterAdminQuality}
          onQualityPageChange={loadAdminQuality}
          onUserPageChange={loadAdminUsers}
          onLoadUserActivity={loadAdminUserActivity}
          onLoadSecurity={loadAdminSecurity}
          onAuditFilterChange={filterAdminAudit}
          onUnlockLogin={unlockAdminLogin}
          onLoadOperations={loadAdminOperations}
          onLoadQuality={loadAdminQuality}
          onTestNotification={testAdminNotification}
        />
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
            onChoose={handleChoosePassage}
          />
        ) : (
          <div className={styles.appBody}>
            <QuizRail
              quiz={quiz}
              selectedCount={Object.keys(selections).length}
              activePassage={activePassage}
              onChangeArea={handleChangeArea}
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
              onContinue={() => loadQuiz(user.userId)}
            />
          </div>
        )
      ) : (
        <EmptyQuiz message={quizError} onRetry={() => loadQuiz(user.userId)} />
      )}
      <AccountPinDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} onChanged={handlePinChanged} />
    </main>
  );
}
