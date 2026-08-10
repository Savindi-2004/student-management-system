// Degree programs shown under the Courses section, grouped by faculty.
// Each icon is a small inline SVG so no external icon library is needed.
const FACULTY_PROGRAMS = {
  computing: [
    {
      title: "BSc (Hons) in Computer Science",
      desc: "Algorithms, systems programming, and software architecture.",
      color: "#22d3ee",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>`,
    },
    {
      title: "BSc (Hons) in Software Engineering",
      desc: "Full-stack development, DevOps, and agile engineering practice.",
      color: "#22d3ee",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
    },
    {
      title: "BSc (Hons) in Data Science",
      desc: "Machine learning, big data, and statistical modelling.",
      color: "#22d3ee",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-4 4 4 5-6"/></svg>`,
    },
  ],
  engineering: [
    {
      title: "BEng (Hons) in Electronic & Telecommunication",
      desc: "Signal processing, networks, and embedded systems.",
      color: "#fbbf24",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg>`,
    },
    {
      title: "BEng (Hons) in Mechanical Engineering",
      desc: "Thermodynamics, robotics, and CAD-based design.",
      color: "#fbbf24",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    },
    {
      title: "BEng (Hons) in Civil Engineering",
      desc: "Structures, materials, and construction management.",
      color: "#fbbf24",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M4 21V9l8-6 8 6v12M9 21v-6h6v6"/></svg>`,
    },
  ],
  business: [
    {
      title: "BBA in Business Analytics",
      desc: "Data-driven business decisions, financial modeling, and market strategy.",
      color: "#34d399",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 019 9h-9V3z" fill="currentColor" stroke="none"/></svg>`,
    },
    {
      title: "BBA in Digital Marketing",
      desc: "SEO, social media strategies, brand management, and consumer psychology.",
      color: "#34d399",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11l18-7-7 18-2-8-8-2z"/></svg>`,
    },
    {
      title: "BSc in Accounting & Finance",
      desc: "Corporate finance, auditing, risk management, and fintech applications.",
      color: "#34d399",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><circle cx="8" cy="16" r="6"/></svg>`,
    },
  ],
  arts: [
    {
      title: "BA (Hons) in Mass Communication",
      desc: "Journalism, media production, and public relations.",
      color: "#f87171",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="15" height="10" rx="2"/><path d="M22 8.5l-5 3.5 5 3.5v-7z"/></svg>`,
    },
    {
      title: "BA (Hons) in Psychology",
      desc: "Human behaviour, cognition, and counselling foundations.",
      color: "#f87171",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 000 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.4a4 4 0 004-4c0-5-4.5-9.4-10-9.4z"/></svg>`,
    },
    {
      title: "BA (Hons) in English",
      desc: "Literature, linguistics, and academic writing.",
      color: "#f87171",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
    },
  ],
  science: [
    {
      title: "BSc (Hons) in Biotechnology",
      desc: "Genetics, molecular biology, and lab research methods.",
      color: "#60a5fa",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3h6M10 3v5.5L5.5 17a2 2 0 001.7 3h9.6a2 2 0 001.7-3L14 8.5V3"/></svg>`,
    },
    {
      title: "BSc (Hons) in Environmental Science",
      desc: "Sustainability, ecology, and climate research.",
      color: "#60a5fa",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C8 6 5 10.5 5 14a7 7 0 0014 0c0-3.5-3-8-7-12z"/></svg>`,
    },
    {
      title: "BSc (Hons) in Applied Mathematics",
      desc: "Statistics, modelling, and computational methods.",
      color: "#60a5fa",
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M8 8h.01M12 8h4M8 12h.01M8 16h8"/></svg>`,
    },
  ],
};

function renderPrograms(faculty) {
  const grid = document.getElementById("programsGrid");
  const programs = FACULTY_PROGRAMS[faculty] || [];
  grid.innerHTML = programs
    .map(
      (p) => `
    <div class="ep-program-card">
      <div class="ep-program-icon" style="color:${p.color}">${p.icon}</div>
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    </div>`
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".ep-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderPrograms(tab.dataset.faculty);
    });
  });

  // Default view: first tab (Computing)
  renderPrograms("computing");
});
