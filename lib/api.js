let csrfToken = null;

export class ApiError extends Error {
  constructor(status, code, message, fieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

async function readBody(response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  return response.json();
}

async function getCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch("/api/csrf", {
    credentials: "same-origin",
    cache: "no-store",
  });
  const body = await readBody(response);
  if (!response.ok || !body?.headerName || !body?.token) {
    throw new ApiError(
      response.status,
      body?.code || "CSRF_UNAVAILABLE",
      body?.message || "CSRF token is unavailable.",
    );
  }

  csrfToken = body;
  return csrfToken;
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers);

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = await getCsrfToken();
    headers.set(csrf.headerName, csrf.token);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...options,
    method,
    headers,
    credentials: "same-origin",
    cache: "no-store",
  });
  const body = await readBody(response);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.code || "REQUEST_FAILED",
      body?.message || "Request failed.",
      body?.fieldErrors || {},
    );
  }

  return body;
}
