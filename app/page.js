import {
  BarChart3,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Flame,
  LayoutDashboard,
  LogIn,
  Medal,
  Play,
  Settings,
  Trophy,
  UsersRound,
} from "lucide-react";
import styles from "./page.module.css";

const passages = [
  {
    title: "과학 기술",
    topic: "위성 궤도와 에너지 보존",
    minutes: 18,
    questions: 3,
    status: "대기",
    accent: "blue",
  },
  {
    title: "인문",
    topic: "비판적 합리주의와 반증 가능성",
    minutes: 16,
    questions: 3,
    status: "대기",
    accent: "green",
  },
  {
    title: "사회",
    topic: "공공재 공급과 무임승차 문제",
    minutes: 17,
    questions: 3,
    status: "대기",
    accent: "coral",
  },
];

const groups = [
  { name: "마포 비문학", rank: 2, score: 82, trend: "+4" },
  { name: "야자 끝나고", rank: 5, score: 71, trend: "+1" },
  { name: "셋로그 독서반", rank: 8, score: 64, trend: "-" },
];

const activity = [
  "어제 9문제 중 7문제 정답",
  "과학 기술 지문 평균 6분 10초",
  "이번 주 평일 루틴 3일 유지",
];

export default function Home() {
  const today = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar} aria-label="TRI:READ navigation">
        <div className={styles.brandBlock}>
          <div className={styles.brandMark}>TR</div>
          <div>
            <p className={styles.brandName}>TRI:READ</p>
            <p className={styles.brandSub}>Daily Reading Lab</p>
          </div>
        </div>

        <nav className={styles.navList}>
          <a className={styles.navItemActive} href="#today">
            <LayoutDashboard size={18} />
            오늘 학습
          </a>
          <a className={styles.navItem} href="#groups">
            <UsersRound size={18} />
            그룹
          </a>
          <a className={styles.navItem} href="#record">
            <BarChart3 size={18} />
            기록
          </a>
          <a className={styles.navItem} href="#settings">
            <Settings size={18} />
            설정
          </a>
        </nav>

        <button className={styles.loginButton} type="button">
          <LogIn size={17} />
          로그인
        </button>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.eyebrow}>고3 고정 · 평일 루틴</p>
            <h1>오늘의 3지문</h1>
          </div>
          <div className={styles.dateBadge}>
            <CalendarDays size={18} />
            {today}
          </div>
        </header>

        <section className={styles.overview} aria-label="오늘 학습 요약">
          <div className={styles.primaryPanel} id="today">
            <div className={styles.panelHead}>
              <div>
                <p className={styles.kicker}>TODAY SET</p>
                <h2>3 passages · 9 questions</h2>
              </div>
              <button className={styles.primaryButton} type="button">
                <Play size={17} fill="currentColor" />
                시작
              </button>
            </div>

            <div className={styles.metricRow}>
              <div className={styles.metricBox}>
                <BookOpenCheck size={19} />
                <strong>0 / 3</strong>
                <span>지문 완료</span>
              </div>
              <div className={styles.metricBox}>
                <CheckCircle2 size={19} />
                <strong>0 / 9</strong>
                <span>문제 풀이</span>
              </div>
              <div className={styles.metricBox}>
                <Flame size={19} />
                <strong>평일</strong>
                <span>주말 제외</span>
              </div>
            </div>
          </div>

          <div className={styles.visualPanel} aria-hidden="true">
            <div className={styles.paperStack}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.answerRail}>
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </section>

        <section className={styles.contentGrid}>
          <div className={styles.queueArea}>
            <div className={styles.sectionTitle}>
              <h2>문제 큐</h2>
              <button className={styles.iconButton} type="button" aria-label="문제 큐 열기">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className={styles.passageList}>
              {passages.map((passage, index) => (
                <article className={styles.passageCard} key={passage.topic}>
                  <div className={`${styles.passageIndex} ${styles[passage.accent]}`}>
                    {index + 1}
                  </div>
                  <div className={styles.passageBody}>
                    <div className={styles.passageMeta}>
                      <span>{passage.title}</span>
                      <span>{passage.minutes}분</span>
                      <span>{passage.questions}문항</span>
                    </div>
                    <h3>{passage.topic}</h3>
                  </div>
                  <span className={styles.statusPill}>{passage.status}</span>
                </article>
              ))}
            </div>
          </div>

          <aside className={styles.sideRail}>
            <section className={styles.groupPanel} id="groups">
              <div className={styles.sectionTitleCompact}>
                <h2>내 그룹</h2>
                <UsersRound size={18} />
              </div>
              <div className={styles.groupList}>
                {groups.map((group) => (
                  <article className={styles.groupItem} key={group.name}>
                    <div>
                      <p>{group.name}</p>
                      <span>{group.score}점 · {group.trend}</span>
                    </div>
                    <strong>{group.rank}</strong>
                  </article>
                ))}
              </div>
            </section>

            <section className={styles.rankPanel} id="record">
              <div className={styles.rankIcon}>
                <Trophy size={20} />
              </div>
              <p className={styles.kicker}>WEEKLY POSITION</p>
              <h2>상위 18%</h2>
              <div className={styles.progressTrack}>
                <span />
              </div>
              <p className={styles.rankNote}>그룹 평균보다 11점 높음</p>
            </section>

            <section className={styles.activityPanel}>
              <div className={styles.sectionTitleCompact}>
                <h2>최근 기록</h2>
                <Medal size={18} />
              </div>
              <ul className={styles.activityList}>
                {activity.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </section>
    </main>
  );
}
