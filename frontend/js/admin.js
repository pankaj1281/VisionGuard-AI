/**
 * Admin panel JavaScript
 * Handles: admin auth check, platform stats, user management, detections view
 */

const API_ADMIN = '/api/admin';

// ── Auth guard ──────────────────────────────────────────────────────────────

function checkAdminAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user || user.role !== 'admin') {
    document.getElementById('accessDenied')?.classList.remove('hidden');
    document.getElementById('adminContent')?.classList.add('hidden');
    return false;
  }
  document.getElementById('accessDenied')?.classList.add('hidden');
  document.getElementById('adminContent')?.classList.remove('hidden');
  return true;
}

// ── Platform stats ──────────────────────────────────────────────────────────

async function loadPlatformStats() {
  try {
    const res = await fetch(`${API_ADMIN}/stats`, { headers: authHeaders() });
    if (!res.ok) return;
    const { stats } = await res.json();
    document.getElementById('sTotalUsers').textContent = stats.users.total;
    document.getElementById('sActiveUsers').textContent = stats.users.active;
    document.getElementById('sBannedUsers').textContent = stats.users.banned;
    document.getElementById('sTotalDetections').textContent = stats.detections.total;
    document.getElementById('sAIDetections').textContent = stats.detections.ai;
    document.getElementById('sLast24h').textContent = stats.detections.last24h;
  } catch (err) {
    console.warn('Stats error:', err);
  }
}

// ── Users ───────────────────────────────────────────────────────────────────

function renderUserRow(user) {
  return `
    <tr data-uid="${user._id}" class="hover:bg-gray-800/30 transition-colors">
      <td class="py-3 pr-4 font-medium text-white">${user.name}</td>
      <td class="py-3 pr-4 text-gray-400">${user.email}</td>
      <td class="py-3 pr-4">
        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-brand-900/50 text-brand-300' : 'bg-gray-800 text-gray-400'}">
          ${user.role}
        </span>
      </td>
      <td class="py-3 pr-4 text-gray-400">${user.analysisCount}</td>
      <td class="py-3 pr-4">
        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${user.isBanned ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}">
          ${user.isBanned ? 'Banned' : 'Active'}
        </span>
      </td>
      <td class="py-3">
        ${user.isBanned
          ? `<button class="unban-btn text-xs text-green-400 hover:text-green-300 transition-colors" data-uid="${user._id}" data-i18n="admin.unban">Unban</button>`
          : `<button class="ban-btn text-xs text-red-400 hover:text-red-300 transition-colors" data-uid="${user._id}" data-i18n="admin.ban">Ban</button>`
        }
      </td>
    </tr>
  `;
}

async function loadUsers() {
  document.getElementById('usersLoading')?.classList.remove('hidden');
  document.getElementById('usersTableWrap')?.classList.add('hidden');
  document.getElementById('usersEmpty')?.classList.add('hidden');
  try {
    const res = await fetch(`${API_ADMIN}/users?limit=50`, { headers: authHeaders() });
    if (!res.ok) { showToast('Could not load users.', 'error'); return; }
    const { users } = await res.json();
    document.getElementById('usersLoading')?.classList.add('hidden');

    if (!users.length) {
      document.getElementById('usersEmpty')?.classList.remove('hidden');
      return;
    }
    const tbody = document.getElementById('usersBody');
    if (tbody) tbody.innerHTML = users.map(renderUserRow).join('');
    document.getElementById('usersTableWrap')?.classList.remove('hidden');

    // Attach ban/unban listeners
    document.querySelectorAll('.ban-btn').forEach(btn => btn.addEventListener('click', () => toggleBan(btn.dataset.uid, true)));
    document.querySelectorAll('.unban-btn').forEach(btn => btn.addEventListener('click', () => toggleBan(btn.dataset.uid, false)));
  } catch (err) {
    document.getElementById('usersLoading')?.classList.add('hidden');
    showToast('Failed to load users.', 'error');
  }
}

async function toggleBan(uid, ban) {
  const action = ban ? 'ban' : 'unban';
  if (!confirm(`Are you sure you want to ${action} this user?`)) return;
  try {
    const res = await fetch(`${API_ADMIN}/users/${uid}/${action}`, {
      method: 'PUT',
      headers: authHeaders()
    });
    if (!res.ok) { showToast('Action failed.', 'error'); return; }
    showToast(`User ${ban ? 'banned' : 'unbanned'} successfully.`, 'success');
    loadUsers();
    loadPlatformStats();
  } catch {
    showToast('Action failed.', 'error');
  }
}

// ── Detections ──────────────────────────────────────────────────────────────

function renderDetectionRow(det) {
  const isAI = det.result === 'AI Generated';
  const userName = det.userId ? `${det.userId.name}` : 'Anonymous';
  return `
    <tr class="hover:bg-gray-800/30 transition-colors">
      <td class="py-3 pr-4 font-medium text-white max-w-[160px] truncate">${det.fileName}</td>
      <td class="py-3 pr-4 text-gray-400 text-xs">${userName}</td>
      <td class="py-3 pr-4">
        <span class="px-2 py-0.5 rounded-full text-xs font-medium ${isAI ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}">
          ${det.result}
        </span>
      </td>
      <td class="py-3 pr-4 text-gray-400 text-xs">${det.confidence}%</td>
      <td class="py-3 text-gray-500 text-xs">${new Date(det.createdAt).toLocaleDateString()}</td>
    </tr>
  `;
}

async function loadDetections() {
  document.getElementById('detectionsLoading')?.classList.remove('hidden');
  document.getElementById('detectionsTableWrap')?.classList.add('hidden');
  document.getElementById('detectionsEmpty')?.classList.add('hidden');
  try {
    const res = await fetch(`${API_ADMIN}/detections?limit=50`, { headers: authHeaders() });
    if (!res.ok) { showToast('Could not load detections.', 'error'); return; }
    const { detections } = await res.json();
    document.getElementById('detectionsLoading')?.classList.add('hidden');

    if (!detections.length) {
      document.getElementById('detectionsEmpty')?.classList.remove('hidden');
      return;
    }
    const tbody = document.getElementById('detectionsBody');
    if (tbody) tbody.innerHTML = detections.map(renderDetectionRow).join('');
    document.getElementById('detectionsTableWrap')?.classList.remove('hidden');
  } catch (err) {
    document.getElementById('detectionsLoading')?.classList.add('hidden');
    showToast('Failed to load detections.', 'error');
  }
}

// ── Tab switching ─────────────────────────────────────────────────────────────

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;

      // Update button styles
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('text-white', 'border-brand-500');
        b.classList.add('text-gray-500', 'border-transparent');
      });
      btn.classList.add('text-white', 'border-brand-500');
      btn.classList.remove('text-gray-500', 'border-transparent');

      // Show correct panel
      document.getElementById('tabUsers')?.classList.add('hidden');
      document.getElementById('tabDetections')?.classList.add('hidden');
      document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1)}`)?.classList.remove('hidden');

      if (tab === 'detections') loadDetections();
    });
  });
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('vg_theme') || 'dark';
  if (typeof applyTheme === 'function') applyTheme(saved);
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    if (typeof toggleTheme === 'function') toggleTheme();
  });

  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (typeof clearToken === 'function') clearToken();
    window.location.href = 'index.html';
  });

  if (!checkAdminAuth()) return;

  loadPlatformStats();
  loadUsers();
  initTabs();
});
