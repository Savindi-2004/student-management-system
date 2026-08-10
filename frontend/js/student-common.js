const API_BASE = "/api";

// Redirects to login if not logged in as student. Fills the sidebar
// avatar/name/reg-no block that appears on every student page.
async function requireStudentSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    const data = await res.json();
    if (!data.user || data.user.role !== "student") {
      window.location.href = "../login.html";
      return null;
    }

    const nameEls = document.querySelectorAll(".js-student-name");
    nameEls.forEach((el) => (el.textContent = data.user.name));

    const initials = data.user.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    document.querySelectorAll(".js-student-initials").forEach((el) => (el.textContent = initials));

    // Fetch the student profile record for the registration number
    const profRes = await fetch(`${API_BASE}/students/me/profile`, { credentials: "include" });
    const profData = await profRes.json();
    if (profRes.ok && profData.student) {
      document.querySelectorAll(".js-student-regno").forEach((el) => (el.textContent = profData.student.student_reg_no));
    }

    return data.user;
  } catch (err) {
    window.location.href = "../login.html";
    return null;
  }
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
