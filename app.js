const activityModes = {
  toilet: {
    label: "带薪拉屎",
    shortLabel: "拉屎",
    stamp: "WC",
    hint: "肠道健康也算现金流",
    meterLabel: "摸鱼计价器 // TOILET",
    idleState: "拉屎模式待开工",
    idleLine: "点击开始，把今天最松弛的一段时间记进账本。",
    runningState: "正在带薪拉屎",
    stopAction: "冲水结束",
    doneState: "本次已冲水",
    doneLine: (money) => `刚刚入账 ${formatMoney(money)}，这笔钱很有味道。`,
    encouragements: [
      "老板正在为你的肠道健康买单。",
      "这泡已经抵过半杯蜜雪冰城。",
      "别急，财富正在以秒为单位到账。",
      "此刻，工位和马桶都在创造价值。"
    ]
  },
  meal: {
    label: "带薪用膳",
    shortLabel: "用膳",
    stamp: "饭",
    hint: "午饭不是暂停，是带薪补给",
    meterLabel: "饭点计价器 // DINING",
    idleState: "用膳模式待开饭",
    idleLine: "选好今天的带薪菜单，开饭后每一口都开始计价。",
    runningState: "正在带薪用膳",
    stopAction: "吃饱收工",
    doneState: "本次已光盘",
    doneLine: (money) => `这顿饭入账 ${formatMoney(money)}，午休终于有了回报。`,
    encouragements: [
      "这口饭由工作时间买单。",
      "咀嚼不是暂停，是能量资产重组。",
      "午饭吃得慢一点，收益跑得快一点。",
      "饭还热着，现金流也在冒热气。"
    ]
  },
  nap: {
    label: "带薪睡觉",
    shortLabel: "睡觉",
    stamp: "ZZ",
    hint: "闭眼充电，醒来结算",
    meterLabel: "补觉计价器 // NAP",
    idleState: "睡觉模式待入梦",
    idleLine: "找个不容易被发现的角落，闭眼后开始计算睡眠收益。",
    runningState: "正在带薪睡觉",
    stopAction: "睡醒收工",
    doneState: "本次已充满",
    doneLine: (money) => `这一觉入账 ${formatMoney(money)}，精神和余额一起回血。`,
    encouragements: [
      "眼睛闭上了，收益没有。",
      "这是带薪充电，不是离线。",
      "每一次呼吸都在刷新余额。",
      "工位安静了，现金流还醒着。"
    ]
  }
};

const defaultLedgerEntries = [
  {
    kind: "commute",
    title: "通勤",
    glyph: "glyph-commute",
    mode: "spend-minutes",
    value: 45,
    copy: "今天通勤 45 分钟，路上的精神折旧先记账。"
  },
  {
    kind: "coffee",
    title: "咖啡",
    glyph: "glyph-coffee",
    mode: "spend-minutes",
    value: 14,
    copy: "咖啡时间已入账，清醒也是生产资料。"
  },
  {
    kind: "meeting",
    title: "会议",
    glyph: "glyph-meeting",
    mode: "waste-money",
    value: 42.6,
    copy: "会议价值已换算，沉默也有时薪。"
  },
  {
    kind: "overtime",
    title: "加班",
    glyph: "glyph-overtime",
    mode: "spend-minutes",
    value: 60,
    copy: "今天加班 60 分钟，被拉长的夜晚先记一笔。"
  }
];

const ledgerModuleConfig = {
  commute: {
    categoryLabel: "通勤",
    dialogTitle: "通勤账单",
    subtitle: "路上的时间和成本",
    note: "把路上被吃掉的时间或交通成本单独记下来。",
    titlePlaceholder: "例：地铁",
    modes: [
      {
        value: "spend-minutes",
        label: "通勤耗时",
        valueLabel: "通勤耗时",
        unit: "分钟",
        defaultValue: 45,
        placeholder: "45",
        step: "1",
        inputMode: "numeric",
        hint: "记录从出门到工位被路程吃掉的时间。",
        defaultCopy: "今天通勤 45 分钟，路上的精神折旧先记账。",
        summary: (value) => `路上 ${Math.round(value)} 分钟`
      },
      {
        value: "waste-money",
        label: "通勤成本",
        valueLabel: "交通成本",
        unit: "元",
        defaultValue: 18.2,
        placeholder: "18.2",
        step: "0.01",
        inputMode: "decimal",
        hint: "记录车费、打车或路上折损的金额。",
        defaultCopy: "今天通勤花掉 18.2 元，路上的成本先记一笔。",
        summary: (value) => `通勤 ${formatMoney(value)}`
      }
    ]
  },
  coffee: {
    categoryLabel: "饮品",
    dialogTitle: "饮品账单",
    subtitle: "清醒和休息都算数",
    note: "记录一杯饮品换来的清醒，或者顺手摸掉的几分钟。",
    titlePlaceholder: "例：冰美式",
    modes: [
      {
        value: "spend-minutes",
        label: "休息时长",
        valueLabel: "休息时长",
        unit: "分钟",
        defaultValue: 14,
        placeholder: "14",
        step: "1",
        inputMode: "numeric",
        hint: "记录从起身接水或买饮品到回到工位的时间。",
        defaultCopy: "休息时间已入账，清醒也是生产资料。",
        summary: (value) => `休息 ${Math.round(value)} 分钟`
      },
      {
        value: "waste-money",
        label: "支出金额",
        valueLabel: "支出金额",
        unit: "元",
        defaultValue: 18,
        placeholder: "18",
        step: "0.01",
        inputMode: "decimal",
        hint: "记录这次花掉的钱。",
        defaultCopy: "这次饮品花掉 18 元，清醒成本先摊销。",
        summary: (value) => `饮品 ${formatMoney(value)}`
      }
    ]
  },
  meeting: {
    categoryLabel: "会议",
    dialogTitle: "会议账单",
    subtitle: "沉默也有时薪",
    note: "记录会议消耗的时间，或者把会议损耗直接折算成金额。",
    titlePlaceholder: "例：周会",
    modes: [
      {
        value: "waste-money",
        label: "会议损耗",
        valueLabel: "会议损耗",
        unit: "元",
        defaultValue: 42.6,
        placeholder: "42.6",
        step: "0.01",
        inputMode: "decimal",
        hint: "记录这场会折算出的时间成本。",
        defaultCopy: "会议价值已换算，沉默也有时薪。",
        summary: (value) => `浪费 ${formatMoney(value)}`
      },
      {
        value: "spend-minutes",
        label: "会议时长",
        valueLabel: "会议时长",
        unit: "分钟",
        defaultValue: 30,
        placeholder: "30",
        step: "1",
        inputMode: "numeric",
        hint: "记录会议实际占用的分钟数。",
        defaultCopy: "会议占用 30 分钟，时间成本已经入账。",
        summary: (value) => `会议 ${Math.round(value)} 分钟`
      }
    ]
  },
  overtime: {
    categoryLabel: "加班",
    dialogTitle: "加班账单",
    subtitle: "时间和收入分开记",
    note: "记录额外工作的时长，或者这段加班实际多赚的钱。",
    titlePlaceholder: "例：赶版本",
    modes: [
      {
        value: "spend-minutes",
        label: "加班时长",
        valueLabel: "加班时长",
        unit: "分钟",
        defaultValue: 60,
        placeholder: "60",
        step: "1",
        inputMode: "numeric",
        hint: "记录今天额外工作的分钟数。",
        defaultCopy: "今天加班 60 分钟，被拉长的夜晚先记一笔。",
        summary: (value) => `加班 ${Math.round(value)} 分钟`
      },
      {
        value: "earn-money",
        label: "加班收入",
        valueLabel: "加班收入",
        unit: "元",
        defaultValue: 120,
        placeholder: "120",
        step: "0.01",
        inputMode: "decimal",
        hint: "记录这段加班实际多赚的钱。",
        defaultCopy: "这段加班多赚 120 元，夜晚终于有点回响。",
        summary: (value) => `多赚 ${formatMoney(value)}`
      }
    ]
  }
};

const ledgerModeText = {
  "earn-money": "赚了",
  "spend-minutes": "花了",
  "waste-money": "浪费"
};

const baseStats = {
  week: { count: 19, seconds: 4 * 3600 + 23 * 60, money: 286 },
  month: { count: 70, seconds: 20 * 3600 + 23 * 60, money: 1288 },
  career: { count: 512, seconds: 216 * 3600, money: 16237 }
};

const periodDetailConfig = {
  day: {
    label: "日",
    granularity: "按单次记录"
  },
  week: {
    label: "周",
    granularity: "按星期汇总",
    rows: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    weights: [17, 14, 19, 16, 22, 7, 5]
  },
  month: {
    label: "月",
    granularity: "按周汇总",
    rows: ["第 1 周", "第 2 周", "第 3 周", "第 4 周", "本周"],
    weights: [18, 23, 20, 24, 15]
  },
  career: {
    label: "生涯",
    granularity: "按年度汇总",
    rows: ["2023", "2024", "2025", "2026"],
    weights: [12, 24, 31, 33]
  }
};

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
  ledgerEntries: loadLedgerEntries(),
  sessions: [],
  running: false,
  startTime: 0,
  elapsedMs: 0,
  timerId: null,
  moneyRainId: null,
  activeActivity: "toilet",
  runningActivity: "",
  activePeriod: "day",
  activeLedgerKind: "",
  lastReport: null
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
  contentScroll: document.querySelector(".content-scroll"),
  periodButtons: document.querySelectorAll(".period-button"),
  activityButtons: document.querySelectorAll(".activity-option"),
  activityHint: document.querySelector("#activityHint"),
  heroMeter: document.querySelector("#heroMeter"),
  mainAction: document.querySelector("#mainAction"),
  actionIcon: document.querySelector("#actionIcon"),
  actionText: document.querySelector("#actionText"),
  timer: document.querySelector("#timer"),
  moneyRain: document.querySelector("#moneyRain"),
  sessionState: document.querySelector("#sessionState"),
  liveLine: document.querySelector("#liveLine"),
  liveEarning: document.querySelector("#liveEarning"),
  ledgerFeedback: document.querySelector("#ledgerFeedback"),
  ledgerGrid: document.querySelector("#ledgerGrid"),
  ledgerDialog: document.querySelector("#ledgerDialog"),
  ledgerForm: document.querySelector("#ledgerForm"),
  ledgerDialogTitle: document.querySelector("#ledgerDialogTitle"),
  ledgerDialogSubtitle: document.querySelector("#ledgerDialogSubtitle"),
  ledgerModuleNote: document.querySelector("#ledgerModuleNote"),
  ledgerTitleLabel: document.querySelector("#ledgerTitleLabel"),
  ledgerTitleInput: document.querySelector("#ledgerTitleInput"),
  ledgerModeLabel: document.querySelector("#ledgerModeLabel"),
  ledgerModeControl: document.querySelector("#ledgerModeControl"),
  ledgerModeInput: document.querySelector("#ledgerModeInput"),
  ledgerValueField: document.querySelector("#ledgerValueField"),
  ledgerValueLabel: document.querySelector("#ledgerValueLabel"),
  ledgerValueInput: document.querySelector("#ledgerValueInput"),
  ledgerValueUnit: document.querySelector("#ledgerValueUnit"),
  ledgerValueHint: document.querySelector("#ledgerValueHint"),
  ledgerCopyLabel: document.querySelector("#ledgerCopyLabel"),
  ledgerCopyInput: document.querySelector("#ledgerCopyInput"),
  cancelLedger: document.querySelector("#cancelLedger"),
  todayCount: document.querySelector("#todayCount"),
  todayDuration: document.querySelector("#todayDuration"),
  todayEarning: document.querySelector("#todayEarning"),
  todayCard: document.querySelector("#todayCard"),
  todayTitle: document.querySelector("#todayTitle"),
  todayMood: document.querySelector("#todayMood"),
  todayActivityList: document.querySelector("#todayActivityList"),
  statsBoard: document.querySelector("#statsBoard"),
  periodDetailSubtitle: document.querySelector("#periodDetailSubtitle"),
  periodDetails: document.querySelector("#periodDetails"),
  badgesGrid: document.querySelector("#badgesGrid"),
  reportDialog: document.querySelector("#reportDialog"),
  reportCard: document.querySelector(".report-card"),
  closeReport: document.querySelector("#closeReport"),
  reportTitle: document.querySelector("#reportTitle"),
  reportMoney: document.querySelector("#reportMoney"),
  reportDuration: document.querySelector("#reportDuration"),
  reportCount: document.querySelector("#reportCount"),
  reportTotalDuration: document.querySelector("#reportTotalDuration"),
  reportTotalMoney: document.querySelector("#reportTotalMoney"),
  posterTitle: document.querySelector("#posterTitle"),
  posterDuration: document.querySelector("#posterDuration"),
  posterMoney: document.querySelector("#posterMoney"),
  shareReport: document.querySelector("#shareReport"),
  copyReport: document.querySelector("#copyReport"),
  shareStatus: document.querySelector("#shareStatus")
};

init();

function init() {
  nodes.salaryInput.value = state.profile.salary;
  nodes.workdaysInput.value = state.profile.workdays;
  nodes.hoursInput.value = state.profile.hours;

  bindEvents();
  renderActivityMode();
  renderRates();
  renderLedger();
  renderToday();
  renderStats();
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

  nodes.activityButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (state.running) { return; }
      state.activeActivity = button.dataset.activity;
      renderActivityMode();
    });

    button.addEventListener("keydown", (event) => {
      const keys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Home", "End"];
      if (!keys.includes(event.key) || state.running) { return; }

      event.preventDefault();
      const options = [...nodes.activityButtons];
      const activeIndex = Math.max(
        0,
        options.findIndex((item) => item.dataset.activity === state.activeActivity)
      );
      const nextIndex = getNextModeIndex(event.key, activeIndex, options.length);
      state.activeActivity = options[nextIndex].dataset.activity;
      renderActivityMode();
      options[nextIndex].focus();
    });
  });

  nodes.mainAction.addEventListener("click", () => {
    if (state.running) {
      stopSession();
      return;
    }
    startSession();
  });

  nodes.ledgerGrid.addEventListener("click", (event) => {
    const button = event.target.closest(".ledger-item");
    if (!button) { return; }

    const entry = findLedgerEntry(button.dataset.kind);
    if (!entry) { return; }

    selectLedgerEntry(entry.kind);
    openLedgerEditor(entry);
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

  nodes.cancelLedger.addEventListener("click", () => {
    nodes.ledgerDialog.close();
  });

  nodes.ledgerModeControl.addEventListener("click", (event) => {
    const button = event.target.closest(".mode-option");
    if (!button) { return; }

    selectLedgerMode(button.dataset.mode, { resetValue: true, resetCopy: true });
  });

  nodes.ledgerModeControl.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) { return; }

    const options = [...nodes.ledgerModeControl.querySelectorAll(".mode-option")];
    if (!options.length) { return; }

    event.preventDefault();

    const activeIndex = Math.max(
      0,
      options.findIndex((button) => button.dataset.mode === nodes.ledgerModeInput.value)
    );
    const nextIndex = getNextModeIndex(event.key, activeIndex, options.length);
    selectLedgerMode(options[nextIndex].dataset.mode, { resetValue: true, resetCopy: true, focus: true });
  });

  nodes.ledgerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveLedgerEditor();
  });

  nodes.closeReport.addEventListener("click", () => {
    nodes.reportDialog.close();
  });

  nodes.shareReport.addEventListener("click", () => {
    shareReport();
  });

  nodes.copyReport.addEventListener("click", () => {
    copyReportText();
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

function loadLedgerEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem("today-worth-ledger"));
    if (!Array.isArray(saved)) {
      return defaultLedgerEntries.map((entry) => ({ ...entry }));
    }

    return defaultLedgerEntries.map((defaultEntry) => {
      const savedEntry = saved.find((entry) => entry.kind === defaultEntry.kind);
      if (!savedEntry) {
        return { ...defaultEntry };
      }

      const savedMode = normalizeLedgerMode(defaultEntry.kind, savedEntry.mode, defaultEntry.mode);
      const modeConfig = getLedgerModeConfig(defaultEntry.kind, savedMode);
      const valueFallback = modeConfig.defaultValue;
      const value = savedEntry.mode === savedMode
        ? readLedgerValue(savedEntry.value, valueFallback)
        : valueFallback;

      return {
        ...defaultEntry,
        title: readLedgerText(savedEntry.title, defaultEntry.title, 8),
        mode: savedMode,
        value,
        copy: readLedgerText(savedEntry.copy, defaultEntry.copy, 80)
      };
    });
  } catch {
    return defaultLedgerEntries.map((entry) => ({ ...entry }));
  }
}

function readLedgerText(value, fallback, maxLength) {
  if (typeof value !== "string") { return fallback; }
  const text = value.trim();
  return text ? text.slice(0, maxLength) : fallback;
}

function readLedgerValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function saveLedgerEntries() {
  localStorage.setItem("today-worth-ledger", JSON.stringify(state.ledgerEntries));
}

function findLedgerEntry(kind) {
  return state.ledgerEntries.find((entry) => entry.kind === kind);
}

function getLedgerModule(kind) {
  return ledgerModuleConfig[kind] || ledgerModuleConfig.commute;
}

function getLedgerModeConfig(kind, mode) {
  const module = getLedgerModule(kind);
  return module.modes.find((item) => item.value === mode) || module.modes[0];
}

function updateLedgerEditorLabels(kind) {
  const module = getLedgerModule(kind);
  const label = module.categoryLabel || "场景";
  nodes.ledgerDialogTitle.textContent = module.dialogTitle || `${label}账单`;
  nodes.ledgerTitleLabel.textContent = `${label}标签`;
  nodes.ledgerModeLabel.textContent = `${label}记录方式`;
  nodes.ledgerCopyLabel.textContent = `${label}反馈文案`;
}

function normalizeLedgerMode(kind, mode, fallback) {
  const module = getLedgerModule(kind);
  const hasMode = module.modes.some((item) => item.value === mode);
  if (hasMode) {
    return mode;
  }

  const hasFallback = module.modes.some((item) => item.value === fallback);
  return hasFallback ? fallback : module.modes[0].value;
}

function renderLedgerModeOptions(kind, selectedMode) {
  const module = getLedgerModule(kind);
  const normalizedMode = normalizeLedgerMode(kind, selectedMode, module.modes[0].value);
  const options = module.modes.map((mode) => {
    const option = document.createElement("button");
    const isActive = mode.value === normalizedMode;
    option.className = `mode-option${isActive ? " active" : ""}`;
    option.type = "button";
    option.dataset.mode = mode.value;
    option.setAttribute("role", "radio");
    option.setAttribute("aria-checked", String(isActive));
    option.tabIndex = isActive ? 0 : -1;
    option.textContent = mode.label;
    return option;
  });

  nodes.ledgerModeControl.replaceChildren(...options);
  nodes.ledgerModeInput.value = normalizedMode;
  return normalizedMode;
}

function getNextModeIndex(key, activeIndex, total) {
  if (key === "Home") { return 0; }
  if (key === "End") { return total - 1; }
  if (key === "ArrowLeft" || key === "ArrowUp") {
    return (activeIndex - 1 + total) % total;
  }

  return (activeIndex + 1) % total;
}

function selectLedgerMode(mode, options = {}) {
  nodes.ledgerModeInput.value = mode;
  updateLedgerValueField({ resetValue: options.resetValue });

  if (options.resetCopy) {
    const current = findLedgerEntry(state.activeLedgerKind);
    const modeConfig = current ? getLedgerModeConfig(current.kind, nodes.ledgerModeInput.value) : null;
    if (modeConfig?.defaultCopy) {
      nodes.ledgerCopyInput.value = modeConfig.defaultCopy;
    }
  }

  if (options.focus) {
    [...nodes.ledgerModeControl.querySelectorAll(".mode-option")]
      .find((button) => button.dataset.mode === nodes.ledgerModeInput.value)
      ?.focus();
  }
}

function createLedgerGlyphIcon(kind) {
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  const use = document.createElementNS(namespace, "use");
  icon.classList.add("ledger-glyph-icon");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("focusable", "false");
  use.setAttribute("href", `#ledger-icon-${kind}`);
  icon.append(use);
  return icon;
}

function renderLedger() {
  const fragment = document.createDocumentFragment();

  state.ledgerEntries.forEach((entry) => {
    const button = document.createElement("button");
    const isSelected = state.activeLedgerKind === entry.kind;
    button.className = `ledger-item${isSelected ? " selected" : ""}`;
    button.dataset.kind = entry.kind;
    button.type = "button";
    button.setAttribute("aria-pressed", String(isSelected));
    button.setAttribute("aria-label", `编辑${entry.title}，${formatLedgerSummary(entry)}`);

    const glyph = document.createElement("span");
    glyph.className = `glyph ${entry.glyph}`;
    glyph.setAttribute("aria-hidden", "true");
    glyph.append(createLedgerGlyphIcon(entry.kind));

    const title = document.createElement("strong");
    title.textContent = entry.title;

    const summary = document.createElement("small");
    summary.textContent = formatLedgerSummary(entry);

    button.append(glyph, title, summary);
    fragment.append(button);
  });

  nodes.ledgerGrid.replaceChildren(fragment);
}

function selectLedgerEntry(kind) {
  const entry = findLedgerEntry(kind);
  if (!entry) { return; }

  state.activeLedgerKind = kind;
  nodes.liveLine.textContent = entry.copy;
  nodes.ledgerFeedback.textContent = entry.copy;
  renderLedger();
}

function openLedgerEditor(entry) {
  const module = getLedgerModule(entry.kind);
  const mode = renderLedgerModeOptions(entry.kind, entry.mode);
  nodes.ledgerDialogSubtitle.textContent = module.subtitle;
  nodes.ledgerModuleNote.textContent = module.note;
  nodes.ledgerTitleInput.placeholder = module.titlePlaceholder;
  nodes.ledgerTitleInput.value = entry.title;
  updateLedgerEditorLabels(entry.kind);
  nodes.ledgerValueInput.value = entry.value;
  nodes.ledgerCopyInput.value = entry.copy;
  updateLedgerValueField();

  if (typeof nodes.ledgerDialog.showModal === "function") {
    nodes.ledgerDialog.showModal();
  }
}

function updateLedgerValueField(options = {}) {
  const current = findLedgerEntry(state.activeLedgerKind);
  if (!current) { return; }

  const mode = normalizeLedgerMode(current.kind, nodes.ledgerModeInput.value, current.mode);
  const modeConfig = getLedgerModeConfig(current.kind, mode);

  nodes.ledgerModeInput.value = mode;
  nodes.ledgerModeControl.querySelectorAll(".mode-option").forEach((button) => {
    const isActive = button.dataset.mode === mode;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });
  nodes.ledgerValueLabel.textContent = modeConfig.valueLabel;
  nodes.ledgerValueInput.placeholder = modeConfig.placeholder;
  nodes.ledgerValueInput.step = modeConfig.step;
  nodes.ledgerValueInput.setAttribute("inputmode", modeConfig.inputMode);
  nodes.ledgerValueUnit.textContent = modeConfig.unit;
  nodes.ledgerValueUnit.hidden = !modeConfig.unit;
  nodes.ledgerValueHint.textContent = modeConfig.hint;
  if (options.resetValue) {
    nodes.ledgerValueInput.value = modeConfig.defaultValue;
  }
  nodes.ledgerValueInput.disabled = false;
  nodes.ledgerValueInput.required = true;
}

function saveLedgerEditor() {
  const current = findLedgerEntry(state.activeLedgerKind);
  if (!current) { return; }

  const mode = normalizeLedgerMode(current.kind, nodes.ledgerModeInput.value, current.mode);
  const modeConfig = getLedgerModeConfig(current.kind, mode);
  const nextEntry = {
    ...current,
    title: readLedgerText(nodes.ledgerTitleInput.value, current.title, 8),
    mode,
    value: readLedgerValue(nodes.ledgerValueInput.value, modeConfig.defaultValue),
    copy: readLedgerText(nodes.ledgerCopyInput.value, current.copy, 80)
  };

  state.ledgerEntries = state.ledgerEntries.map((entry) => (
    entry.kind === current.kind ? nextEntry : entry
  ));

  saveLedgerEntries();
  renderLedger();
  selectLedgerEntry(nextEntry.kind);
  nodes.ledgerDialog.close();
}

function formatLedgerSummary(entry) {
  const modeConfig = getLedgerModeConfig(entry.kind, entry.mode);
  if (typeof modeConfig.summary === "function") {
    return modeConfig.summary(entry.value);
  }

  if (entry.mode === "spend-minutes") { return `${ledgerModeText[entry.mode]} ${Math.round(entry.value)} 分钟`; }
  return `${ledgerModeText[entry.mode]} ${formatMoney(entry.value)}`;
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

function getActivityMode(key = state.activeActivity) {
  return activityModes[key] || activityModes.toilet;
}

function renderActivityMode() {
  const activity = getActivityMode();
  nodes.heroMeter.dataset.activity = state.activeActivity;
  nodes.heroMeter.dataset.label = activity.meterLabel;
  nodes.heroMeter.setAttribute("aria-label", `${activity.label}实时计时和收益`);
  nodes.mainAction.dataset.activity = state.activeActivity;
  nodes.activityHint.textContent = activity.hint;
  nodes.actionText.textContent = `开始${activity.label}`;
  nodes.sessionState.textContent = activity.idleState;
  nodes.liveLine.textContent = activity.idleLine;

  nodes.activityButtons.forEach((button) => {
    const isActive = button.dataset.activity === state.activeActivity;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-checked", String(isActive));
    button.tabIndex = isActive ? 0 : -1;
  });

  renderToday();
}

function setActivityPickerDisabled(disabled) {
  nodes.activityButtons.forEach((button) => {
    button.disabled = disabled;
  });
}

function startSession() {
  const activity = getActivityMode();
  state.running = true;
  state.runningActivity = state.activeActivity;
  state.startTime = Date.now();
  state.elapsedMs = 0;
  nodes.mainAction.classList.add("running");
  nodes.actionIcon.classList.add("active");
  nodes.actionText.textContent = activity.stopAction;
  nodes.sessionState.textContent = activity.runningState;
  nodes.liveLine.textContent = activity.encouragements[0];
  setActivityPickerDisabled(true);
  startMoneyRain();
  tick();
  state.timerId = window.setInterval(tick, 250);
}

function stopSession() {
  const activityKey = state.runningActivity || state.activeActivity;
  const activity = getActivityMode(activityKey);
  window.clearInterval(state.timerId);
  stopMoneyRain();
  tick();
  const seconds = Math.max(1, Math.round(state.elapsedMs / 1000));
  const money = seconds * getRates().second;
  const session = {
    seconds,
    money,
    activity: activityKey,
    at: new Date()
  };

  state.sessions.push(session);
  state.running = false;
  state.runningActivity = "";
  state.elapsedMs = 0;
  nodes.mainAction.classList.remove("running");
  nodes.actionIcon.classList.remove("active");
  nodes.actionText.textContent = `开始${activity.label}`;
  nodes.sessionState.textContent = activity.doneState;
  nodes.liveLine.textContent = activity.doneLine(money);
  nodes.timer.textContent = "00:00:00";
  nodes.liveEarning.textContent = "￥0.00";
  setActivityPickerDisabled(false);

  renderToday();
  renderStats();
  renderBadges();
  renderReport(session);
  if (typeof nodes.reportDialog.showModal === "function") {
    nodes.reportDialog.showModal();
  }
}

function startMoneyRain() {
  if (prefersReducedMotion || !nodes.moneyRain) { return; }

  stopMoneyRain({ immediate: true });
  nodes.moneyRain.classList.add("active");
  spawnMoneyBills(12);
  state.moneyRainId = window.setInterval(() => spawnMoneyBills(4), 430);
}

function stopMoneyRain(options = {}) {
  if (!nodes.moneyRain) { return; }

  window.clearInterval(state.moneyRainId);
  state.moneyRainId = null;
  nodes.moneyRain.classList.remove("active");

  if (options.immediate) {
    nodes.moneyRain.replaceChildren();
    return;
  }

  window.setTimeout(() => {
    if (!state.running) {
      nodes.moneyRain.replaceChildren();
    }
  }, 1200);
}

function spawnMoneyBills(count) {
  const fragment = document.createDocumentFragment();

  Array.from({ length: count }).forEach(() => {
    const bill = document.createElement("span");
    const duration = 2.4 + Math.random() * 1.7;
    const serial = Math.random().toString(36).slice(2, 8).toUpperCase();
    bill.className = "money-bill";
    bill.dataset.tone = String(Math.ceil(Math.random() * 3));
    bill.innerHTML = `
      <span class="bill-corner">￥</span>
      <span class="bill-portrait" aria-hidden="true"></span>
      <span class="bill-value">100</span>
      <span class="bill-serial">${serial}</span>
    `;
    bill.style.left = `${Math.random() * 100}%`;
    bill.style.setProperty("--drift", `${Math.round((Math.random() - 0.5) * 120)}px`);
    bill.style.setProperty("--fall-duration", `${duration}s`);
    bill.style.setProperty("--spin", `${Math.round((Math.random() - 0.5) * 520)}deg`);
    bill.style.animationDelay = `${Math.random() * 0.28}s`;
    bill.addEventListener("animationend", () => bill.remove());
    fragment.append(bill);
  });

  nodes.moneyRain.append(fragment);
}

function tick() {
  const activity = getActivityMode(state.runningActivity || state.activeActivity);
  state.elapsedMs = Date.now() - state.startTime;
  const seconds = Math.floor(state.elapsedMs / 1000);
  const money = seconds * getRates().second;
  nodes.timer.textContent = formatClock(seconds);
  nodes.liveEarning.textContent = formatMoney(money);
  nodes.liveLine.textContent = activity.encouragements[
    Math.floor(seconds / 5) % activity.encouragements.length
  ];
}

function switchTab(tab) {
  nodes.tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === tab;
    button.classList.toggle("active", isActive);
    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
  nodes.screens.forEach((screen) => {
    screen.classList.toggle("active", screen.id === `${tab}Screen`);
  });
  nodes.contentScroll.scrollTop = 0;
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

function getTodayActivityTotals() {
  const totals = Object.fromEntries(
    Object.keys(activityModes).map((activity) => [
      activity,
      { count: 0, seconds: 0, money: 0 }
    ])
  );

  state.sessions.forEach((session) => {
    const activity = activityModes[session.activity] ? session.activity : "toilet";
    totals[activity].count += 1;
    totals[activity].seconds += session.seconds;
    totals[activity].money += session.money;
  });

  return totals;
}

function renderTodayActivityList() {
  const totals = getTodayActivityTotals();
  nodes.todayActivityList.innerHTML = Object.entries(activityModes)
    .map(([activityKey, activity]) => {
      const activityTotal = totals[activityKey];
      const isActive = activityKey === state.activeActivity;
      return `
        <article
          class="today-activity-item${isActive ? " active" : ""}"
          data-activity="${activityKey}"
          aria-label="${activity.label}，${activityTotal.count}次，${formatDuration(activityTotal.seconds)}，收益${formatMoney(activityTotal.money)}"
          aria-current="${isActive ? "true" : "false"}"
        >
          <span class="today-activity-stamp" aria-hidden="true">${activity.stamp}</span>
          <div class="today-activity-name">
            <strong>${activity.shortLabel}</strong>
            <span>${activityTotal.count} 次</span>
          </div>
          <div class="today-activity-numbers">
            <div>
              <strong>${formatDuration(activityTotal.seconds)}</strong>
              <span>时长</span>
            </div>
            <div>
              <strong>${formatMoney(activityTotal.money)}</strong>
              <span>收益</span>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderToday() {
  const activity = getActivityMode();
  const totals = getTodayActivityTotals()[state.activeActivity];
  nodes.todayCard.dataset.activity = state.activeActivity;
  nodes.todayCard.dataset.label = `${state.activeActivity.toUpperCase()} SCORE`;
  nodes.todayTitle.textContent = `今日${activity.shortLabel}累计`;
  nodes.todayCount.textContent = totals.count;
  nodes.todayDuration.textContent = formatDuration(totals.seconds);
  nodes.todayEarning.textContent = formatMoney(totals.money);
  renderTodayActivityList();

  if (totals.count === 0) {
    nodes.todayMood.textContent = `今天还没有${activity.shortLabel}记录`;
  } else if (totals.money < 20) {
    nodes.todayMood.textContent = `${activity.shortLabel}已经开始回血`;
  } else {
    nodes.todayMood.textContent = `${activity.shortLabel}收益正在发热`;
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

  renderPeriodDetails(current);
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

function renderPeriodDetails(total) {
  const config = periodDetailConfig[state.activePeriod];
  const rows = state.activePeriod === "day"
    ? state.sessions.map((session, index) => ({
        label: session.at instanceof Date
          ? session.at.toLocaleTimeString("zh-CN", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            })
          : `第 ${index + 1} 笔`,
        count: 1,
        seconds: session.seconds,
        money: session.money,
        activity: session.activity || "toilet"
      }))
    : makeAggregateRows(total, config);

  nodes.periodDetailSubtitle.textContent = `${config.label} · ${config.granularity}`;
  if (!rows.length) {
    nodes.periodDetails.innerHTML = `
      <div class="timeline-empty" role="status">
        今天暂无记录，完成一次计时后会自动入账。
      </div>
    `;
    return;
  }

  const maxMoney = Math.max(...rows.map((row) => row.money), 1);
  nodes.periodDetails.innerHTML = rows
    .map((row, index) => {
      const duration = formatDuration(row.seconds);
      const detail = state.activePeriod === "day"
        ? `${getActivityMode(row.activity).shortLabel} · ${duration}`
        : `${row.count} 次 · ${duration}`;
      const width = Math.max(8, Math.round((row.money / maxMoney) * 100));

      return `
        <div
          class="timeline-row"
          role="listitem"
          aria-label="${row.label}，${row.count}次，${duration}，收益${formatMoney(row.money)}"
        >
          <span class="timeline-label">${row.label}</span>
          <div class="timeline-main">
            <strong>${detail}</strong>
            <div class="timeline-bar" aria-hidden="true">
              <span style="width: ${width}%"></span>
            </div>
          </div>
          <span class="timeline-value">${formatMoney(row.money)}</span>
        </div>
      `;
    })
    .join("");
}

function makeAggregateRows(total, config) {
  const counts = allocateByWeight(total.count, config.weights);
  const seconds = allocateByWeight(total.seconds, config.weights);
  const moneyInCents = allocateByWeight(Math.round(total.money * 100), config.weights);

  return config.rows.map((label, index) => ({
    label,
    count: counts[index],
    seconds: seconds[index],
    money: moneyInCents[index] / 100
  }));
}

function allocateByWeight(total, weights) {
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const rawValues = weights.map((weight) => (total * weight) / weightTotal);
  const values = rawValues.map((value) => Math.floor(value));
  const allocated = values.reduce((sum, value) => sum + value, 0);
  const remainderOrder = rawValues
    .map((value, index) => ({ index, fraction: value - values[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let index = 0; index < total - allocated; index += 1) {
    values[remainderOrder[index % remainderOrder.length].index] += 1;
  }

  return values;
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
  const activity = getActivityMode(session.activity);
  state.lastReport = { session, totals };
  nodes.reportCard.dataset.activity = session.activity || "toilet";
  nodes.reportTitle.textContent = `本次${activity.label}`;
  nodes.posterTitle.textContent = `今日${activity.label}`;
  nodes.shareStatus.textContent = "";
  nodes.reportMoney.textContent = formatMoney(session.money);
  nodes.reportDuration.textContent = formatDuration(session.seconds);
  nodes.reportCount.textContent = `${totals.count}次`;
  nodes.reportTotalDuration.textContent = formatDuration(totals.seconds);
  nodes.reportTotalMoney.textContent = formatMoney(totals.money);
  nodes.posterDuration.textContent = formatDuration(totals.seconds);
  nodes.posterMoney.textContent = `赚了 ${formatMoney(totals.money)}`;
}

async function shareReport() {
  if (!state.lastReport) {
    nodes.shareStatus.textContent = "先结束一次计时，再分享战报。";
    return;
  }

  const shareData = makeShareData(state.lastReport);
  nodes.shareReport.disabled = true;
  nodes.shareStatus.textContent = "正在准备分享...";

  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share(shareData);
      nodes.shareStatus.textContent = "已打开系统分享。";
      return;
    }

    await copyShareText(shareData.text);
    nodes.shareStatus.textContent = "分享文案已复制，可以发给朋友了。";
  } catch (error) {
    if (error?.name === "AbortError") {
      nodes.shareStatus.textContent = "已取消分享。";
      return;
    }

    try {
      await copyShareText(shareData.text);
      nodes.shareStatus.textContent = "系统分享不可用，已复制分享文案。";
    } catch {
      nodes.shareStatus.textContent = "分享失败，请稍后再试。";
    }
  } finally {
    nodes.shareReport.disabled = false;
  }
}

async function copyReportText() {
  if (!state.lastReport) {
    nodes.shareStatus.textContent = "先结束一次计时，再复制分享文案。";
    return;
  }

  try {
    const shareData = makeShareData(state.lastReport);
    await copyShareText(shareData.text);
    nodes.shareStatus.textContent = "分享文案已复制，可以发给朋友了。";
  } catch {
    nodes.shareStatus.textContent = "复制失败，请手动截图分享。";
  }
}

function makeShareData(report) {
  const { session, totals } = report;
  const activity = getActivityMode(session.activity);
  const text = [
    `我刚完成一次${activity.label}：`,
    `本次 ${formatDuration(session.seconds)}，赚了 ${formatMoney(session.money)}。`,
    `今日累计 ${formatDuration(totals.seconds)}，共 ${formatMoney(totals.money)}。`,
    "你也来算算你的时间价值。"
  ].join("\n");

  const data = {
    title: `今天值多少钱 · ${activity.shortLabel}战报`,
    text
  };

  if (!location.hostname.includes("127.0.0.1") && location.hostname !== "localhost") {
    data.url = location.href;
  }

  return data;
}

async function copyShareText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
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
