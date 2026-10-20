/* =========================================================
   免費紫微斗數排盤（排盤運算：iztro，全部在瀏覽器端執行）
   ========================================================= */
(function () {
  const $ = (s) => document.querySelector(s);
  const form = $("#pp-form");
  if (!form || !window.iztro) {
    if (form) {
      const err = $("#pp-error");
      err.hidden = false;
      err.textContent = "排盤程式載入失敗，請檢查網路後重新整理頁面。";
    }
    return;
  }
  const { astro } = window.iztro;

  const HOURS = [
    "早子時 00:00～01:00",
    "丑時 01:00～03:00",
    "寅時 03:00～05:00",
    "卯時 05:00～07:00",
    "辰時 07:00～09:00",
    "巳時 09:00～11:00",
    "午時 11:00～13:00",
    "未時 13:00～15:00",
    "申時 15:00～17:00",
    "酉時 17:00～19:00",
    "戌時 19:00～21:00",
    "亥時 21:00～23:00",
    "晚子時 23:00～00:00",
  ];
  const LUNAR_MONTHS = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "冬", "臘"];
  const LUNAR_DAYS = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
  ];
  // 地支 → 在 4x4 格子中的位置 [列, 欄]（1 起算）
  const GRID = {
    巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4],
    辰: [2, 1], 酉: [2, 4],
    卯: [3, 1], 戌: [3, 4],
    寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4],
  };
  const FU10 = new Set(["左輔", "右弼", "文昌", "文曲", "天魁", "天鉞", "擎羊", "陀羅", "火星", "鈴星"]);
  const SKY2 = new Set(["地空", "地劫"]);
  const LOVE2 = new Set(["紅鸞", "天喜"]);
  const MUT = ["祿", "權", "科", "忌"];
  const MUT_CLASS = { 祿: "m-lu", 權: "m-quan", 科: "m-ke", 忌: "m-ji" };

  const el = {
    cal: $("#pp-cal"), year: $("#pp-year"), month: $("#pp-month"), day: $("#pp-day"),
    leapWrap: $("#pp-leap-wrap"), leap: $("#pp-leap"), hour: $("#pp-hour"),
    name: $("#pp-name"), error: $("#pp-error"), result: $("#pp-result"),
    chart: $("#pp-chart"), sihua: $("#pp-sihua"), note: $("#pp-mode-note"),
    adj: $("#pp-adj"), hyear: $("#pp-hyear"), yearPick: $("#pp-year-pick"),
  };

  const now = new Date();
  const thisYear = now.getFullYear();
  const state = { chart: null, mode: "natal", selected: null, hyear: thisYear, name: "" };

  /* ---------- 表單 ---------- */
  const opt = (v, t) => `<option value="${v}">${t}</option>`;
  el.hour.innerHTML = HOURS.map((t, i) => opt(i, t)).join("");
  el.hour.value = "6";

  function fillYears() {
    const lunar = el.cal.value === "lunar";
    const cur = el.year.value || "1990";
    let h = "";
    for (let y = thisYear; y >= 1900; y--) h += opt(y, lunar ? `${y} 年` : `${y} 年`);
    el.year.innerHTML = h;
    el.year.value = cur;
  }
  function fillMonths() {
    const lunar = el.cal.value === "lunar";
    const cur = el.month.value || "1";
    let h = "";
    for (let m = 1; m <= 12; m++) h += opt(m, lunar ? `${LUNAR_MONTHS[m - 1]}月` : `${m} 月`);
    el.month.innerHTML = h;
    el.month.value = cur;
  }
  // 農曆日期是否存在：換成國曆再轉回農曆，比對是否同一天（排除小月三十、不存在的閏月）
  const normLunar = (s) => s.replace(/腊/g, "臘").replace(/闰/g, "閏");
  const lunarText = (m, d, leap) => (leap ? "閏" : "") + LUNAR_MONTHS[m - 1] + "月" + LUNAR_DAYS[d - 1];
  function lunarExists(y, m, d, leap) {
    try {
      const c = astro.byLunar(`${y}-${m}-${d}`, 0, "女", leap, true, "zh-TW");
      const back = astro.bySolar(c.solarDate, 0, "女", true, "zh-TW").lunarDate;
      return normLunar(back).startsWith(c.lunarDate.slice(0, 5)) && normLunar(back).endsWith(lunarText(m, d, leap));
    } catch (e) {
      return false;
    }
  }
  function fillDays() {
    const lunar = el.cal.value === "lunar";
    const cur = el.day.value || "1";
    const y = +el.year.value, m = +el.month.value;
    let n;
    if (!lunar) {
      // 國曆：大月 31、小月 30；2 月平年 28、閏年 29（交給 Date 計算）
      n = new Date(y, m, 0).getDate();
    } else {
      // 農曆：這一年這個月有閏月才顯示「閏月」；大月 30、小月 29
      const hasLeap = lunarExists(y, m, 1, true);
      el.leapWrap.hidden = !hasLeap;
      if (!hasLeap) el.leap.checked = false;
      n = lunarExists(y, m, 30, el.leap.checked) ? 30 : 29;
    }
    let h = "";
    for (let d = 1; d <= n; d++) h += opt(d, lunar ? LUNAR_DAYS[d - 1] : `${d} 日`);
    el.day.innerHTML = h;
    el.day.value = +cur <= n ? cur : String(n);
  }
  fillYears(); fillMonths(); fillDays();
  el.cal.addEventListener("change", () => {
    if (el.cal.value !== "lunar") { el.leap.checked = false; el.leapWrap.hidden = true; }
    fillYears(); fillMonths(); fillDays();
  });
  el.year.addEventListener("change", fillDays);
  el.month.addEventListener("change", fillDays);
  el.leap.addEventListener("change", fillDays);

  /* ---------- 排盤 ---------- */
  function build() {
    const gender = form.querySelector("input[name=pp-gender]:checked").value;
    const y = el.year.value, m = el.month.value, d = el.day.value;
    const date = `${y}-${m}-${d}`;
    const t = +el.hour.value;
    if (el.cal.value === "solar") {
      return astro.bySolar(date, t, gender, true, "zh-TW");
    }
    const chart = astro.byLunar(date, t, gender, el.leap.checked, true, "zh-TW");
    // 函式庫遇到不存在的農曆日（如小月三十、無閏月）會自行換算，這裡改成直接擋下
    if (!lunarExists(+y, +m, +d, el.leap.checked)) throw new Error("invalid lunar date");
    return chart;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    el.error.hidden = true;
    try {
      const chart = build();
      if (!chart || !chart.palaces || chart.palaces.length !== 12) throw new Error("bad");
      state.chart = chart;
      state.name = el.name.value.trim();
      state.selected = chart.palaces.findIndex((p) => p.name === "命宮");
      state.mode = "natal";
      state.hyear = thisYear;
      fillHoroYears();
      render();
      el.result.hidden = false;
      el.result.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (err) {
      el.result.hidden = true;
      el.error.hidden = false;
      el.error.textContent =
        "這個日期排不出命盤，請確認日期是否存在（農曆的閏月、大小月都要符合）。";
    }
  });

  /* ---------- 檢視切換 ---------- */
  function fillHoroYears() {
    const birth = +state.chart.solarDate.split("-")[0];
    let h = "";
    for (let y = birth; y <= birth + 110; y++) h += opt(y, `${y} 年`);
    el.hyear.innerHTML = h;
    el.hyear.value = String(Math.max(birth, Math.min(thisYear, birth + 110)));
    state.hyear = +el.hyear.value;
  }
  document.querySelectorAll(".pp-seg button").forEach((b) =>
    b.addEventListener("click", () => {
      state.mode = b.dataset.mode;
      document.querySelectorAll(".pp-seg button").forEach((x) => x.classList.toggle("on", x === b));
      render();
    }),
  );
  el.hyear.addEventListener("change", () => { state.hyear = +el.hyear.value; render(); });
  el.adj.addEventListener("change", render);

  /* ---------- 繪製 ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const palName = (n) => (n.endsWith("宮") ? n : n + "宮");

  function horo() {
    // 取流年中段，避免跨立春／農曆新年造成誤差
    return state.chart.horoscope(`${state.hyear}-6-15`);
  }

  function starHtml(s, sihuaMap, cls) {
    const nat = s.mutagen ? `<i class="${MUT_CLASS[s.mutagen]}">${s.mutagen}</i>` : "";
    const sc = sihuaMap && sihuaMap[s.name] != null
      ? `<i class="${MUT_CLASS[MUT[sihuaMap[s.name]]]} is-scope">${state.mode === "decadal" ? "限" : "年"}${MUT[sihuaMap[s.name]]}</i>`
      : "";
    const br = s.brightness ? `<sub>${esc(s.brightness)}</sub>` : "";
    return `<span class="${cls}"><b class="nm">${esc(s.name)}</b>${br}${nat}${sc}</span>`;
  }

  function render() {
    const c = state.chart;
    const h = state.mode === "natal" ? null : horo();
    const scope = h ? (state.mode === "decadal" ? h.decadal : h.yearly) : null;
    el.yearPick.hidden = state.mode === "natal";

    const sihuaMap = {};
    if (scope) scope.mutagen.forEach((n, i) => (sihuaMap[n] = i));

    const sel = state.selected;
    const rel = new Set();
    if (sel != null) [sel, (sel + 4) % 12, (sel + 8) % 12, (sel + 6) % 12].forEach((i) => rel.add(i));

    const cells = c.palaces.map((p, i) => {
      const [r, col] = GRID[p.earthlyBranch];
      const names = scope ? scope.palaceNames[i] : p.name;
      const tags = [];
      if (p.isBodyPalace) tags.push('<em class="t-body">身</em>');
      if (h && h.decadal.index === i && state.mode !== "natal") tags.push('<em class="t-dec">大限命</em>');
      if (h && state.mode === "yearly" && h.yearly.index === i) tags.push('<em class="t-year">流年命</em>');
      // 十輔星（換色）、地空地劫、紅鸞天喜（換色）與主星併排
      const auxCls = (s) => (FU10.has(s.name) ? " s-fu" : LOVE2.has(s.name) ? " s-love" : SKY2.has(s.name) ? " s-sky" : "");
      const isAux = (s) => FU10.has(s.name) || SKY2.has(s.name) || LOVE2.has(s.name);
      const major = [
        ...p.majorStars,
        ...p.minorStars.filter(isAux),
        ...p.adjectiveStars.filter(isAux),
      ]
        .map((s) => starHtml(s, sihuaMap, "s-major" + auxCls(s)))
        .join("");
      const minor = p.minorStars.filter((s) => !isAux(s)).map((s) => starHtml(s, sihuaMap, "s-minor")).join("");
      const adj = el.adj.checked
        ? `<div class="pp-adj">${p.adjectiveStars.filter((s) => !isAux(s)).map((s) => `<span>${esc(s.name)}</span>`).join("")}</div>`
        : "";
      const cls = ["pp-cell"];
      if (i === sel) cls.push("is-sel");
      else if (rel.has(i)) cls.push("is-rel");
      if (i === state.chart.palaces.findIndex((x) => x.name === "命宮")) cls.push("is-soul");
      return `<div class="${cls.join(" ")}" data-i="${i}" style="grid-row:${r};grid-column:${col}" tabindex="0" role="button" aria-label="${esc(palName(names))}">
        <div class="pp-stars">
          <div class="pp-major">${major || '<span class="s-empty">&nbsp;</span>'}</div>
          <div class="pp-minor">${minor}</div>
          ${adj}
        </div>
        <div class="pp-foot">
          <span class="pp-cs">${esc(p.changsheng12)}</span>
          <span class="pp-range">${p.decadal.range[0]}–${p.decadal.range[1]}</span>
        </div>
        <div class="pp-head">
          <span class="pp-gz"><b class="gz-stem">${p.heavenlyStem}</b><b class="gz-branch">${p.earthlyBranch}</b></span>
          <span class="pp-tags">${tags.join("")}</span>
          <strong class="pp-pname">${esc(palName(names))}</strong>
        </div>
      </div>`;
    });

    const center = `<div class="pp-center" style="grid-row:2/4;grid-column:2/4">
      <h3>${state.name ? esc(state.name) : "命盤"}</h3>
      <dl>
        <div><dt>國曆</dt><dd>${esc(c.solarDate.replace(/-/g, "."))}　${esc(c.time)}</dd></div>
        <div><dt>農曆</dt><dd>${esc(normLunar(c.lunarDate))}</dd></div>
        <div><dt>干支</dt><dd>${esc(c.chineseDate)}</dd></div>
        <div><dt>性別</dt><dd>${esc(c.gender)}　生肖${esc(c.zodiac)}</dd></div>
        <div><dt>五行局</dt><dd>${esc(c.fiveElementsClass)}</dd></div>
        <div><dt>命主／身主</dt><dd>${esc(c.soul)}／${esc(c.body)}</dd></div>
        ${h ? `<div><dt>${state.mode === "decadal" ? "目前大限" : "流年"}</dt><dd>${state.mode === "decadal" ? `${h.decadal.heavenlyStem}${h.decadal.earthlyBranch}限（${c.palaces[h.decadal.index].decadal.range[0]}–${c.palaces[h.decadal.index].decadal.range[1]} 歲）` : `${state.hyear} 年 ${h.yearly.heavenlyStem}${h.yearly.earthlyBranch}年　虛歲 ${h.age.nominalAge}`}</dd></div>` : ""}
      </dl>
    </div>`;

    el.chart.innerHTML = cells.join("") + center + '<svg class="pp-lines" aria-hidden="true"></svg>';
    drawLines();

    // 模式說明
    el.note.textContent =
      state.mode === "natal"
        ? "本命盤：宮位名稱為先天命盤。"
        : state.mode === "decadal"
          ? "大限盤：宮位名稱已換成大限十二宮，標「限」的是大限四化。大限依「參考年份」當年的虛歲自動選取。"
          : `流年盤：宮位名稱已換成 ${state.hyear} 年的流年十二宮，標「年」的是流年四化。`;

    // 四化摘要
    const rows = [];
    const natalMut = [];
    c.palaces.forEach((p) => [...p.majorStars, ...p.minorStars].forEach((s) => {
      if (s.mutagen) natalMut[MUT.indexOf(s.mutagen)] = { star: s.name, pal: palName(p.name) };
    }));
    rows.push(sihuaRow("生年四化", natalMut.map((x, i) => x && { ...x, m: MUT[i] })));
    if (scope) {
      const lbl = state.mode === "decadal" ? "大限四化" : "流年四化";
      rows.push(sihuaRow(lbl, scope.mutagen.map((name, i) => {
        const pi = c.palaces.findIndex((p) => [...p.majorStars, ...p.minorStars].some((s) => s.name === name));
        return { star: name, pal: pi >= 0 ? palName(scope.palaceNames[pi]) : "", m: MUT[i] };
      })));
    }
    el.sihua.innerHTML = rows.join("");
  }

  /* ---------- 三方四正連線：選取宮位 → 三合兩宮與對宮，三合之間也連成三角形 ---------- */
  // 每個地支取「朝向中宮」的那個點：角落宮取內角，其餘取內側邊的中點
  const ANCHOR = {
    巳: [1, 1], 午: [0.5, 1], 未: [0.5, 1], 申: [0, 1],
    辰: [1, 0.5], 酉: [0, 0.5],
    卯: [1, 0.5], 戌: [0, 0.5],
    寅: [1, 0], 丑: [0.5, 0], 子: [0.5, 0], 亥: [0, 0],
  };
  function drawLines() {
    const svg = el.chart.querySelector(".pp-lines");
    if (!svg) return;
    const sel = state.selected;
    if (sel == null) { svg.innerHTML = ""; return; }
    const box = el.chart.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    const pt = (i) => {
      const cell = el.chart.querySelector(`.pp-cell[data-i="${i}"]`);
      const r = cell.getBoundingClientRect();
      const [ax, ay] = ANCHOR[state.chart.palaces[i].earthlyBranch];
      return [r.left - box.left + r.width * ax, r.top - box.top + r.height * ay];
    };
    const [a, b, c, d] = [sel, (sel + 4) % 12, (sel + 8) % 12, (sel + 6) % 12].map(pt);
    const line = (p, q) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" />`;
    svg.innerHTML = line(a, b) + line(a, c) + line(b, c) + line(a, d);
  }
  if (window.ResizeObserver) new ResizeObserver(drawLines).observe(el.chart);

  function sihuaRow(title, items) {
    const li = items
      .filter(Boolean)
      .map((x) => `<li><i class="${MUT_CLASS[x.m]}">${x.m}</i><b>${esc(x.star)}</b><span>${esc(x.pal)}</span></li>`)
      .join("");
    return `<div class="pp-sihua-row"><h4>${title}</h4><ul>${li}</ul></div>`;
  }

  /* ---------- 點宮位：標出三方四正 ---------- */
  function pick(target) {
    const cell = target.closest(".pp-cell");
    if (!cell) return;
    const i = +cell.dataset.i;
    state.selected = state.selected === i ? null : i;
    render();
    const again = el.chart.querySelector(`.pp-cell[data-i="${i}"]`);
    again && again.focus({ preventScroll: true });
  }
  el.chart.addEventListener("click", (e) => pick(e.target));
  el.chart.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(e.target); }
  });

  /* ---------- 複製文字／列印 ---------- */
  $("#pp-print").addEventListener("click", () => window.print());
  $("#pp-copy").addEventListener("click", async (ev) => {
    const c = state.chart;
    const lines = [
      `${state.name || "命盤"}`,
      `國曆 ${c.solarDate}　${c.time}　${c.gender}`,
      `農曆 ${normLunar(c.lunarDate)}　${c.chineseDate}`,
      `五行局 ${c.fiveElementsClass}　命主 ${c.soul}　身主 ${c.body}`,
      "",
      ...c.palaces
        .slice()
        .sort((a, b) => "命兄夫子財疾遷僕官田福父".indexOf(a.name[0]) - "命兄夫子財疾遷僕官田福父".indexOf(b.name[0]))
        .map((p) => {
          const st = [...p.majorStars, ...p.minorStars]
            .map((s) => s.name + (s.brightness || "") + (s.mutagen ? "化" + s.mutagen : ""))
            .join("、");
          return `${palName(p.name)}（${p.heavenlyStem}${p.earthlyBranch}，${p.decadal.range[0]}–${p.decadal.range[1]}歲）：${st || "無主星"}`;
        }),
    ].join("\n");
    const btn = ev.currentTarget;
    try {
      await navigator.clipboard.writeText(lines);
      btn.textContent = "已複製";
    } catch (e) {
      btn.textContent = "此瀏覽器無法複製";
    }
    setTimeout(() => (btn.textContent = "複製命盤文字"), 1800);
  });
})();
