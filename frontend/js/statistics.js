//const API_URL = 'http://localhost:8080/api';

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const role = localStorage.getItem('role');

    if (role !== 'BOSS') {
        document.querySelector('.main-content').innerHTML = `
            <div style="text-align:center;padding:40px;">
                <h2>⛔ Доступ запрещён</h2>
                <p>Только руководитель (BOSS) может просматривать статистику</p>
                <a href="index.html" class="btn btn-primary">Вернуться на главную</a>
            </div>
        `;
        return;
    }

    document.getElementById('roleBadge').textContent = role;

    loadDashboard();
    loadEventPopularity();
    loadEventStats('month');
    loadUserRegistrations();

    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadEventStats(this.dataset.period);
        });
    });

    document.getElementById('periodSelect').addEventListener('change', function() {
        loadEventStats(this.value);
    });
});

// ============================================
// 1. ОБЩАЯ СВОДКА
// ============================================

async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/statistics/dashboard`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки дашборда');

        const data = await response.json();

        document.getElementById('totalUsers').textContent = data.totalUsers || 0;
        document.getElementById('totalNews').textContent = data.totalNews || 0;
        document.getElementById('totalEvents').textContent = data.totalEvents || 0;
        document.getElementById('totalApplications').textContent = data.totalApplications || 0;
        document.getElementById('totalTasks').textContent = data.totalTasks || 0;
        document.getElementById('totalQuestions').textContent = data.totalQuestions || 0;

        document.getElementById('summaryUsers').textContent = data.totalUsers || 0;
        document.getElementById('summaryNews').textContent = data.totalNews || 0;
        document.getElementById('summaryEvents').textContent = data.totalEvents || 0;
        document.getElementById('summaryPendingApps').textContent = data.pendingApplications || 0;
        document.getElementById('summaryPendingQuestions').textContent = data.pendingQuestions || 0;

    } catch (error) {
        console.error('Ошибка загрузки дашборда:', error);
    }
}

// ============================================
// 2. ПОПУЛЯРНОСТЬ МЕРОПРИЯТИЙ
// ============================================

async function loadEventPopularity() {
    const container = document.getElementById('popularityList');

    try {
        const response = await fetch(`${API_URL}/statistics/events/popularity`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки популярности');

        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:#888;">Нет данных о популярности мероприятий</p>';
            return;
        }

        const maxCount = Math.max(...data.map(item => item.participantsCount));

        container.innerHTML = data.map((item, index) => {
            const percent = maxCount ? (item.participantsCount / maxCount) * 100 : 0;
            return `
                <div class="popularity-item">
                    <span class="rank">#${index + 1}</span>
                    <span class="name">${item.eventTitle || 'Без названия'}</span>
                    <span class="count">👥 ${item.participantsCount || 0}</span>
                    <div class="bar">
                        <div class="bar-fill" style="width: ${percent}%;"></div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Ошибка загрузки популярности:', error);
        container.innerHTML = '<p style="color:#888;">❌ Ошибка загрузки данных</p>';
    }
}

// ============================================
// 3. ДИНАМИКА ЗАПИСЕЙ ПО СОБЫТИЯМ
// ============================================

async function loadEventStats(period) {
    const container = document.getElementById('eventStatsList');

    try {
        const response = await fetch(`${API_URL}/statistics/events/registrations-stats?period=${period}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки статистики событий');

        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:#888;">Нет данных о записях на события</p>';
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="stats-item">
                <span class="label">${item.eventTitle || 'Без названия'}</span>
                <span class="value">${item.registrationsCount || 0}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки статистики событий:', error);
        container.innerHTML = '<p style="color:#888;">❌ Ошибка загрузки данных</p>';
    }
}

// ============================================
// 4. НОВЫЕ ПОЛЬЗОВАТЕЛИ
// ============================================

async function loadUserRegistrations() {
    const container = document.getElementById('userRegistrationsList');

    try {
        const response = await fetch(`${API_URL}/statistics/users/registrations`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки регистраций пользователей');

        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:#888;">Нет данных о новых пользователях</p>';
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="stats-item">
                <span class="label">📅 ${item.month || 'Неизвестно'}</span>
                <span class="value">👥 ${item.newUsersCount || 0}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки регистраций пользователей:', error);
        container.innerHTML = '<p style="color:#888;">Ошибка загрузки данных</p>';
    }
}

function exportReport() {
    alert('📄 Функция экспорта отчёта в PDF будет реализована позже');
}
