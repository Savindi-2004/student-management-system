const API_BASE = "/api";

const loginForm = document.getElementById("loginForm");
const formMsg = document.getElementById("formMsg");
const loginBtn = document.getElementById("loginBtn");

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = `form-msg ${type}`;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.className = "form-msg";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  loginBtn.disabled = true;
  loginBtn.textContent = "Logging in...";

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.message || "Login failed.", "error");
      loginBtn.disabled = false;
      loginBtn.textContent = "Log in";
      return;
    }

    // Redirect based on role
    if (data.user.role === "admin") {
      window.location.href = "admin/admin-dashboard.html";
    } else {
      window.location.href = "student/student-dashboard.html";
    }
  } catch (err) {
    showMsg("Could not reach the server. Is the backend running?", "error");
    loginBtn.disabled = false;
    loginBtn.textContent = "Log in";
  }
});
