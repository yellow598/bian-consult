/* =========================================================
   共用頁首 / 頁尾（改這裡，五個頁面會一起更新）
   ========================================================= */
const SITE = {
  brand: "比安學姊",
  brandSub: "AI 數位顧問 × 紫微命理",
  // email: "hello@example.com", // （待替換）
  line: "LINE",
  // instagram: "https://instagram.com/", // （待替換）
};

const NAV = [
  { href: "index.html", label: "首頁" },
  { href: "about.html", label: "關於我" },
  { href: "digitalconsultant.html", label: "AI 數位顧問" },
  { href: "lifemap.html", label: "紫微命理" },
];

function currentPage() {
  const file = location.pathname.split("/").pop();
  return file === "" ? "index.html" : file;
}

function renderHeader() {
  const page = currentPage();
  const links = NAV.map(
    (n) =>
      `<a href="${n.href}" class="${n.href === page ? "active" : ""}">${n.label}</a>`,
  ).join("");
  return `
  <div class="container">
    <a class="logo" href="index.html">${SITE.brand}<small>${SITE.brandSub}</small></a>
    <button class="nav-toggle" aria-label="開啟選單" aria-expanded="false">☰</button>
    <nav class="nav">
      ${links}
      <a class="btn ${page === "contact.html" ? "active" : ""}" href="contact.html">預約諮詢</a>
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
          <li><a href="digitalconsultant.html">AI 數位顧問</a></li>
          <li><a href="lifemap.html">紫微命理諮詢</a></li>
        </ul>
      </div>
      <div>
        <h4>聯絡</h4>
        <ul>
          <li><a href="contact.html">預約諮詢</a></li>
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

  // 從服務頁帶入預選項目 contact.html?service=ziwei
  const svc = new URLSearchParams(location.search).get("service");
  const select = document.querySelector("#service");
  if (svc && select) {
    const opt = [...select.options].find((o) => o.dataset.key === svc);
    if (opt) opt.selected = true;
  }
});
