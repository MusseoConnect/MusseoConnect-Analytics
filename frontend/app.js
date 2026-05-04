/* ═══════════════════════════════════════════════════════════════════════════
   Delhi Museum Analytics — Frontend Controller
   Interactive Chart.js dashboard with section navigation and live data.
   ═══════════════════════════════════════════════════════════════════════════ */

const API = "http://127.0.0.1:8000";

const MUSEUMS = [
  "All",
  "National Museum Delhi",
  "National Gallery of Modern Art Delhi",
  "Red Fort Archaeological Museum",
  "Gandhi Smriti Museum",
  "National Rail Museum Delhi",
];

/* ── Chart.js global defaults ─────────────────────────────────────────────── */

Chart.defaults.color = "#94a3b8";
Chart.defaults.borderColor = "rgba(255,255,255,0.06)";
Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
Chart.defaults.plugins.legend.labels.padding = 16;
Chart.defaults.plugins.tooltip.backgroundColor = "rgba(17,20,34,0.95)";
Chart.defaults.plugins.tooltip.borderColor = "rgba(255,255,255,0.1)";
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
Chart.defaults.plugins.tooltip.titleFont = { weight: "600", size: 13 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
Chart.defaults.animation = { duration: 700, easing: "easeOutQuart" };

/* ── Color palette ────────────────────────────────────────────────────────── */

const COLORS = {
  indigo:  { bg: "rgba(99,102,241,0.75)",  border: "#6366f1", light: "rgba(99,102,241,0.12)"  },
  violet:  { bg: "rgba(167,139,250,0.75)", border: "#a78bfa", light: "rgba(167,139,250,0.12)" },
  amber:   { bg: "rgba(245,158,11,0.75)",  border: "#f59e0b", light: "rgba(245,158,11,0.12)"  },
  emerald: { bg: "rgba(52,211,153,0.75)",  border: "#34d399", light: "rgba(52,211,153,0.12)"  },
  rose:    { bg: "rgba(251,113,133,0.75)", border: "#fb7185", light: "rgba(251,113,133,0.12)" },
  cyan:    { bg: "rgba(34,211,238,0.75)",  border: "#22d3ee", light: "rgba(34,211,238,0.12)"  },
  sky:     { bg: "rgba(56,189,248,0.75)",  border: "#38bdf8", light: "rgba(56,189,248,0.12)"  },
  pink:    { bg: "rgba(236,72,153,0.75)",  border: "#ec4899", light: "rgba(236,72,153,0.12)"  },
  lime:    { bg: "rgba(163,230,53,0.75)",  border: "#a3e635", light: "rgba(163,230,53,0.12)"  },
  orange:  { bg: "rgba(251,146,60,0.75)",  border: "#fb923c", light: "rgba(251,146,60,0.12)"  },
};

const PALETTE = Object.values(COLORS);
const colorAt = (i) => PALETTE[i % PALETTE.length];

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const $ = (id) => document.getElementById(id);
const qs = (sel) => document.querySelector(sel);

function museumParam() {
  const val = $("museumSelect").value;
  return val && val !== "All" ? `?museum=${encodeURIComponent(val)}` : "";
}

function showError(msg) {
  const banner = $("errorBanner");
  $("errorText").textContent = msg;
  banner.classList.remove("hidden");
  setTimeout(() => banner.classList.add("hidden"), 8000);
}

function setStatus(online) {
  const dot = $("statusDot");
  dot.classList.toggle("online", online);
  dot.classList.toggle("offline", !online);
  $("statusText").textContent = online ? "API Connected" : "API Offline";
}

/* ── Museum selector ──────────────────────────────────────────────────────── */

function populateMuseums() {
  const sel = $("museumSelect");
  MUSEUMS.forEach((m) => {
    if (m === "All") return; // already in HTML
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", () => loadAll());
}

/* ── Section navigation ───────────────────────────────────────────────────── */

const SECTION_META = {
  overview:     { title: "Overview",     sub: "Key performance metrics across all museums" },
  demographics: { title: "Demographics", sub: "Age, gender, and visitor segment analysis" },
  geography:    { title: "Geography",    sub: "Nationality and origin breakdown" },
  comparison:   { title: "Comparison",   sub: "Side-by-side museum performance metrics" },
  insights:     { title: "Insights",     sub: "Auto-generated analytical observations" },
};

function initNav() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      switchSection(section);
    });
  });

  // Mobile menu toggle
  const toggle = $("menuToggle");
  const sidebar = $("sidebar");
  if (toggle) {
    toggle.addEventListener("click", () => sidebar.classList.toggle("open"));
    // Close sidebar on nav click (mobile)
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => sidebar.classList.remove("open"));
    });
  }
}

function switchSection(name) {
  // Update nav
  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
  const activeLink = document.querySelector(`.nav-link[data-section="${name}"]`);
  if (activeLink) activeLink.classList.add("active");

  // Update sections
  document.querySelectorAll(".section").forEach((s) => s.classList.remove("active"));
  const sec = $(`section-${name}`);
  if (sec) sec.classList.add("active");

  // Update topbar
  const meta = SECTION_META[name] || {};
  $("sectionTitle").textContent = meta.title || name;
  $("sectionSub").textContent = meta.sub || "";
}

/* ── KPIs ─────────────────────────────────────────────────────────────────── */

function animateValue(el, end, suffix = "") {
  const isFloat = String(end).includes(".");
  const duration = 600;
  const start = 0;
  const startTime = performance.now();

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = start + (end - start) * eased;

    if (isFloat) {
      el.textContent = current.toFixed(1) + suffix;
    } else {
      el.textContent = Math.round(current).toLocaleString() + suffix;
    }

    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

async function loadKPIs() {
  try {
    const res = await fetch(`${API}/analytics/kpis${museumParam()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();

    animateValue($("kpi-totalVisitors"), d.total_visitors);
    animateValue($("kpi-avgAge"), d.avg_age);
    $("kpi-topNationality").textContent = d.top_nationality;
    $("kpi-phoneRate").textContent = d.phone_rate;
    $("kpi-intlRate").textContent = d.intl_rate;
    animateValue($("kpi-uniqueNat"), d.unique_nationalities);

    setStatus(true);
  } catch (err) {
    console.error("[KPI]", err);
    setStatus(false);
    showError("Backend unreachable — ensure FastAPI is running on port 8000.");
    ["kpi-totalVisitors", "kpi-avgAge", "kpi-topNationality", "kpi-phoneRate", "kpi-intlRate", "kpi-uniqueNat"]
      .forEach((id) => { $(id).textContent = "—"; });
  }
}

/* ── Chart instances registry ─────────────────────────────────────────────── */

const charts = {};

function destroyChart(key) {
  if (charts[key]) { charts[key].destroy(); delete charts[key]; }
}

/* ── Chart builders ───────────────────────────────────────────────────────── */

async function loadVisitorsChart() {
  try {
    const res = await fetch(`${API}/analytics/visitors_per_museum${museumParam()}`);
    const d = await res.json();
    destroyChart("visitors");

    charts.visitors = new Chart($("chart-visitors"), {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: [{
          label: "Visitors",
          data: d.values,
          backgroundColor: d.values.map((_, i) => colorAt(i).bg),
          borderColor: d.values.map((_, i) => colorAt(i).border),
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.7,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x.toLocaleString()} visitors`,
            },
          },
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  } catch (e) { console.error("[Visitors Chart]", e); }
}

async function loadEngagementChart() {
  try {
    const res = await fetch(`${API}/analytics/engagement_score${museumParam()}`);
    const d = await res.json();
    destroyChart("engagement");

    charts.engagement = new Chart($("chart-engagement"), {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: [{
          label: "Engagement Score",
          data: d.values,
          backgroundColor: d.values.map((v) =>
            v >= 80 ? COLORS.emerald.bg : v >= 60 ? COLORS.amber.bg : COLORS.rose.bg
          ),
          borderColor: d.values.map((v) =>
            v >= 80 ? COLORS.emerald.border : v >= 60 ? COLORS.amber.border : COLORS.rose.border
          ),
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.65,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` Score: ${ctx.parsed.y.toFixed(1)} / 100` },
          },
        },
        scales: {
          y: { max: 100, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 15 } },
        },
      },
    });
  } catch (e) { console.error("[Engagement Chart]", e); }
}

async function loadGenderChart() {
  try {
    const res = await fetch(`${API}/analytics/gender_distribution${museumParam()}`);
    const d = await res.json();
    destroyChart("gender");

    const clrs = [COLORS.indigo, COLORS.rose, COLORS.violet];
    charts.gender = new Chart($("chart-gender"), {
      type: "doughnut",
      data: {
        labels: d.labels,
        datasets: [{
          data: d.values,
          backgroundColor: d.labels.map((_, i) => clrs[i % clrs.length].bg),
          borderColor: d.labels.map((_, i) => clrs[i % clrs.length].border),
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  } catch (e) { console.error("[Gender Chart]", e); }
}

async function loadAgeGroupChart() {
  try {
    const res = await fetch(`${API}/analytics/age_group_distribution${museumParam()}`);
    const d = await res.json();
    destroyChart("ageGroup");

    const clrs = [COLORS.cyan, COLORS.indigo, COLORS.amber, COLORS.rose];
    charts.ageGroup = new Chart($("chart-ageGroup"), {
      type: "doughnut",
      data: {
        labels: d.labels,
        datasets: [{
          data: d.values,
          backgroundColor: d.labels.map((_, i) => clrs[i].bg),
          borderColor: d.labels.map((_, i) => clrs[i].border),
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((ctx.parsed / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  } catch (e) { console.error("[AgeGroup Chart]", e); }
}

async function loadAgeChart() {
  try {
    const res = await fetch(`${API}/analytics/age_distribution${museumParam()}`);
    const d = await res.json();
    destroyChart("age");

    charts.age = new Chart($("chart-age"), {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: [{
          label: "Visitors",
          data: d.values,
          backgroundColor: COLORS.violet.bg,
          borderColor: COLORS.violet.border,
          borderWidth: 1.5,
          borderRadius: 4,
          barPercentage: 0.9,
          categoryPercentage: 0.95,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { font: { size: 11 } } },
          x: { grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
        },
      },
    });
  } catch (e) { console.error("[Age Chart]", e); }
}

async function loadMuseumGenderChart() {
  try {
    const res = await fetch(`${API}/analytics/museum_gender_split${museumParam()}`);
    const d = await res.json();
    destroyChart("museumGender");

    const genderColors = { Male: COLORS.indigo, Female: COLORS.rose, Other: COLORS.violet };
    charts.museumGender = new Chart($("chart-museumGender"), {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: d.datasets.map((ds) => ({
          label: ds.label,
          data: ds.values,
          backgroundColor: (genderColors[ds.label] || COLORS.amber).bg,
          borderColor: (genderColors[ds.label] || COLORS.amber).border,
          borderWidth: 1.5,
          borderRadius: 4,
          barPercentage: 0.7,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 15 } },
          y: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { font: { size: 11 } } },
        },
      },
    });
  } catch (e) { console.error("[Museum Gender Chart]", e); }
}

async function loadNationalityChart() {
  try {
    const res = await fetch(`${API}/analytics/nationality_distribution${museumParam()}`);
    const d = await res.json();
    destroyChart("nationality");

    charts.nationality = new Chart($("chart-nationality"), {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: [{
          label: "Visitors",
          data: d.values,
          backgroundColor: d.values.map((_, i) => colorAt(i).bg),
          borderColor: d.values.map((_, i) => colorAt(i).border),
          borderWidth: 1.5,
          borderRadius: 6,
          barPercentage: 0.7,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => ` ${ctx.parsed.x.toLocaleString()} visitors` },
          },
        },
        scales: {
          x: { grid: { color: "rgba(255,255,255,0.04)" }, ticks: { font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  } catch (e) { console.error("[Nationality Chart]", e); }
}

async function loadDomIntlChart() {
  try {
    const res = await fetch(`${API}/analytics/domestic_international${museumParam()}`);
    const d = await res.json();
    destroyChart("domIntl");

    charts.domIntl = new Chart($("chart-domIntl"), {
      type: "doughnut",
      data: {
        labels: d.labels,
        datasets: [{
          data: d.values,
          backgroundColor: [COLORS.indigo.bg, COLORS.emerald.bg],
          borderColor: [COLORS.indigo.border, COLORS.emerald.border],
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const pct = d.percentages[ctx.dataIndex];
                return ` ${ctx.label}: ${ctx.parsed.toLocaleString()} (${pct}%)`;
              },
            },
          },
        },
      },
    });
  } catch (e) { console.error("[DomIntl Chart]", e); }
}

async function loadNatMuseumChart() {
  try {
    const res = await fetch(`${API}/analytics/nationality_by_museum${museumParam()}`);
    const d = await res.json();
    destroyChart("natMuseum");

    charts.natMuseum = new Chart($("chart-natMuseum"), {
      type: "bar",
      data: {
        labels: d.labels,
        datasets: d.datasets.map((ds, i) => ({
          label: ds.label,
          data: ds.values,
          backgroundColor: colorAt(i).bg,
          borderColor: colorAt(i).border,
          borderWidth: 1,
          borderRadius: 3,
          barPercentage: 0.8,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
        },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { font: { size: 10 }, maxRotation: 15 } },
          y: { stacked: true, grid: { color: "rgba(255,255,255,0.04)" }, ticks: { font: { size: 11 } } },
        },
      },
    });
  } catch (e) { console.error("[NatMuseum Chart]", e); }
}

/* ── Comparison table ─────────────────────────────────────────────────────── */

async function loadComparison() {
  try {
    const res = await fetch(`${API}/analytics/museum_comparison${museumParam()}`);
    const rows = await res.json();
    const tbody = $("comparisonBody");

    tbody.innerHTML = rows.map((r) => `
      <tr>
        <td class="museum-name">${r.museum}</td>
        <td class="num-highlight">${r.visitors.toLocaleString()}</td>
        <td>${r.avg_age}</td>
        <td>${r.male_pct}%</td>
        <td>${r.female_pct}%</td>
        <td>${r.intl_pct}%</td>
        <td>${r.phone_rate}%</td>
        <td>${r.nationalities}</td>
      </tr>
    `).join("");
  } catch (e) {
    console.error("[Comparison]", e);
    $("comparisonBody").innerHTML = `<tr><td colspan="8" style="text-align:center;color:#64748b;padding:30px">Failed to load comparison data</td></tr>`;
  }
}

/* ── Insights ─────────────────────────────────────────────────────────────── */

const INSIGHT_ICONS = {
  highlight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  info:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  metric:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  trend:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  action:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  warning:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

async function loadInsights() {
  try {
    const res = await fetch(`${API}/analytics/insights${museumParam()}`);
    const items = await res.json();
    const grid = $("insightsGrid");

    grid.innerHTML = items.map((item) => `
      <div class="insight-card">
        <span class="insight-type-tag tag--${item.type}">
          ${INSIGHT_ICONS[item.type] || ""}
          ${item.type}
        </span>
        <span class="insight-label">${item.label}</span>
        <span class="insight-text">${item.text}</span>
      </div>
    `).join("");
  } catch (e) {
    console.error("[Insights]", e);
    $("insightsGrid").innerHTML = `<div class="insight-card insight-card--loading">Failed to load insights</div>`;
  }
}

/* ── Load everything ──────────────────────────────────────────────────────── */

async function loadAll() {
  await Promise.all([
    // Data
    loadKPIs(),
    // Overview charts
    loadVisitorsChart(),
    loadEngagementChart(),
    // Demographics
    loadGenderChart(),
    loadAgeGroupChart(),
    loadAgeChart(),
    loadMuseumGenderChart(),
    // Geography
    loadNationalityChart(),
    loadDomIntlChart(),
    loadNatMuseumChart(),
    // Comparison
    loadComparison(),
    // Insights
    loadInsights(),
  ]);

  $("lastUpdated").textContent =
    "Updated " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

populateMuseums();
initNav();
loadAll();