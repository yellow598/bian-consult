/* =========================================================
   共用頁首 / 頁尾（改這裡，五個頁面會一起更新）
   ========================================================= */
// 網址若帶 .html（舊連結、書籤、直接輸入），在網址列改成乾淨的寫法（不會重新載入頁面）
(function cleanUrl() {
  if (location.protocol === "file:") return;
  const clean = location.pathname
    .replace(/(^|\/)index\.html$/, "$1")
    .replace(/\.html$/, "");
  if (clean !== location.pathname) {
    history.replaceState(null, "", clean + location.search + location.hash);
  }
})();

const SITE = {
  brand: "比安學姊",
  email: "evolve.mindset.studio@gmail.com", // 預約免費診斷表單寄到這裡
  line: "LINE",
  // instagram: "https://instagram.com/", // （待替換）
};

// 連結不帶 .html（GitHub Pages 會自動對應到同名的 .html 檔）；首頁用 "./"
const NAV = [
  { key: "index", href: "./", label: "首頁" },
  { key: "about", href: "about", label: "關於我" },
  { key: "digitalconsultant", href: "digitalconsultant", label: "數位策略顧問" },
  { key: "lifemap", href: "lifemap", label: "紫微命理" },
];

// 取得目前頁面的代號（網址有無 .html 都能判斷；空字串代表首頁）
function currentPage() {
  const file = location.pathname.split("/").pop().replace(/\.html$/, "");
  return file === "" ? "index" : file;
}

function renderHeader() {
  const page = currentPage();
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}" class="${n.key === page ? "active" : ""}">${n.label}</a>`,
  ).join("");
  return `
  <a class="skip-link" href="#main">跳到主要內容</a>
  <div class="container">
    <a class="logo" href="./"><img class="logo-mark" src="favicon.svg" alt="" width="40" height="40" /><span class="logo-text">${SITE.brand}</span></a>
    <button class="nav-toggle" aria-label="開啟選單" aria-expanded="false">☰</button>
    <nav class="nav">
      ${links}
      <a class="btn ${page === "contact" ? "active" : ""}" href="contact">預約諮詢</a>
    </nav>
  </div>`;
}

function renderFooter() {
  return `
  <div class="container">
    <div class="cols">
      <div>
        <h2>${SITE.brand}</h2>
        <p>左手寫程式，右手排命盤<br>用工程師的理性，讀懂星盤裡的感性</p>
      </div>
      <div>
        <h2>服務</h2>
        <ul>
          <li><a href="digitalconsultant">數位策略顧問</a></li>
          <li><a href="lifemap">紫微命理諮詢</a></li>
        </ul>
      </div>
      <div>
        <h2>聯絡</h2>
        <ul>
          <li><a href="contact">預約諮詢</a></li>
          <li><a href="https://lin.ee/U0YWXhv" target="_blank" rel="noopener noreferrer">${SITE.line}</a></li>
        </ul>
      </div>
    </div>
    <div class="copy">© ${new Date().getFullYear()} ${SITE.brand} Biansis. All rights reserved.</div>
  </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const footer = document.querySelector(".site-footer");
  if (header) header.innerHTML = renderHeader();
  if (footer) footer.innerHTML = renderFooter();

  // 「跳到主要內容」連結的目標
  const main = document.querySelector("main");
  if (main) {
    main.id = "main";
    main.tabIndex = -1;
  }

  // 手機選單
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "✕" : "☰";
  });

  // 浮動預約按鈕：只出現在服務頁，捲過首屏後才浮出，頁尾進入畫面時收起
  const FLOAT_LINKS = {
    lifemap: "https://lin.ee/U0YWXhv",
    digitalconsultant: "contact",
  };
  const floatHref = FLOAT_LINKS[currentPage()];
  if (floatHref) {
    const fab = document.createElement("a");
    fab.className = "fab-book";
    fab.href = floatHref;
    if (/^https?:/.test(floatHref)) {
      fab.target = "_blank"; // 外部連結（LINE）另開分頁
      fab.rel = "noopener noreferrer";
    }
    fab.textContent = "預約";
    document.body.appendChild(fab);
    let pastHero = false;
    let nearFooter = false;
    const sync = () => fab.classList.toggle("show", pastHero && !nearFooter);
    const onScroll = () => {
      pastHero = window.scrollY > 480;
      sync();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (footer) {
      new IntersectionObserver((entries) => {
        nearFooter = entries[0].isIntersecting;
        sync();
      }).observe(footer);
    }
  }

  // 捲動淡入
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // 圖片防護（全站）：右鍵不出現「另存圖片／在新分頁開啟圖片／複製圖片」，也不能拖曳
  // 掛在 document 上，之後新增的圖片自動適用；只防一般訪客，擋不住截圖或開發者工具
  document.addEventListener("contextmenu", (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault();
  });
  document.addEventListener("dragstart", (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault();
  });

  // 從其他頁連到 #錨點（例如 lifemap#reviews）：等頁首與字型載入後再捲到定位
  if (location.hash) {
    window.addEventListener("load", () => {
      try {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: "instant" });
      } catch {} // 網址 # 後面不是合法選擇器時不報錯
    });
  }

  // 預約免費診斷：三步驟表單（目前無後端，送出時開啟 Email 寄給比安）
  const booking = document.querySelector("#booking-form");
  if (booking) {
    const steps = [...booking.querySelectorAll(".booking-step")];
    const bars = [...booking.querySelectorAll(".booking-progress i")];
    const prev = booking.querySelector(".booking-prev");
    const next = booking.querySelector(".booking-next");
    const submit = booking.querySelector(".booking-submit");
    const error = booking.querySelector(".booking-error");
    const done = booking.querySelector(".booking-done");
    const foot = booking.querySelector(".booking-foot");
    const head = [booking.querySelector(".booking-head"), booking.querySelector(".booking-progress"), booking.querySelector(".booking-actions")];
    let current = 0;

    const show = (i) => {
      current = i;
      steps.forEach((s, n) => (s.hidden = n !== i));
      bars.forEach((b, n) => b.classList.toggle("on", n <= i));
      booking.querySelector("[data-step-num]").textContent = i + 1;
      booking.querySelector("[data-step-title]").textContent = steps[i].dataset.title;
      prev.hidden = i === 0;
      next.hidden = i === steps.length - 1;
      submit.hidden = i !== steps.length - 1;
      error.hidden = true;
      booking.querySelectorAll(".is-invalid").forEach((q) => q.classList.remove("is-invalid"));
    };

    // 檢查目前這一步的必填題，回傳第一個沒填的題目
    const check = () => {
      let first = null;
      steps[current].querySelectorAll(".booking-q[data-required]").forEach((q) => {
        const inputs = [...q.querySelectorAll("input, textarea")];
        let ok = inputs.some((el) => (el.type === "radio" || el.type === "checkbox" ? el.checked : el.value.trim() !== ""));
        if (ok && q.dataset.type === "email") ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs[0].value.trim());
        q.classList.toggle("is-invalid", !ok);
        if (!ok && !first) first = q;
      });
      if (first) {
        error.textContent = first.dataset.type === "email" && first.querySelector("input").value.trim()
          ? "Email 格式好像不太對，再確認一下"
          : `請填寫「${first.dataset.label}」`;
        error.hidden = false;
        (first.querySelector("input:not([type=radio]):not([type=checkbox]), textarea") || first.querySelector("input"))?.focus({ preventScroll: true });
        first.scrollIntoView({ block: "center", behavior: "smooth" });
        return false;
      }
      error.hidden = true;
      return true;
    };

    const top = () => booking.scrollIntoView({ block: "start", behavior: "smooth" });
    next.addEventListener("click", () => { if (check()) { show(current + 1); top(); } });
    prev.addEventListener("click", () => { show(current - 1); top(); });
    booking.addEventListener("change", (e) => {
      const q = e.target.closest(".booking-q.is-invalid");
      if (q) { q.classList.remove("is-invalid"); error.hidden = true; }
    });

    booking.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!check()) return;
      const d = new FormData(booking);
      const lines = [];
      for (const key of new Set(d.keys())) {
        const v = d.getAll(key).map((x) => String(x).trim()).filter(Boolean).join("、");
        lines.push(`${key}：${v || "（未填）"}`);
      }
      const subject = `預約免費診斷：${d.get("公司或品牌") || ""}／${d.get("稱呼") || ""}`;
      location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
      steps.forEach((s) => (s.hidden = true));
      head.forEach((el) => (el.hidden = true));
      error.hidden = true;
      foot.hidden = true;
      done.hidden = false;
      top();
    });

    booking.querySelector(".booking-back").addEventListener("click", () => {
      done.hidden = true;
      foot.hidden = false;
      head.forEach((el) => (el.hidden = false));
      show(steps.length - 1);
    });

    show(0);
  }
});
