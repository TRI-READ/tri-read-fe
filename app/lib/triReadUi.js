import { Atom, Landmark, Scale } from "lucide-react";
import { ApiError } from "@/lib/api";

export const WEEKDAYS = ["월", "화", "수", "목", "금"];
export const PASSAGE_AREAS = [
  {
    label: "인문·사회",
    description: "사상, 사회 구조와 인간을 읽어요.",
    icon: Landmark,
  },
  {
    label: "과학·기술",
    description: "원리, 기술과 자연 현상을 읽어요.",
    icon: Atom,
  },
  {
    label: "경제·법·융합",
    description: "제도, 시장과 복합 쟁점을 읽어요.",
    icon: Scale,
  },
];

export const VIEW_PATHS = {
  quiz: "/quiz",
  groups: "/groups",
  orbit: "/history",
  reviews: "/wrong-answers",
  admin: "/admin",
};

const PATH_VIEWS = Object.fromEntries(
  Object.entries(VIEW_PATHS).map(([view, path]) => [path, view]),
);

export function getViewFromPathname(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  if (normalizedPath === VIEW_PATHS.admin || normalizedPath.startsWith(`${VIEW_PATHS.admin}/`)) {
    return "admin";
  }
  return PATH_VIEWS[normalizedPath] || "quiz";
}

export function formatToday() {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());
}

export function formatDateTime(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDuration(seconds = 0) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days) return `${days}일 ${hours}시간`;
  if (hours) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

export function formatBytes(bytes = 0) {
  if (!bytes) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(bytes > 1024 ** 3 ? 0 : 1)} MB`;
}

export function getErrorMessage(error) {
  if (!(error instanceof ApiError)) {
    return "잠시 문제가 생겼어요. 다시 시도해 주세요.";
  }

  const messages = {
    INVALID_CREDENTIALS: "아이디 또는 PIN을 확인해 주세요.",
    LOGIN_NAME_ALREADY_EXISTS: "이미 사용 중인 아이디예요.",
    INVALID_REQUEST: "입력한 내용을 다시 확인해 주세요.",
    TODAY_QUIZ_NOT_FOUND: "오늘은 등록된 퀴즈가 없어요.",
    QUIZ_ALREADY_COMPLETED: "이미 완료한 지문이에요. 다른 영역을 골라 주세요.",
    AUTHENTICATION_REQUIRED: "다시 로그인해 주세요.",
    GROUP_ALREADY_JOINED: "이미 참여 중인 그룹이에요.",
    GROUP_NOT_FOUND: "그룹을 찾을 수 없어요.",
    GROUP_OWNER_REQUIRED: "그룹 소유자만 초대 코드를 바꿀 수 있어요.",
    INVALID_INVITE_CODE: "초대 코드가 올바르지 않거나 만료됐어요.",
    ANSWER_REVIEW_NOT_FOUND: "오답 기록을 찾을 수 없어요.",
    INVALID_REVIEW_FILTER: "오답 필터를 다시 확인해 주세요.",
    INVALID_REVIEW_STATUS: "복습 상태를 변경하지 못했어요.",
    INVALID_APP_ROLE: "사용자 권한을 다시 확인해 주세요.",
    CANNOT_DEMOTE_SELF: "현재 로그인한 관리자는 직접 권한을 내릴 수 없어요.",
    LAST_ADMIN_REQUIRED: "활성 관리자 계정은 최소 1개가 필요해요.",
    USER_NOT_FOUND: "사용자를 찾을 수 없어요.",
    APP_ROLE_UPDATE_FAILED: "사용자 권한을 변경하지 못했어요.",
    QUIZ_DATE_INVENTORY_FULL: "선택한 날짜에는 이미 퀴즈 3세트가 준비되어 있어요.",
    GENERATION_LOG_NOT_FOUND: "생성 기록을 찾을 수 없어요.",
    GENERATION_RETRY_NOT_ALLOWED: "실패한 생성 기록만 다시 실행할 수 있어요.",
    QUIZ_GENERATION_FAILED: "자동 생성이 검증을 통과하지 못했어요. 기록에서 원인을 확인해 주세요.",
    GEMINI_API_KEY_MISSING: "서버에 Gemini API 키가 설정되어 있지 않아요.",
    GEMINI_RATE_LIMITED: "Gemini 호출 한도에 도달했어요. 잠시 뒤 다시 시도해 주세요.",
    GEMINI_UNAVAILABLE: "Gemini가 일시적으로 응답하지 않아요.",
    QUIZ_GENERATION_API_DAILY_LIMIT_REACHED: "오늘 설정한 Gemini 호출 한도를 모두 사용했어요.",
    TOO_MANY_LOGIN_ATTEMPTS: "로그인 시도가 너무 많아요. 10분 뒤 다시 시도해 주세요.",
    CURRENT_PIN_INCORRECT: "현재 PIN이 올바르지 않아요.",
    PIN_REUSE_NOT_ALLOWED: "새 PIN은 현재 PIN과 달라야 해요.",
    PIN_CHANGE_FAILED: "PIN을 변경하지 못했어요. 다시 시도해 주세요.",
    USER_DISABLED: "사용이 중지된 계정이에요.",
    CANNOT_DISABLE_SELF: "현재 로그인한 관리자 계정은 중지할 수 없어요.",
    USER_STATUS_UPDATE_FAILED: "계정 상태를 변경하지 못했어요.",
    PIN_RESET_FAILED: "PIN을 초기화하지 못했어요.",
    GROUP_INVITE_NOT_FOUND: "초대 코드를 찾을 수 없어요.",
    GROUP_MEMBER_NOT_FOUND: "그룹 멤버를 찾을 수 없어요.",
    OWNER_CANNOT_BE_REMOVED: "그룹 소유자는 바로 제외할 수 없어요. 먼저 소유권을 넘겨 주세요.",
    ALREADY_GROUP_OWNER: "이미 그룹 소유자인 사용자예요.",
    GROUP_OWNER_TRANSFER_FAILED: "그룹 소유권을 이전하지 못했어요.",
    INVALID_INVITE_POLICY: "초대 기간과 사용 횟수를 다시 확인해 주세요.",
  };
  return messages[error.code] || "요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.";
}
