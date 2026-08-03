"use client";

import { BookOpen, ChevronRight, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { apiFetch } from "@/lib/api";
import { PASSAGE_AREAS, getErrorMessage } from "../../lib/triReadUi";
import { Brand } from "../../components/AppShell";
import styles from "../../page.module.css";

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
      <section className={styles.authVisual} aria-label="TRI:READ 서비스 소개">
        <Brand />
        <div className={styles.orbitVisual} aria-hidden="true">
          <span className={styles.orbitLineOne} />
          <span className={styles.orbitLineTwo} />
          <span className={styles.orbitPlanet}>
            <BookOpen size={27} />
          </span>
          <span className={styles.starOne} />
          <span className={styles.starTwo} />
          <span className={styles.starThree} />
        </div>
        <div className={styles.authIntro}>
          <p className={styles.authIntroEyebrow}>DAILY READING</p>
          <h2>하루 한 편, 부담 없이 읽어요</h2>
          <p className={styles.authIntroDescription}>
            세 영역 중 하나를 골라 지문 1개와 문제 3개를 풉니다.
          </p>
          <div className={styles.authFacts} aria-label="학습 구성">
            <span><strong>1</strong> 지문</span>
            <span><strong>3</strong> 문제</span>
            <span><strong>10~15</strong>분</span>
          </div>
          <div className={styles.authAreas} aria-label="선택 가능한 영역">
            {PASSAGE_AREAS.map(({ label, icon: Icon }) => (
              <span key={label}>
                <Icon size={15} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.authPanel}>
        <div className={styles.mobileBrand}>
          <Brand />
        </div>
        <div className={styles.authFormWrap}>
          <p className={styles.eyebrow}>WEEKDAY READING</p>
          <h1>{mode === "login" ? "오늘의 독해를 이어가세요" : "가벼운 독해 습관을 시작하세요"}</h1>

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
                pattern="[A-Za-z0-9._-]+"
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
