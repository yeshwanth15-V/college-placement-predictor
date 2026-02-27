/* ============================================================
   APP.JS — Shared Utilities, Session, Navigation, Toast
   ============================================================ */

// ── Session Management ──
const Session = {
    set(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    get(key) {
        const val = sessionStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    },
    remove(key) {
        sessionStorage.removeItem(key);
    },
    clear() {
        sessionStorage.clear();
    }
};

// ── Local Storage Helpers ──
const Store = {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    get(key) {
        const val = localStorage.getItem(key);
        return val ? JSON.parse(val) : null;
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};

// ── Toast Notifications ──
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.4s var(--ease-out) forwards';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

// ── Login Form Toggle ──
function showLoginForm(role) {
    const preview = document.getElementById(`${role}Preview`);
    const form = document.getElementById(`${role}LoginForm`);
    if (preview) preview.classList.add('hidden');
    if (form) form.classList.add('active');
}

function hideLoginForm(role) {
    const preview = document.getElementById(`${role}Preview`);
    const form = document.getElementById(`${role}LoginForm`);
    if (preview) preview.classList.remove('hidden');
    if (form) form.classList.remove('active');
}

// ── Login Handlers ──
function handleAdminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (!username || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
    }

    // Simple credential check (demo)
    if (username === 'admin' && password === 'admin123') {
        Session.set('userRole', 'admin');
        Session.set('adminUser', { username, loggedInAt: new Date().toISOString() });
        showToast('Welcome, Admin!', 'success');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 600);
    } else {
        showToast('Invalid admin credentials', 'error');
        shakeElement(document.getElementById('adminLoginBtn'));
    }
}

function handleStudentLogin() {
    const roll = document.getElementById('studentRoll').value.trim();
    const password = document.getElementById('studentPassword').value.trim();

    if (!roll || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
    }

    // Simple credential check (demo)
    if (password === 'student123') {
        Session.set('userRole', 'student');
        Session.set('studentUser', { roll, loggedInAt: new Date().toISOString() });
        showToast('Welcome, Student!', 'success');
        setTimeout(() => {
            window.location.href = 'student-upload.html';
        }, 600);
    } else {
        showToast('Invalid student credentials', 'error');
        shakeElement(document.getElementById('studentLoginBtn'));
    }
}

function handleLogout() {
    Session.clear();
    showToast('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 500);
}

// ── Auth Guard ──
function requireAuth(role) {
    const currentRole = Session.get('userRole');
    if (currentRole !== role) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// ── UI Helpers ──
function shakeElement(el) {
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; // trigger reflow
    el.style.animation = 'shake 0.5s ease';
    setTimeout(() => { el.style.animation = ''; }, 500);
}

// Add shake keyframe dynamically
(function () {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px); }
      40% { transform: translateX(8px); }
      60% { transform: translateX(-6px); }
      80% { transform: translateX(6px); }
    }
  `;
    document.head.appendChild(style);
})();

// ── Enter key support for login ──
document.addEventListener('DOMContentLoaded', () => {
    // Admin login enter key
    const adminPassword = document.getElementById('adminPassword');
    if (adminPassword) {
        adminPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAdminLogin();
        });
    }

    // Student login enter key
    const studentPassword = document.getElementById('studentPassword');
    if (studentPassword) {
        studentPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleStudentLogin();
        });
    }
});
