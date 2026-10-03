/**
 * Admin Authentication Script
 */

document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("login-form");
  const authAlert = document.getElementById("auth-alert");
  const configNotice = document.getElementById("config-notice");
  const directSettingsBtn = document.getElementById("direct-settings-btn");
  const demoModeBtn = document.getElementById("demo-mode-btn");
  const configForm = document.getElementById("supabase-config-form");

  // Check Supabase Configuration status
  if (!window.appSupabase.isConfigured()) {
    configNotice.style.display = "flex";
  }

  // Check if session already exists
  if (window.appSupabase.client) {
    try {
      const { data: { session } } = await window.appSupabase.client.auth.getSession();
      if (session) {
        window.location.href = "dashboard.html";
        return;
      }
    } catch (e) {
      console.warn("Session check error:", e);
    }
  }

  // Handle Login submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loginBtn = document.getElementById("login-btn");

    authAlert.style.display = "none";
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Signing in...`;

    if (!window.appSupabase.isConfigured() || !window.appSupabase.client) {
      authAlert.className = "alert-box alert-error";
      authAlert.innerHTML = `<span><strong>Not Connected:</strong> Please configure your Supabase Project URL & Anon Key first, or use Demo Mode.</span>`;
      authAlert.style.display = "flex";
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In to Dashboard`;
      return;
    }

    try {
      const { data, error } = await window.appSupabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      // Success
      window.location.href = "dashboard.html";
    } catch (err) {
      authAlert.className = "alert-box alert-error";
      authAlert.innerHTML = `<span><i class="fas fa-exclamation-triangle"></i> ${err.message || "Failed to log in"}</span>`;
      authAlert.style.display = "flex";
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = `<i class="fas fa-sign-in-alt"></i> Sign In to Dashboard`;
    }
  });

  // Demo mode click
  if (demoModeBtn) {
    demoModeBtn.addEventListener("click", () => {
      sessionStorage.setItem("admin_demo_mode", "true");
      window.location.href = "dashboard.html";
    });
  }

  // Settings Modal Handlers
  if (directSettingsBtn) {
    directSettingsBtn.addEventListener("click", () => {
      const current = window.appSupabase.getConfig();
      if (current.url && !current.url.includes("your-project-id")) {
        document.getElementById("sb-url").value = current.url;
      }
      if (current.anonKey && !current.anonKey.includes("your-anon-key")) {
        document.getElementById("sb-key").value = current.anonKey;
      }
      toggleSettingsModal(true);
    });
  }

  if (configForm) {
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = document.getElementById("sb-url").value.trim();
      const key = document.getElementById("sb-key").value.trim();
      window.appSupabase.saveConfig(url, key);
    });
  }
});

function toggleSettingsModal(show) {
  const modal = document.getElementById("settings-modal");
  if (modal) {
    if (show) modal.classList.add("active");
    else modal.classList.remove("active");
  }
}
window.toggleSettingsModal = toggleSettingsModal;
