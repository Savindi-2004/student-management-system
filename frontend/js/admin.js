const API_BASE = "/api";

// Redirects to login if not logged in as admin. Also fills in the sidebar name.
async function requireAdminSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    const data = await res.json();

    if (!data.user || data.user.role !== "admin") {
      window.location.href = "../login.html";
      return;
    }

    const nameEls = document.querySelectorAll("#adminName");
    nameEls.forEach((el) => (el.textContent = data.user.name));

    const welcomeEl = document.getElementById("welcomeName");
    if (welcomeEl) welcomeEl.textContent = `, ${data.user.name.split(" ")[0]}`;
  } catch (err) {
    window.location.href = "../login.html";
  }
}

async function fetchStudents() {
  const res = await fetch(`${API_BASE}/students`, { credentials: "include" });
  if (!res.ok) throw new Error("Could not load students.");
  const data = await res.json();
  return data.students;
}

async function createStudentRequest(payload) {
  const res = await fetch(`${API_BASE}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Could not create student.");
  return data;
}

async function updateStudentRequest(id, payload) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Could not update student.");
  return data;
}

async function deleteStudentRequest(id) {
  const res = await fetch(`${API_BASE}/students/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Could not delete student.");
  return data;
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await fetch(`${API_BASE}/auth/logout`, { method: "POST", credentials: "include" });
      window.location.href = "../login.html";
    });
  }
});
