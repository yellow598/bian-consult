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
  brandSub: "AI 數位顧問 × 紫微命理",
  // email: "hello@example.com", // （待替換）
  line: "LINE",
  // instagram: "https://instagram.com/", // （待替換）
};

// 連結不帶 .html（GitHub Pages 會自動對應到同名的 .html 檔）；首頁用 "./"
const NAV = [
  { key: "index", href: "./", label: "首頁" },
  { key: "about", href: "about", label: "關於我" },
  { key: "digitalconsultant", href: "digitalconsultant", label: "AI 數位顧問" },
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
  <div class="container">
    <a class="logo" href="./">${SITE.brand}<small>${SITE.brandSub}</small></a>
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
        <h4>${SITE.brand}</h4>
        <p>把複雜的事情拆清楚<br>找到適合你的下一步</p>
      </div>
      <div>
        <h4>服務</h4>
        <ul>
          <li><a href="digitalconsultant">AI 數位顧問</a></li>
          <li><a href="lifemap">紫微命理諮詢</a></li>
        </ul>
      </div>
      <div>
        <h4>聯絡</h4>
        <ul>
          <li><a href="contact">預約諮詢</a></li>
          <li><a href="https://lin.ee/U0YWXhv" target="_blank" rel="noopener noreferrer">${SITE.line}</a></li>
        </ul>
      </div>
    </div>
    <div class="copy">© ${new Date().getFullYear()} ${SITE.brand}. All rights reserved.</div>
  </div>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const footer = document.querySelector(".site-footer");
  if (header) header.innerHTML = renderHeader();
  if (footer) footer.innerHTML = renderFooter();

  // 手機選單
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  toggle?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
    toggle.textContent = open ? "✕" : "☰";
  });

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

  // 聯絡表單（目前無後端：改用開啟 Email 寄送；之後可換 Formspree / Google 表單）
  const form = document.querySelector("#contact-form");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const body = [...d.entries()].map(([k, v]) => `${k}：${v}`).join("\n");
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent("預約諮詢：" + d.get("服務項目"))}&body=${encodeURIComponent(body)}`;
  });

  // 從服務頁帶入預選項目 contact?service=ziwei
  const svc = new URLSearchParams(location.search).get("service");
  const select = document.querySelector("#service");
  if (svc && select) {
    const opt = [...select.options].find((o) => o.dataset.key === svc);
    if (opt) opt.selected = true;
  }
});
