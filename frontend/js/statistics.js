//const API_URL = 'http://localhost:8080/api';

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

let allUsersCache = [];
let allEventsCache = [];
let allApplicationsCache = [];
let allTasksCache = [];

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardStats();
});

// ============================================
// ЗАГРУЗКА ОБЩЕЙ СТАТИСТИКИ
// ============================================

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/statistics/dashboard`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const data = await response.json();

        // Карточки
        document.getElementById('statUsersCount').textContent = data.totalUsers || 0;
        document.getElementById('statEventsCount').textContent = data.totalEvents || 0;
        document.getElementById('statApplicationsCount').textContent = data.totalApplications || 0;
        document.getElementById('statTasksCount').textContent = data.totalTasks || 0;

        // Сайдбар
        document.getElementById('statApprovedApps').textContent = data.approvedApplications || 0;
        document.getElementById('statRejectedApps').textContent = data.rejectedApplications || 0;
        document.getElementById('statActiveTasks').textContent = data.activeTasks || 0;

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ============================================
// 1. ПОЛЬЗОВАТЕЛИ
// ============================================

async function openUsersStats() {
    Modal.open('usersStatsModal');

    const container = document.getElementById('usersStatsList');
    container.innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        allUsersCache = await response.json();
        renderUsersStats('all');

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;">Ошибка загрузки</p>';
    }
}

function filterUsers(filter, btn) {
    // Переключение активного таба
    document.querySelectorAll('#usersStatsModal .stats-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    renderUsersStats(filter);
}

function renderUsersStats(filter) {
    const container = document.getElementById('usersStatsList');

    let users = allUsersCache;

    if (filter === 'new') {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        users = users.filter(u => {
            const created = new Date(u.createdAt);
            return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
        });
    }

    if (users.length === 0) {
        container.innerHTML = '<p class="stats-empty">Пользователей нет</p>';
        return;
    }

    container.innerHTML = users.map(user => `
        <div class="stats-item">
            <div class="item-info">
                <div class="item-title">${user.fullName || user.username}</div>
                <div class="item-sub">
                    <span>${user.username}</span>
                    <span>${user.email || '—'}</span>
                    <span class="badge badge-${user.role?.toLowerCase() || 'user'}">${user.role || 'USER'}</span>
                </div>
            </div>
            <div class="item-sub">
                <span>${new Date(user.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
        </div>
    `).join('');
}

// ============================================
// 2. СОБЫТИЯ
// ============================================

async function openEventsStats() {
    Modal.open('eventsStatsModal');

    const container = document.getElementById('eventsStatsList');
    container.innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/events`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        allEventsCache = await response.json();
        renderEventsStats('all');

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;">Ошибка загрузки</p>';
    }
}

function filterEvents(filter, btn) {
    document.querySelectorAll('#eventsStatsModal .stats-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    renderEventsStats(filter);
}

function renderEventsStats(filter) {
    const container = document.getElementById('eventsStatsList');
    let events = [...allEventsCache];

    if (filter === 'popular') {
        // Топ 5 за текущий месяц
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        events = events
            .filter(e => {
                const d = new Date(e.dateTime);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0))
            .slice(0, 5);
    } else if (filter === 'liked') {
        // Топ 5 за текущий месяц по лайкам
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        events = events
            .filter(e => {
                const d = new Date(e.dateTime);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
            .slice(0, 5);
    }

    if (events.length === 0) {
        container.innerHTML = '<p class="stats-empty">Событий нет</p>';
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="stats-item">
            <div class="item-info">
                <div class="item-title">${event.title}</div>
                <div class="item-sub">
                    <span>${new Date(event.dateTime).toLocaleString('ru-RU')}</span>
                    <span>${event.location || '—'}</span>
                    <span>Участников: ${event.registeredCount || 0}/${event.maxParticipants || 0}</span>
                    <span>Лайков: ${event.likesCount || 0}</span>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-info" onclick="openEventParticipants(${event.id}, '${event.title.replace(/'/g, "\\'")}')">
                    Участники
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// УЧАСТНИКИ СОБЫТИЯ
// ============================================

async function openEventParticipants(eventId, eventTitle) {
    Modal.open('eventParticipantsModal');

    document.getElementById('eventParticipantsTitle').textContent = 'Участники: ' + eventTitle;

    const container = document.getElementById('eventParticipantsList');
    container.innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/events/${eventId}/participants`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const participants = await response.json();

        if (!participants || participants.length === 0) {
            container.innerHTML = '<p class="stats-empty">Участников нет</p>';
            return;
        }

        container.innerHTML = participants.map((p, index) => `
            <div class="stats-item">
                <div class="item-info">
                    <div class="item-title">${index + 1}. ${p.userName || 'Неизвестно'}</div>
                    <div class="item-sub">
                        <span>${p.userEmail || '—'}</span>
                        <span>Членов: ${p.membersCount || 0}</span>
                        <span>Родственников: ${p.relativesCount || 0}</span>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;">Ошибка загрузки</p>';
    }
}

// ============================================
// 3. ЗАЯВЛЕНИЯ
// ============================================

async function openApplicationsStats() {
    Modal.open('applicationsStatsModal');

    try {
        const response = await fetch(`${API_URL}/applications`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        allApplicationsCache = await response.json();

        const total = allApplicationsCache.length;
        const approved = allApplicationsCache.filter(a => a.status === 'APPROVED').length;
        const rejected = allApplicationsCache.filter(a => a.status === 'REJECTED').length;
        const pending = allApplicationsCache.filter(a => a.status === 'PENDING').length;

        document.getElementById('appsTotal').textContent = total;
        document.getElementById('appsApproved').textContent = approved;
        document.getElementById('appsRejected').textContent = rejected;
        document.getElementById('appsPending').textContent = pending;

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ============================================
// 4. ЗАДАЧИ
// ============================================

async function openTasksStats() {
    Modal.open('tasksStatsModal');

    const container = document.getElementById('tasksStatsList');
    container.innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/admin/tasks`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        allTasksCache = await response.json();

        if (!allTasksCache || allTasksCache.length === 0) {
            container.innerHTML = '<p class="stats-empty">Задач нет</p>';
            return;
        }

        container.innerHTML = allTasksCache.map(task => {
            const statusMap = {
                'PENDING': { text: 'Ожидает', class: 'pending' },
                'IN_PROGRESS': { text: 'В работе', class: 'in_progress' },
                'COMPLETED': { text: 'Выполнено', class: 'completed' }
            };
            const status = statusMap[task.status] || statusMap['PENDING'];

            return `
                <div class="stats-item">
                    <div class="item-info">
                        <div class="item-title">${task.title}</div>
                        <div class="item-sub">
                            <span class="badge badge-${status.class}">${status.text}</span>
                            <span>Ответственный: ${task.assignedToName || 'Не назначен'}</span>
                            <span>${new Date(task.createdAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;">Ошибка загрузки</p>';
    }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}
