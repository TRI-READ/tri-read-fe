"use client";

import { BookOpen, Check, ChevronRight, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { getErrorMessage } from "../../lib/triReadUi";
import { Brand } from "../../components/AppShell";
import styles from "./AuthScreen.module.css";

export function AuthScreen({ mode, onModeChange, onAuthenticated, initialError }) {
  const [loginName, setLoginName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState(initialError || "");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload =
        mode === "signup"
          ? { loginName, displayName, pin }
          : { loginName, pin };
      const user = await apiFetch(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onAuthenticated(user);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    setError("");
    onModeChange(nextMode);
  }

  return (
    <main className={styles.authShell}>
      <header className={styles.authTop}>
        <Brand />
        <p>출퇴근길에 끝내는 고3 독해 루틴</p>
      </header>

      <section className={styles.authPanel}>
        <div className={styles.authFormWrap}>
          <span className={styles.authIcon} aria-hidden="true"><BookOpen size={21} /></span>
          <p className={styles.eyebrow}>오늘 학습</p>
          <h1>{mode === "login" ? "오늘의 독해를 이어가세요" : "가벼운 독해 습관을 시작하세요"}</h1>
          <p className={styles.authDescription}>한 영역을 골라 지문 1개와 문제 3개를 풀어요.</p>

          <div className={styles.authFacts} aria-label="학습 구성">
            <span><Check size={14} /> 지문 1개</span>
            <span><Check size={14} /> 문제 3개</span>
            <span><Check size={14} /> 약 15분</span>
          </div>

          <div className={styles.authTabs} role="tablist" aria-label="인증 방식">
            <button
              type="button"
              className={mode === "login" ? styles.authTabActive : styles.authTab}
              onClick={() => changeMode("login")}
            >
              <LogIn size={17} />
              로그인
            </button>
            <button
              type="button"
              className={mode === "signup" ? styles.authTabActive : styles.authTab}
              onClick={() => changeMode("signup")}
            >
              <UserPlus size={17} />
              회원가입
            </button>
          </div>

          <form className={styles.authForm} onSubmit={handleSubmit}>
            <label>
              아이디
              <input
                type="text"
                value={loginName}
                onChange={(event) => setLoginName(event.target.value)}
                minLength={4}
                maxLength={30}
                pattern="(?:[A-Za-z0-9._]|-)+"
                autoComplete="username"
                placeholder="reader01"
                required
              />
            </label>

            {mode === "signup" && (
              <label>
                표시 이름
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  maxLength={30}
                  autoComplete="nickname"
                  placeholder="독해러"
                  required
                />
              </label>
            )}

            <label>
              PIN
              <input
                type="password"
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                minLength={4}
                maxLength={12}
                inputMode="numeric"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="숫자 4~12자리"
                required
              />
            </label>

            {error && <p className={styles.formError}>{error}</p>}

            <button className={styles.submitButton} type="submit" disabled={submitting}>
              {submitting ? "연결 중..." : mode === "login" ? "로그인" : "회원가입"}
              {!submitting && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
