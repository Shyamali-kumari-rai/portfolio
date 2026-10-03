/**
 * Admin Dashboard - CRUD Controller for Skills and Certificates
 */

let currentSkills = [];
let currentCertificates = [];
let currentMessages = [];
const isDemoMode = sessionStorage.getItem("admin_demo_mode") === "true";

document.addEventListener("DOMContentLoaded", async () => {
  // Authentication Guard
  if (!isDemoMode && window.appSupabase.client && window.appSupabase.isConfigured()) {
    try {
      const { data: { session } } = await window.appSupabase.client.auth.getSession();
      if (!session) {
        window.location.href = "index.html";
        return;
      }
    } catch (e) {
      console.warn("Auth check error:", e);
    }
  }

  // Show demo banner if applicable
  if (isDemoMode || !window.appSupabase.isConfigured()) {
    document.getElementById("demo-banner").style.display = "flex";
  }

  // Bind Logout
  document.getElementById("logout-btn").addEventListener("click", async () => {
    if (window.appSupabase.client && window.appSupabase.isConfigured()) {
      await window.appSupabase.client.auth.signOut();
    }
    sessionStorage.removeItem("admin_demo_mode");
    window.location.href = "index.html";
  });

  // Tab switching
  const tabs = document.querySelectorAll(".tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const target = tab.getAttribute("data-tab");
      document.getElementById("skills-tab").style.display = target === "skills-tab" ? "block" : "none";
      document.getElementById("certificates-tab").style.display = target === "certificates-tab" ? "block" : "none";
      document.getElementById("messages-tab").style.display = target === "messages-tab" ? "block" : "none";
    });
  });

  // Settings popup
  document.getElementById("config-keys-btn").addEventListener("click", () => {
    const config = window.appSupabase.getConfig();
    if (config.url && !config.url.includes("your-project-id")) {
      document.getElementById("sb-url").value = config.url;
    }
    if (config.anonKey && !config.anonKey.includes("your-anon-key")) {
      document.getElementById("sb-key").value = config.anonKey;
    }
    toggleSettingsModal(true);
  });

  document.getElementById("supabase-config-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const url = document.getElementById("sb-url").value.trim();
    const key = document.getElementById("sb-key").value.trim();
    window.appSupabase.saveConfig(url, key);
  });

  // Load Data
  await loadSkills();
  await loadCertificates();
  await loadMessages();

  // Attach Form Submit Handlers
  document.getElementById("skill-form").addEventListener("submit", handleSaveSkill);
  document.getElementById("certificate-form").addEventListener("submit", handleSaveCertificate);
});

/* ==========================================================================
   SKILLS MANAGEMENT
   ========================================================================== */

async function loadSkills() {
  const loader = document.getElementById("skills-loader");
  const list = document.getElementById("skills-list");
  loader.style.display = "flex";
  list.style.display = "none";

  try {
    currentSkills = await window.appSupabase.getSkills();
    document.getElementById("skills-count").innerText = currentSkills.length;
    renderSkills(currentSkills);
  } catch (err) {
    console.error("Failed to load skills:", err);
  } finally {
    loader.style.display = "none";
    list.style.display = "grid";
  }
}

function renderSkills(skills) {
  const list = document.getElementById("skills-list");
  if (!skills || skills.length === 0) {
    list.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No skills added yet. Click "Add New Skill" to create one.</div>`;
    return;
  }

  list.innerHTML = skills.map(s => `
    <div class="item-card">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h4 style="font-size: 1.15rem; color: #fff;">${escapeHtml(s.title)}</h4>
          <span style="background: rgba(0, 234, 255, 0.15); color: #00eaff; padding: 3px 8px; border-radius: 6px; font-size: 0.85rem; font-weight: bold;">
            ${s.level}%
          </span>
        </div>
        <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 6px;">
          Class identifier: <code>${escapeHtml(s.icon_class || '')}</code>
        </p>
        <div style="background: rgba(255,255,255,0.1); height: 8px; border-radius: 4px; overflow: hidden; margin-top: 10px;">
          <div style="width: ${s.level}%; background: linear-gradient(90deg, #00eaff, #a855f7); height: 100%;"></div>
        </div>
      </div>
      <div class="card-actions">
        <button class="admin-btn btn-secondary btn-sm" onclick="editSkill('${s.id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="admin-btn btn-danger btn-sm" onclick="deleteSkill('${s.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

function openSkillModal(skill = null) {
  const modal = document.getElementById("skill-modal");
  const modalTitle = document.getElementById("skill-modal-title");
  
  if (skill) {
    modalTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Skill`;
    document.getElementById("skill-id").value = skill.id;
    document.getElementById("skill-title").value = skill.title;
    document.getElementById("skill-level").value = skill.level;
    document.getElementById("level-display").innerText = skill.level + "%";
    document.getElementById("skill-icon").value = skill.icon_class || '';
    document.getElementById("skill-order").value = skill.sort_order || 1;
  } else {
    modalTitle.innerHTML = `<i class="fas fa-code"></i> Add Skill`;
    document.getElementById("skill-form").reset();
    document.getElementById("skill-id").value = "";
    document.getElementById("level-display").innerText = "75%";
  }

  modal.classList.add("active");
}

function closeSkillModal() {
  document.getElementById("skill-modal").classList.remove("active");
}

window.openSkillModal = openSkillModal;
window.closeSkillModal = closeSkillModal;

window.editSkill = (id) => {
  const skill = currentSkills.find(s => String(s.id) === String(id));
  if (skill) openSkillModal(skill);
};

window.deleteSkill = async (id) => {
  if (!confirm("Are you sure you want to delete this skill?")) return;

  if (window.appSupabase.client && window.appSupabase.isConfigured() && !isDemoMode) {
    try {
      const { error } = await window.appSupabase.client
        .from('skills')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      alert("Error deleting from Supabase: " + e.message);
      return;
    }
  }

  // Update local
  currentSkills = currentSkills.filter(s => String(s.id) !== String(id));
  localStorage.setItem("local_skills", JSON.stringify(currentSkills));
  renderSkills(currentSkills);
  document.getElementById("skills-count").innerText = currentSkills.length;
};

async function handleSaveSkill(e) {
  e.preventDefault();
  const id = document.getElementById("skill-id").value;
  const title = document.getElementById("skill-title").value.trim();
  const level = parseInt(document.getElementById("skill-level").value, 10);
  const icon_class = document.getElementById("skill-icon").value.trim();
  const sort_order = parseInt(document.getElementById("skill-order").value, 10) || 1;
  const saveBtn = document.getElementById("save-skill-btn");

  saveBtn.disabled = true;
  saveBtn.innerText = "Saving...";

  const payload = {
    title,
    level,
    icon_class,
    sort_order,
    updated_at: new Date().toISOString()
  };

  if (window.appSupabase.client && window.appSupabase.isConfigured() && !isDemoMode) {
    try {
      if (id) {
        const { error } = await window.appSupabase.client.from('skills').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await window.appSupabase.client.from('skills').insert([payload]);
        if (error) throw error;
      }
    } catch (err) {
      alert("Supabase Save Error: " + err.message);
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Skill";
      return;
    }
  }

  // Sync state
  if (id) {
    const idx = currentSkills.findIndex(s => String(s.id) === String(id));
    if (idx !== -1) currentSkills[idx] = { ...currentSkills[idx], ...payload };
  } else {
    currentSkills.push({
      id: String(Date.now()),
      ...payload
    });
  }

  localStorage.setItem("local_skills", JSON.stringify(currentSkills));
  renderSkills(currentSkills);
  document.getElementById("skills-count").innerText = currentSkills.length;
  closeSkillModal();
  saveBtn.disabled = false;
  saveBtn.innerText = "Save Skill";
}

/* ==========================================================================
   CERTIFICATES MANAGEMENT
   ========================================================================== */

async function loadCertificates() {
  const loader = document.getElementById("certs-loader");
  const list = document.getElementById("certificates-list");
  loader.style.display = "flex";
  list.style.display = "none";

  try {
    currentCertificates = await window.appSupabase.getCertificates();
    document.getElementById("certs-count").innerText = currentCertificates.length;
    renderCertificates(currentCertificates);
  } catch (err) {
    console.error("Failed to load certificates:", err);
  } finally {
    loader.style.display = "none";
    list.style.display = "grid";
  }
}

function renderCertificates(certs) {
  const list = document.getElementById("certificates-list");
  if (!certs || certs.length === 0) {
    list.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No certificates added yet. Click "Add New Certificate" to create one.</div>`;
    return;
  }

  list.innerHTML = certs.map(c => `
    <div class="item-card">
      <div>
        <img src="${escapeHtml(c.image_url || 'assets/certificate1.jpeg')}" alt="${escapeHtml(c.title)}" class="cert-preview" onerror="this.src='../assets/certificate1.jpeg'">
        <h4 style="font-size: 1.15rem; color: #fff; margin-bottom: 6px;">${escapeHtml(c.title)}</h4>
        <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.4; margin-bottom: 10px;">${escapeHtml(c.description || '')}</p>
        ${c.credential_url ? `<a href="${escapeHtml(c.credential_url)}" target="_blank" style="color: #00eaff; font-size: 0.85rem; text-decoration: none;"><i class="fas fa-external-link-alt"></i> Credential Link</a>` : ''}
      </div>
      <div class="card-actions">
        <button class="admin-btn btn-secondary btn-sm" onclick="editCertificate('${c.id}')">
          <i class="fas fa-edit"></i> Edit
        </button>
        <button class="admin-btn btn-danger btn-sm" onclick="deleteCertificate('${c.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `).join('');
}

function openCertificateModal(cert = null) {
  const modal = document.getElementById("certificate-modal");
  const modalTitle = document.getElementById("cert-modal-title");

  if (cert) {
    modalTitle.innerHTML = `<i class="fas fa-edit"></i> Edit Certificate`;
    document.getElementById("cert-id").value = cert.id;
    document.getElementById("cert-title").value = cert.title;
    document.getElementById("cert-desc").value = cert.description || '';
    document.getElementById("cert-image").value = cert.image_url || '';
    document.getElementById("cert-credential").value = cert.credential_url || '';
    document.getElementById("cert-order").value = cert.sort_order || 1;
  } else {
    modalTitle.innerHTML = `<i class="fas fa-certificate"></i> Add Certificate`;
    document.getElementById("certificate-form").reset();
    document.getElementById("cert-id").value = "";
  }

  modal.classList.add("active");
}

function closeCertificateModal() {
  document.getElementById("certificate-modal").classList.remove("active");
}

window.openCertificateModal = openCertificateModal;
window.closeCertificateModal = closeCertificateModal;

window.editCertificate = (id) => {
  const cert = currentCertificates.find(c => String(c.id) === String(id));
  if (cert) openCertificateModal(cert);
};

window.deleteCertificate = async (id) => {
  if (!confirm("Are you sure you want to delete this certificate?")) return;

  if (window.appSupabase.client && window.appSupabase.isConfigured() && !isDemoMode) {
    try {
      const { error } = await window.appSupabase.client
        .from('certificates')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      alert("Error deleting certificate: " + e.message);
      return;
    }
  }

  currentCertificates = currentCertificates.filter(c => String(c.id) !== String(id));
  localStorage.setItem("local_certificates", JSON.stringify(currentCertificates));
  renderCertificates(currentCertificates);
  document.getElementById("certs-count").innerText = currentCertificates.length;
};

async function handleSaveCertificate(e) {
  e.preventDefault();
  const id = document.getElementById("cert-id").value;
  const title = document.getElementById("cert-title").value.trim();
  const description = document.getElementById("cert-desc").value.trim();
  let image_url = document.getElementById("cert-image").value.trim();
  const credential_url = document.getElementById("cert-credential").value.trim() || image_url;
  const sort_order = parseInt(document.getElementById("cert-order").value, 10) || 1;
  const fileInput = document.getElementById("cert-file-upload");
  const saveBtn = document.getElementById("save-cert-btn");

  saveBtn.disabled = true;
  saveBtn.innerText = "Saving...";

  // Handle image upload if user selected a file
  if (fileInput.files && fileInput.files[0] && window.appSupabase.client && window.appSupabase.isConfigured() && !isDemoMode) {
    try {
      const file = fileInput.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `certs/${fileName}`;

      const { data, error: uploadError } = await window.appSupabase.client.storage
        .from('certificates')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = window.appSupabase.client.storage
        .from('certificates')
        .getPublicUrl(filePath);

      if (publicUrlData && publicUrlData.publicUrl) {
        image_url = publicUrlData.publicUrl;
      }
    } catch (uploadErr) {
      console.warn("Storage upload note:", uploadErr.message);
      alert("Note on image upload: " + uploadErr.message + ". Will use specified URL path instead.");
    }
  }

  const payload = {
    title,
    description,
    image_url: image_url || 'assets/certificate1.jpeg',
    credential_url,
    sort_order,
    updated_at: new Date().toISOString()
  };

  if (window.appSupabase.client && window.appSupabase.isConfigured() && !isDemoMode) {
    try {
      if (id) {
        const { error } = await window.appSupabase.client.from('certificates').update(payload).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await window.appSupabase.client.from('certificates').insert([payload]);
        if (error) throw error;
      }
    } catch (err) {
      alert("Supabase Save Error: " + err.message);
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Certificate";
      return;
    }
  }

  if (id) {
    const idx = currentCertificates.findIndex(c => String(c.id) === String(id));
    if (idx !== -1) currentCertificates[idx] = { ...currentCertificates[idx], ...payload };
  } else {
    currentCertificates.push({
      id: String(Date.now()),
      ...payload
    });
  }

  localStorage.setItem("local_certificates", JSON.stringify(currentCertificates));
  renderCertificates(currentCertificates);
  document.getElementById("certs-count").innerText = currentCertificates.length;
  closeCertificateModal();
  saveBtn.disabled = false;
  saveBtn.innerText = "Save Certificate";
}

/* ==========================================================================
   MESSAGES MANAGEMENT
   ========================================================================== */

async function loadMessages() {
  const loader = document.getElementById("messages-loader");
  const list = document.getElementById("messages-list");
  if (!loader || !list) return;

  loader.style.display = "flex";
  list.style.display = "none";

  try {
    currentMessages = await window.appSupabase.getMessages();
    document.getElementById("messages-count").innerText = currentMessages.length;
    renderMessages(currentMessages);
  } catch (err) {
    console.error("Failed to load messages:", err);
  } finally {
    loader.style.display = "none";
    list.style.display = "grid";
  }
}

function renderMessages(messages) {
  const list = document.getElementById("messages-list");
  if (!messages || messages.length === 0) {
    list.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #94a3b8; padding: 40px;">No messages or inquiries received yet.</div>`;
    return;
  }

  list.innerHTML = messages.map(m => {
    const dateStr = m.created_at ? new Date(m.created_at).toLocaleString() : 'Recent';
    return `
      <div class="item-card" style="border-left: 4px solid #00eaff;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <h4 style="font-size: 1.15rem; color: #fff;">${escapeHtml(m.name)}</h4>
            <span style="color: #94a3b8; font-size: 0.78rem;">${dateStr}</span>
          </div>
          <p style="font-size: 0.88rem; color: #00eaff; margin-bottom: 4px;">
            <i class="fas fa-envelope"></i> <a href="mailto:${escapeHtml(m.email)}" style="color: #00eaff; text-decoration: none;">${escapeHtml(m.email)}</a>
          </p>
          <p style="font-size: 0.95rem; font-weight: 600; color: #e2e8f0; margin-top: 8px; margin-bottom: 6px;">
            ${escapeHtml(m.subject || 'No Subject')}
          </p>
          <div style="background: rgba(30, 41, 59, 0.5); padding: 12px; border-radius: 8px; font-size: 0.88rem; color: #cbd5e1; line-height: 1.5; white-space: pre-wrap;">
            ${escapeHtml(m.message)}
          </div>
        </div>
        <div class="card-actions" style="justify-content: space-between; align-items: center;">
          <a href="mailto:${escapeHtml(m.email)}?subject=Re: ${encodeURIComponent(m.subject || '')}" class="admin-btn btn-primary btn-sm">
            <i class="fas fa-reply"></i> Reply via Email
          </a>
          <button class="admin-btn btn-danger btn-sm" onclick="deleteMessage('${m.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.loadMessages = loadMessages;

window.deleteMessage = async (id) => {
  if (!confirm("Are you sure you want to delete this message?")) return;

  if (window.appSupabase.client && window.appSupabase.isConfigured() && !isDemoMode) {
    try {
      const { error } = await window.appSupabase.client
        .from('messages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (e) {
      alert("Error deleting message: " + e.message);
      return;
    }
  }

  currentMessages = currentMessages.filter(m => String(m.id) !== String(id));
  localStorage.setItem("local_messages", JSON.stringify(currentMessages));
  renderMessages(currentMessages);
  document.getElementById("messages-count").innerText = currentMessages.length;
};

function toggleSettingsModal(show) {
  const modal = document.getElementById("settings-modal");
  if (modal) {
    if (show) modal.classList.add("active");
    else modal.classList.remove("active");
  }
}
window.toggleSettingsModal = toggleSettingsModal;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
