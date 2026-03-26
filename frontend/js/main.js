/**
 * VisionGuard AI — Main JavaScript
 * Handles: upload, drag & drop, preview, detection API call, results display,
 *          theme toggle, auth modal, JWT management
 */

const API_BASE = '/api';

// ── Utility: Toast notifications ──────────────────────────────────────────

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration ms
 */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const colors = {
    success: 'bg-green-900/90 border-green-700 text-green-300',
    error:   'bg-red-900/90 border-red-700 text-red-300',
    info:    'bg-gray-800/90 border-gray-700 text-gray-300'
  };

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto px-4 py-3 rounded-xl border text-sm font-medium shadow-xl animate-slide-up transition-all duration-300 ${colors[type] || colors.info}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ── Utility: Auth token helpers ────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('vg_token');
}
function setToken(token) {
  localStorage.setItem('vg_token', token);
}
function clearToken() {
  localStorage.removeItem('vg_token');
  localStorage.removeItem('vg_user');
}
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('vg_user'));
  } catch {
    return null;
  }
}
function setUser(user) {
  localStorage.setItem('vg_user', JSON.stringify(user));
}

// ── Utility: Auth header ────────────────────────────────────────────────────

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Theme toggle ────────────────────────────────────────────────────────────

function initTheme() {
  const saved = localStorage.getItem('vg_theme') || 'dark';
  applyTheme(saved);
}

function applyTheme(theme) {
  const html = document.documentElement;
  const body = document.getElementById('body');
  const moon = document.getElementById('moonIcon');
  const sun = document.getElementById('sunIcon');

  if (theme === 'dark') {
    html.classList.add('dark');
    if (body) {
      body.classList.remove('bg-gray-50', 'text-gray-900');
      body.classList.add('bg-gray-950', 'text-gray-100');
    }
    if (moon) moon.classList.remove('hidden');
    if (sun) sun.classList.add('hidden');
  } else {
    html.classList.remove('dark');
    if (body) {
      body.classList.remove('bg-gray-950', 'text-gray-100');
      body.classList.add('bg-gray-50', 'text-gray-900');
    }
    if (moon) moon.classList.add('hidden');
    if (sun) sun.classList.remove('hidden');
  }
  localStorage.setItem('vg_theme', theme);
}

function toggleTheme() {
  const current = localStorage.getItem('vg_theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ── Nav auth state ──────────────────────────────────────────────────────────

function updateNavAuth() {
  const user = getUser();
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  const userNameEl = document.getElementById('userName');

  if (user && getToken()) {
    if (authButtons) authButtons.classList.add('hidden');
    if (userMenu) { userMenu.classList.remove('hidden'); userMenu.classList.add('flex'); }
    if (userNameEl) userNameEl.textContent = user.name;
  } else {
    if (authButtons) authButtons.classList.remove('hidden');
    if (userMenu) { userMenu.classList.add('hidden'); userMenu.classList.remove('flex'); }
  }
}

// ── File validation (client-side) ──────────────────────────────────────────

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    showToast(t('toast.invalidType'), 'error');
    return false;
  }
  if (file.size > MAX_SIZE_BYTES) {
    showToast(t('toast.fileTooLarge'), 'error');
    return false;
  }
  return true;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

// ── Upload UI state ─────────────────────────────────────────────────────────

let selectedFile = null;

function setSelectedFile(file) {
  selectedFile = file;
  const section = document.getElementById('previewSection');
  const img = document.getElementById('previewImg');
  const nameEl = document.getElementById('fileName');
  const sizeEl = document.getElementById('fileSize');
  const btn = document.getElementById('analyseBtn');

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => { if (img) img.src = e.target.result; };
    reader.readAsDataURL(file);

    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = formatBytes(file.size);
    if (section) section.classList.remove('hidden');
    if (btn) { btn.disabled = false; btn.classList.remove('disabled:bg-gray-800', 'disabled:text-gray-600'); }
  } else {
    if (section) section.classList.add('hidden');
    if (img) img.src = '';
    if (btn) btn.disabled = true;
  }
}

function clearSelectedFile() {
  selectedFile = null;
  setSelectedFile(null);
  const fileInput = document.getElementById('fileInput');
  if (fileInput) fileInput.value = '';
}

// ── Show / hide cards ───────────────────────────────────────────────────────

function showUploadCard() {
  document.getElementById('uploadCard')?.classList.remove('hidden');
  document.getElementById('loadingCard')?.classList.add('hidden');
  document.getElementById('resultCard')?.classList.add('hidden');
}

function showLoadingCard() {
  document.getElementById('uploadCard')?.classList.add('hidden');
  document.getElementById('loadingCard')?.classList.remove('hidden');
  document.getElementById('resultCard')?.classList.add('hidden');
}

function showResultCard(data) {
  document.getElementById('uploadCard')?.classList.add('hidden');
  document.getElementById('loadingCard')?.classList.add('hidden');

  const card = document.getElementById('resultCard');
  card?.classList.remove('hidden');

  // Result badge
  const badge = document.getElementById('resultBadge');
  const isAI = data.result === 'AI Generated';
  badge.textContent = isAI ? t('result.aiLabel') : t('result.realLabel');
  badge.className = `inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
    isAI
      ? 'bg-red-900/50 text-red-300 border border-red-700'
      : 'bg-green-900/50 text-green-300 border border-green-700'
  }`;

  // Confidence bar
  const confidenceEl = document.getElementById('confidenceValue');
  const bar = document.getElementById('confidenceBar');
  if (confidenceEl) confidenceEl.textContent = `${data.confidence}%`;
  if (bar) {
    setTimeout(() => {
      bar.style.width = `${data.confidence}%`;
      bar.className = `h-full rounded-full transition-all duration-1000 ease-out ${isAI ? 'bg-red-500' : 'bg-green-500'}`;
    }, 50);
  }

  // Score values
  const aiScoreEl = document.getElementById('aiScoreValue');
  const realScoreEl = document.getElementById('realScoreValue');
  if (aiScoreEl) aiScoreEl.textContent = `${(data.aiScore * 100).toFixed(1)}%`;
  if (realScoreEl) realScoreEl.textContent = `${(data.realScore * 100).toFixed(1)}%`;

  // Signals
  const signalsSection = document.getElementById('signalsSection');
  const signalsList = document.getElementById('signalsList');
  if (data.signals && data.signals.length > 0) {
    signalsSection?.classList.remove('hidden');
    if (signalsList) {
      signalsList.innerHTML = data.signals.map(signal => `
        <li class="flex items-start gap-2 text-sm text-gray-400">
          <svg class="w-4 h-4 mt-0.5 flex-shrink-0 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          ${signal}
        </li>
      `).join('');
    }
  } else {
    signalsSection?.classList.add('hidden');
  }
}

// ── Detection API call ──────────────────────────────────────────────────────

async function analyseImage() {
  if (!selectedFile) return;

  showLoadingCard();

  try {
    const formData = new FormData();
    formData.append('image', selectedFile);

    const response = await fetch(`${API_BASE}/detect`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      showUploadCard();
      showToast(data.error || t('toast.uploadError'), 'error');
      return;
    }

    showResultCard(data);
    showToast(t('toast.uploadSuccess'), 'success');
  } catch (err) {
    console.error('Analysis error:', err);
    showUploadCard();
    showToast(t('toast.uploadError'), 'error');
  }
}

// ── Auth API helpers ────────────────────────────────────────────────────────

async function doLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

async function doRegister(name, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

// ── Auth modal ──────────────────────────────────────────────────────────────

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  showAuthMode(mode);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function showAuthMode(mode) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const title = document.getElementById('modalTitle');
  if (mode === 'login') {
    loginForm?.classList.remove('hidden');
    registerForm?.classList.add('hidden');
    if (title) title.textContent = t('auth.loginTitle');
  } else {
    loginForm?.classList.add('hidden');
    registerForm?.classList.remove('hidden');
    if (title) title.textContent = t('auth.registerTitle');
  }
}

// ── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateNavAuth();

  // Theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    clearToken();
    updateNavAuth();
    showToast(t('toast.logoutSuccess'), 'info');
  });

  // Login / Sign up nav buttons — open modal
  document.getElementById('loginBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('login');
  });
  document.getElementById('signupBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    openAuthModal('register');
  });

  // Modal close
  document.getElementById('closeModal')?.addEventListener('click', closeAuthModal);
  document.getElementById('authModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('authModal')) closeAuthModal();
  });

  // Switch between login / register
  document.getElementById('switchToRegister')?.addEventListener('click', () => showAuthMode('register'));
  document.getElementById('switchToLogin')?.addEventListener('click', () => showAuthMode('login'));

  // Login form submit
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    try {
      const data = await doLogin(email, password);
      setToken(data.token);
      setUser(data.user);
      closeAuthModal();
      updateNavAuth();
      showToast(t('toast.loginSuccess'), 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Register form submit
  document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    try {
      const data = await doRegister(name, email, password);
      setToken(data.token);
      setUser(data.user);
      closeAuthModal();
      updateNavAuth();
      showToast(t('toast.registerSuccess'), 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Drop zone
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-brand-500', 'bg-brand-900/10');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('border-brand-500', 'bg-brand-900/10');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-brand-500', 'bg-brand-900/10');
      const file = e.dataTransfer.files[0];
      if (file && validateFile(file)) setSelectedFile(file);
    });
    dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') fileInput?.click();
    });
  }

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file && validateFile(file)) setSelectedFile(file);
    else fileInput.value = '';
  });

  // Remove file
  document.getElementById('removeFile')?.addEventListener('click', clearSelectedFile);

  // Analyse button
  document.getElementById('analyseBtn')?.addEventListener('click', analyseImage);

  // New analysis
  document.getElementById('newAnalysisBtn')?.addEventListener('click', () => {
    clearSelectedFile();
    showUploadCard();
  });
});
