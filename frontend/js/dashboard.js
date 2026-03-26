/**
 * Dashboard page JavaScript
 * Handles: auth check, stats, history table, filters, delete, pagination
 */

const API_BASE_DASH = '/api';
let currentPage = 1;
let currentFilter = '';
let hasMore = false;

// ── Auth guard ──────────────────────────────────────────────────────────────

function checkDashAuth() {
  const token = getToken();
  const user = getUser();
  if (!token || !user) {
    document.getElementById('authGate')?.classList.remove('hidden');
    document.getElementById('dashContent')?.classList.add('hidden');
    return false;
  }
  document.getElementById('authGate')?.classList.add('hidden');
  document.getElementById('dashContent')?.classList.remove('hidden');

  // Populate welcome
  const welcomeEl = document.getElementById('welcomeName');
  const greetEl = document.getElementById('userGreet');
  if (welcomeEl) welcomeEl.textContent = user.name;
  if (greetEl) { greetEl.textContent = user.name; greetEl.classList.remove('hidden'); }

  // Show admin link if admin
  if (user.role === 'admin') {
    document.getElementById('adminLinkWrap')?.classList.remove('hidden');
  }

  return true;
}

// ── Stats ───────────────────────────────────────────────────────────────────

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_DASH}/dashboard/stats`, {
      headers: { ...authHeaders(), 'Content-Type': 'application/json' }
    });
    if (!res.ok) return;
    const { stats } = await res.json();
    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statAI').textContent = stats.aiCount;
    document.getElementById('statReal').textContent = stats.realCount;
    document.getElementById('statAvg').textContent = stats.avgConfidence ? `${stats.avgConfidence}%` : '—';
  } catch (err) {
    console.warn('Stats load error:', err);
  }
}

// ── History ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function renderHistoryRow(det) {
  const isAI = det.result === 'AI Generated';
  return `
    <tr data-id="${det._id}" class="hover:bg-gray-800/30 transition-colors">
      <td class="py-3 pr-4 font-medium text-white max-w-[180px] truncate">${det.fileName}</td>
      <td class="py-3 pr-4">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isAI ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}">
          ${det.result}
        </span>
      </td>
      <td class="py-3 pr-4">
        <div class="flex items-center gap-2">
          <div class="w-20 bg-gray-800 rounded-full h-1.5">
            <div class="h-1.5 rounded-full ${isAI ? 'bg-red-500' : 'bg-green-500'}" style="width:${det.confidence}%"></div>
          </div>
          <span class="text-xs text-gray-400">${det.confidence}%</span>
        </div>
      </td>
      <td class="py-3 pr-4 text-gray-500 text-xs">${formatDate(det.createdAt)}</td>
      <td class="py-3">
        <button class="delete-btn text-xs text-red-400 hover:text-red-300 transition-colors" data-id="${det._id}" data-i18n="dash.delete">Delete</button>
      </td>
    </tr>
  `;
}

async function loadHistory(reset = false) {
  if (reset) {
    currentPage = 1;
    document.getElementById('historyBody').innerHTML = '';
  }

  document.getElementById('historyLoading')?.classList.remove('hidden');
  document.getElementById('historyTable')?.classList.add('hidden');
  document.getElementById('historyEmpty')?.classList.add('hidden');
  document.getElementById('loadMoreWrap')?.classList.add('hidden');

  try {
    const params = new URLSearchParams({ page: currentPage, limit: 10 });
    if (currentFilter) params.set('filter', currentFilter);

    const res = await fetch(`${API_BASE_DASH}/dashboard/history?${params}`, {
      headers: authHeaders()
    });

    if (!res.ok) {
      showToast('Could not load history.', 'error');
      return;
    }

    const { detections, pagination } = await res.json();

    document.getElementById('historyLoading')?.classList.add('hidden');

    if (detections.length === 0 && currentPage === 1) {
      document.getElementById('historyEmpty')?.classList.remove('hidden');
      return;
    }

    document.getElementById('historyTable')?.classList.remove('hidden');
    const tbody = document.getElementById('historyBody');
    if (tbody) {
      detections.forEach(det => {
        tbody.insertAdjacentHTML('beforeend', renderHistoryRow(det));
      });
    }

    hasMore = pagination.page < pagination.pages;
    if (hasMore) {
      document.getElementById('loadMoreWrap')?.classList.remove('hidden');
    }

    // Attach delete listeners
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteDetection(btn.dataset.id));
    });
  } catch (err) {
    document.getElementById('historyLoading')?.classList.add('hidden');
    console.error('History load error:', err);
    showToast('Failed to load history.', 'error');
  }
}

async function deleteDetection(id) {
  if (!confirm('Delete this detection record?')) return;
  try {
    const res = await fetch(`${API_BASE_DASH}/dashboard/history/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    if (!res.ok) {
      const data = await res.json();
      showToast(data.error || 'Delete failed.', 'error');
      return;
    }
    // Remove row from DOM
    document.querySelector(`tr[data-id="${id}"]`)?.remove();
    showToast('Record deleted.', 'success');
    // Reload stats
    loadStats();
    // If tbody is now empty, show empty state
    if (!document.getElementById('historyBody')?.querySelector('tr')) {
      document.getElementById('historyTable')?.classList.add('hidden');
      document.getElementById('historyEmpty')?.classList.remove('hidden');
    }
  } catch (err) {
    showToast('Delete failed.', 'error');
  }
}

// ── Filter buttons ───────────────────────────────────────────────────────────

function initFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active-filter', 'bg-brand-700/30', 'text-brand-400', 'border-brand-700');
        b.classList.add('border-gray-700', 'text-gray-400');
      });
      btn.classList.add('active-filter', 'bg-brand-700/30', 'text-brand-400', 'border-brand-700');
      btn.classList.remove('border-gray-700', 'text-gray-400');
      loadHistory(true);
    });
  });
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Theme
  const saved = localStorage.getItem('vg_theme') || 'dark';
  if (typeof applyTheme === 'function') applyTheme(saved);
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    if (typeof toggleTheme === 'function') toggleTheme();
  });

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (typeof clearToken === 'function') clearToken();
    showToast(t('toast.logoutSuccess'), 'info');
    setTimeout(() => { window.location.href = 'index.html'; }, 1000);
  });

  if (!checkDashAuth()) return;

  loadStats();
  loadHistory(true);
  initFilters();

  // Load more
  document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
    currentPage += 1;
    loadHistory(false);
  });
});
