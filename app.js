const encouragements = [
  "老板正在为你的肠道健康买单。",
  "这泡已经抵过半杯蜜雪冰城。",
  "今天已经击败全国 37% 的打工人。",
  "别急，财富正在以秒为单位到账。",
  "你不是在摸鱼，你是在做现金流管理。",
  "此刻，工位和马桶都在创造价值。"
];

const ledgerCopy = {
  commute: "通勤也算成本：今天先记一笔路上的精神折旧。",
  coffee: "咖啡时间已入账，清醒也是生产资料。",
  meeting: "会议价值已换算，沉默也有时薪。",
  overtime: "加班不只看时长，还要看这段时间有没有真的值得。"
};

const baseStats = {
  week: { count: 19, seconds: 4 * 3600 + 23 * 60, money: 286 },
  month: { count: 70, seconds: 20 * 3600 + 23 * 60, money: 1288 },
  career: { count: 512, seconds: 216 * 3600, money: 16237 }
};

const rankData = [
  { name: "张三", tag: "本月 21 小时", money: 1600 },
  { name: "你", tag: "本月 20 小时 23 分", money: 1288 },
  { name: "李四", tag: "本月 18 小时", money: 1190 },
  { name: "王五", tag: "连续打卡 12 天", money: 980 }
];

const badgeData = [
  { title: "第一泡", desc: "完成第一次带薪拉屎", key: "first" },
  { title: "连续七天", desc: "连续七天留下时间价值", key: "streak" },
  { title: "累计100小时", desc: "职业生涯进入耐力局", key: "hundredHours" },
  { title: "收益破千", desc: "累计收益突破1000元", key: "thousand" },
  { title: "厕所VIP", desc: "本月累计超过20小时", key: "vip" },
  { title: "马桶战神", desc: "单次记录超过30分钟", key: "warrior" }
];

const defaultProfile = {
  salary: 12000,
  workdays: 22,
  hours: 8
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  profile: loadProfile(),
  sessions: [],
  running: false,
  startTime: 0,
  elapsedMs: 0,
  timerId: null,
  activePeriod: "day"
};

const nodes = {
  settingsButton: document.querySelector("#settingsButton"),
  settingsDialog: document.querySelector("#settingsDialog"),
  cancelSettings: document.querySelector("#cancelSettings"),
  salaryForm: document.querySelector("#salaryForm"),
  salaryInput: document.querySelector("#salaryInput"),
  workdaysInput: document.querySelector("#workdaysInput"),
  hoursInput: document.querySelector("#hoursInput"),
  hourRate: document.querySelector("#hourRate"),
  minuteRate: document.querySelector("#minuteRate"),
  secondRate: document.querySelector("#secondRate"),
  tabButtons: document.querySelectorAll(".tab-button"),
  screens: document.querySelectorAll(".screen"),
  periodButtons: document.querySelectorAll(".period-button"),
  mainAction: document.querySelector("#mainAction"),
  actionIcon: document.querySelector("#actionIcon"),
  actionText: document.querySelector("#actionText"),
  timer: document.querySelector("#timer"),
  sessionState: document.querySelector("#sessionState"),
  liveLine: document.querySelector("#liveLine"),
  liveEarning: document.querySelector("#liveEarning"),
  ledgerFeedback: document.querySelector("#ledgerFeedback"),
  todayCount: document.querySelector("#todayCount"),
  todayDuration: document.querySelector("#todayDuration"),
  todayEarning: document.querySelector("#todayEarning"),
  todayMood: document.querySelector("#todayMood"),
  statsBoard: document.querySelector("#statsBoard"),
  timeline: document.querySelector("#timeline"),
  rankList: document.querySelector("#rankList"),
  badgesGrid: document.querySelector("#badgesGrid"),
  reportDialog: document.querySelector("#reportDialog"),
  closeReport: document.querySelector("#closeReport"),
  reportMoney: document.querySelector("#reportMoney"),
  reportDuration: document.querySelector("#reportDuration"),
  reportCount: document.querySelector("#reportCount"),
  reportTotalDuration: document.querySelector("#reportTotalDuration"),
  reportTotalMoney: document.querySelector("#reportTotalMoney"),
  posterDuration: document.querySelector("#posterDuration"),
  posterMoney: document.querySelector("#posterMoney")
};

init();

function init() {
  nodes.salaryInput.value = state.profile.salary;
  nodes.workdaysInput.value = state.profile.workdays;
  nodes.hoursInput.value = state.profile.hours;

  bindEvents();
  renderRates();
  renderToday();
  renderStats();
  renderTimeline();
  renderRank();
  renderBadges();
}

function bindEvents() {
  nodes.settingsButton.addEventListener("click", () => {
    if (typeof nodes.settingsDialog.showModal === "function") {
      nodes.settingsDialog.showModal();
    }
  });

  nodes.cancelSettings.addEventListener("click", () => {
    nodes.settingsDialog.close();
  });

  nodes.salaryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    state.profile = {
      salary: normalizeNumber(nodes.salaryInput.value, defaultProfile.salary),
      workdays: normalizeNumber(nodes.workdaysInput.value, defaultProfile.workdays),
      hours: normalizeNumber(nodes.hoursInput.value, defaultProfile.hours)
    };
    localStorage.setItem("today-worth-profile", JSON.stringify(state.profile));
    renderRates();
    renderToday();
    renderStats();
    nodes.settingsDialog.close();
  });

  nodes.tabButtons.forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  nodes.periodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activePeriod = button.dataset.period;
      nodes.periodButtons.forEach((item) => item.classList.toggle("active", item === button));
      renderStats();
    });
  });

  nodes.mainAction.addEventListener("click", () => {
    if (state.running) {
      stopSession();
      return;
    }
    startSession();
  });

  const ledgerButtons = document.querySelectorAll(".ledger-item");
  ledgerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const message = ledgerCopy[button.dataset.kind];
      nodes.liveLine.textContent = message;
      nodes.ledgerFeedback.textContent = message;
      ledgerButtons.forEach((item) => {
        const isSelected = item === button;
        item.classList.toggle("selected", isSelected);
        item.setAttribute("aria-pressed", String(isSelected));
      });
      if (!prefersReducedMotion && typeof button.animate === "function") {
        button.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-3px)" },
            { transform: "translateY(0)" }
          ],
          { duration: 260, easing: "ease-out" }
        );
      }
    });
  });

  nodes.closeReport.addEventListener("click", () => {
    nodes.reportDialog.close();
  });
}

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("today-worth-profile"));
    return { ...defaultProfile, ...saved };
  } catch {
    return { ...defaultProfile };
  }
}

function normalizeNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getRates() {
  const hour = state.profile.salary / state.profile.workdays / state.profile.hours;
  const minute = hour / 60;
  const second = minute / 60;
  return { hour, minute, second };
}

function renderRates() {
  const rates = getRates();
  nodes.hourRate.textContent = formatMoney(rates.hour);
  nodes.minuteRate.textContent = formatMoney(rates.minute);
  nodes.secondRate.textContent = `￥${rates.second.toFixed(3)}`;
}

function startSession() {
  state.running = true;
  state.startTime = Date.now();
  state.elapsedMs = 0;
  nodes.mainAction.classList.add("running");
  nodes.actionIcon.classList.add("active");
  nodes.actionText.textContent = "冲水结束";
  nodes.sessionState.textContent = "带薪进行中";
  nodes.liveLine.textContent = encouragements[0];
  tick();
  state.timerId = window.setInterval(tick, 250);
}

function stopSession() {
  window.clearInterval(state.timerId);
  tick();
  const seconds = Math.max(1, Math.round(state.elapsedMs / 1000));
  const money = seconds * getRates().second;
  const session = {
    seconds,
    money,
    at: new Date()
  };

  state.sessions.push(session);
  state.running = false;
  state.elapsedMs = 0;
  nodes.mainAction.classList.remove("running");
  nodes.actionIcon.classList.remove("active");
  nodes.actionText.textContent = "开始带薪拉屎";
  nodes.sessionState.textContent = "本次已冲水";
  nodes.liveLine.textContent = `刚刚入账 ${formatMoney(money)}，这笔钱很有味道。`;
  nodes.timer.textContent = "00:00:00";
  nodes.liveEarning.textContent = "￥0.00";

  renderToday();
  renderStats();
  renderTimeline();
  renderBadges();
  renderReport(session);
  if (typeof nodes.reportDialog.showModal === "function") {
    nodes.reportDialog.showModal();
  }
}

function tick() {
  state.elapsedMs = Date.now() - state.startTime;
  const seconds = Math.floor(state.elapsedMs / 1000);
  const money = seconds * getRates().second;
  nodes.timer.textContent = formatClock(seconds);
  nodes.liveEarning.textContent = formatMoney(money);
  nodes.liveLine.textContent = encouragements[Math.floor(seconds / 5) % encouragements.length];
}

function switchTab(tab) {
  nodes.tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tab);
  });
  nodes.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === `${tab}Screen`);
  });
}

function getTodayTotals() {
  return state.sessions.reduce(
    (totals, session) => {
      totals.count += 1;
      totals.seconds += session.seconds;
      totals.money += session.money;
      return totals;
    },
    { count: 0, seconds: 0, money: 0 }
  );
}

function renderToday() {
  const totals = getTodayTotals();
  nodes.todayCount.textContent = totals.count;
  nodes.todayDuration.textContent = formatDuration(totals.seconds);
  nodes.todayEarning.textContent = formatMoney(totals.money);

  if (totals.count === 0) {
    nodes.todayMood.textContent = "还没开始，肠道很克制";
  } else if (totals.money < 20) {
    nodes.todayMood.textContent = "刚够一杯柠檬水";
  } else {
    nodes.todayMood.textContent = "老板的预算开始发热";
  }
}

function renderStats() {
  const today = getTodayTotals();
  const stats = {
    day: today,
    week: combineStats(baseStats.week, today),
    month: combineStats(baseStats.month, today),
    career: combineStats(baseStats.career, today)
  };
  const current = stats[state.activePeriod];
  const labels = {
    day: "今天",
    week: "本周",
    month: "本月",
    career: "职业生涯"
  };

  nodes.statsBoard.innerHTML = `
    <article class="stat-card accent">
      <strong>${current.count}</strong>
      <span>${labels[state.activePeriod]}次数</span>
    </article>
    <article class="stat-card">
      <strong>${formatDuration(current.seconds)}</strong>
      <span>累计时长</span>
    </article>
    <article class="stat-card">
      <strong>${formatMoney(current.money)}</strong>
      <span>累计收入</span>
    </article>
    <article class="stat-card">
      <strong>${makeVerdict(current.money)}</strong>
      <span>价值换算</span>
    </article>
  `;
}

function combineStats(base, addition) {
  return {
    count: base.count + addition.count,
    seconds: base.seconds + addition.seconds,
    money: base.money + addition.money
  };
}

function makeVerdict(money) {
  if (money < 20) return "蜜雪级";
  if (money < 200) return "奶茶自由";
  if (money < 1000) return "火锅局";
  return "机票级";
}

function renderTimeline() {
  const rows = [
    { time: "09:12", title: "通勤", value: "￥18.20", width: 34 },
    { time: "10:36", title: "咖啡", value: "-14分钟", width: 18 },
    { time: "14:00", title: "会议", value: "￥42.60", width: 62 },
    {
      time: "刚刚",
      title: "带薪拉屎",
      value: formatMoney(getTodayTotals().money),
      width: Math.min(100, Math.max(8, getTodayTotals().seconds / 12))
    }
  ];

  nodes.timeline.innerHTML = rows
    .map(
      (row) => `
      <div class="timeline-row">
        <span>${row.time}</span>
        <div>
          <strong>${row.title}</strong>
          <div class="timeline-bar"><span style="width: ${row.width}%"></span></div>
        </div>
        <span>${row.value}</span>
      </div>
    `
    )
    .join("");
}

function renderRank() {
  nodes.rankList.innerHTML = rankData
    .map(
      (item, index) => `
      <article class="rank-row">
        <div class="rank-medal rank-${index + 1}">${index + 1}</div>
        <div>
          <strong>${item.name}</strong>
          <span>${item.tag}</span>
        </div>
        <div class="rank-score">
          <strong>￥${item.money}</strong>
          <small>收入</small>
        </div>
      </article>
    `
    )
    .join("");
}

function renderBadges() {
  const today = getTodayTotals();
  const unlocked = {
    first: today.count > 0,
    streak: false,
    hundredHours: false,
    thousand: baseStats.career.money + today.money >= 1000,
    vip: baseStats.month.seconds + today.seconds >= 20 * 3600,
    warrior: state.sessions.some((session) => session.seconds >= 30 * 60)
  };

  nodes.badgesGrid.innerHTML = badgeData
    .map((badge) => {
      const isUnlocked = unlocked[badge.key];
      return `
        <article class="badge-card ${isUnlocked ? "" : "locked"}">
          <span class="badge-mark ${isUnlocked ? "" : "locked-mark"}" aria-hidden="true"></span>
          <strong>${badge.title}</strong>
          <small>${badge.desc}</small>
        </article>
      `;
    })
    .join("");
}

function renderReport(session) {
  const totals = getTodayTotals();
  nodes.reportMoney.textContent = formatMoney(session.money);
  nodes.reportDuration.textContent = formatDuration(session.seconds);
  nodes.reportCount.textContent = `${totals.count}次`;
  nodes.reportTotalDuration.textContent = formatDuration(totals.seconds);
  nodes.reportTotalMoney.textContent = formatMoney(totals.money);
  nodes.posterDuration.textContent = formatDuration(totals.seconds);
  nodes.posterMoney.textContent = `赚了 ${formatMoney(totals.money)}`;
}

function formatClock(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((item) => String(item).padStart(2, "0")).join(":");
}

function formatDuration(totalSeconds) {
  if (totalSeconds < 60) return `${totalSeconds}秒`;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}分钟`;
  return `${hours}小时${minutes}分钟`;
}

function formatMoney(value) {
  return `￥${value.toFixed(2)}`;
}
