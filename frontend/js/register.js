const API_BASE = "/api";

const registerForm = document.getElementById("registerForm");
const formMsg = document.getElementById("formMsg");
const registerBtn = document.getElementById("registerBtn");
const courseSelect = document.getElementById("course");

function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.className = `form-msg ${type}`;
}

async function loadCourseOptions() {
  try {
    const res = await fetch(`${API_BASE}/public/courses`);
    const data = await res.json();
    const courses = data.courses || [];
    courseSelect.innerHTML = courses.length
      ? `<option value="">Select your course...</option>` +
        courses.map((c) => `<option value="${c.course_name}">${c.course_name}</option>`).join("")
      : `<option value="">No courses available yet — contact admin</option>`;
  } catch (err) {
    courseSelect.innerHTML = `<option value="">Could not load courses</option>`;
  }
}
loadCourseOptions();

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  formMsg.className = "form-msg";

  const payload = {
    name: document.getElementById("name").value.trim(),
    studentRegNo: document.getElementById("studentRegNo").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    dob: document.getElementById("dob").value || null,
    contactNo: document.getElementById("contactNo").value.trim(),
    course: document.getElementById("course").value.trim(),
    address: document.getElementById("address").value.trim(),
  };

  registerBtn.disabled = true;
  registerBtn.textContent = "Creating account...";

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok) {
      showMsg(data.message || "Registration failed.", "error");
      registerBtn.disabled = false;
      registerBtn.textContent = "Create account";
      return;
    }

    showMsg("Account created! Redirecting to login...", "success");
    setTimeout(() => (window.location.href = "login.html"), 1200);
  } catch (err) {
    showMsg("Could not reach the server. Is the backend running?", "error");
    registerBtn.disabled = false;
    registerBtn.textContent = "Create account";
  }
});
