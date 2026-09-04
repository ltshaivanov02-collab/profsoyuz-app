const API_URL = 'http://localhost:8080/api';

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {

    // === ВХОД ===
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // === ВЫХОД ===
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // === ПРОВЕРКА АВТОРИЗАЦИИ ===
    checkAuth();

    // === ПОКАЗ НАВИГАЦИИ ПО РОЛИ ===
    showNavigationByRole();
});

// ============================================
// ВХОД
// ============================================

async function handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const error = document.getElementById('loginError');

    if (!username || !password) {
        error.textContent = 'Заполните все поля';
        error.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem('token', data.token);

            const userResponse = await fetch(`${API_URL}/users/profile`, {
                headers: { 'Authorization': `Bearer ${data.token}` }
            });

            if (userResponse.ok) {
                const user = await userResponse.json();
                localStorage.setItem('role', user.role);
                localStorage.setItem('username', user.username);
                localStorage.setItem('fullName', user.fullName);
            }

            window.location.href = 'index.html';
        } else {
            error.textContent = data.message || 'Неверный логин или пароль';
            error.style.display = 'block';
        }

    } catch (err) {
        error.textContent = 'Ошибка подключения к серверу';
        error.style.display = 'block';
    }
}

// ============================================
// ВЫХОД
// ============================================

function handleLogout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// ============================================
// ПРОВЕРКА АВТОРИЗАЦИИ
// ============================================

function checkAuth() {
    const token = localStorage.getItem('token');
    const page = window.location.pathname.split('/').pop();

    if (page === 'login.html' && token) {
        window.location.href = 'index.html';
        return;
    }

    const protectedPages = ['index.html', 'events.html', 'profile.html', 'admin.html', 'statistics.html', 'communication.html'];
    if (protectedPages.includes(page) && !token) {
        window.location.href = 'login.html';
    }
}

// ============================================
// ПОКАЗ / СКРЫТИЕ ССЫЛОК ПО РОЛИ
// ============================================

function showNavigationByRole() {
    const role = localStorage.getItem('role');
    const navAdmin = document.getElementById('navAdmin');
    const navStatistics = document.getElementById('navStatistics');

    if (navAdmin) {
        navAdmin.style.display = (role === 'ADMIN' || role === 'BOSS') ? 'block' : 'none';
    }

    if (navStatistics) {
        navStatistics.style.display = (role === 'BOSS') ? 'block' : 'none';
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ
// ============================================

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}
