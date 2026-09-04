// ============================================
// API URL
// ============================================

//const API_URL = 'http://localhost:8080/api';

// ============================================
// РЕНДЕРИНГ КАРТОЧЕК (АВТОМАТИЗАЦИЯ)
// ============================================

const AdminRenderer = {
    // Базовый шаблон карточки
    card: (content, actions = '') => `
        <div class="admin-card">
            <div class="info">${content}</div>
            ${actions ? `<div class="actions">${actions}</div>` : ''}
        </div>
    `,

    // Рендер новости
    news: (item) => AdminRenderer.card(
        `
            <strong>${item.title}</strong>
            <div class="sub">
                <span>👤 ${item.authorName || 'Unknown'}</span>
                <span>📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                <span>👍 ${item.likesCount || 0}</span>
            </div>
        `,
        `<button onclick="adminDeleteNews(${item.id})" class="btn btn-sm btn-danger">🗑️</button>`
    ),

    // Рендер события
    events: (item) => AdminRenderer.card(
        `
            <strong>${item.title}</strong>
            <div class="sub">
                <span>📅 ${new Date(item.dateTime).toLocaleDateString('ru-RU')}</span>
                <span>🕐 ${new Date(item.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>👥 ${item.registeredCount || 0} / ${item.maxParticipants || 0}</span>
            </div>
        `,
        `
            <button onclick="viewEvent(${item.id})" class="btn btn-sm btn-info">👁️</button>
            <button onclick="adminDeleteEvent(${item.id})" class="btn btn-sm btn-danger">🗑️</button>
        `
    ),

    // Рендер заявки
    application: (item) => AdminRenderer.card(
        `
            <strong>${item.text}</strong>
            <div class="sub">
                <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">${item.status || 'PENDING'}</span>
                <span>👤 ${item.userName || 'Unknown'}</span>
                <span>📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
            ${item.adminResponse ? `<div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">📝 ${item.adminResponse}</div>` : ''}
        `,
        item.status === 'PENDING' ? `
            <button onclick="openApplicationModal(${item.id}, '${item.text.replace(/'/g, "\\'")}', '${item.userName || 'Неизвестно'}')" class="btn btn-sm btn-primary">✏️ Обработать</button>
        ` : ''
    ),

    // Рендер вопроса
    question: (item) => AdminRenderer.card(
        `
            <strong>${item.text}</strong>
            <div class="sub">
                <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">${item.status || 'PENDING'}</span>
                <span>👤 ${item.userName || 'Unknown'}</span>
                <span>📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
            ${item.adminAnswer ? `<div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">💬 ${item.adminAnswer}</div>` : ''}
        `,
        item.status === 'PENDING' ? `
            <button onclick="adminAnswerQuestion(${item.id})" class="btn btn-sm btn-primary">💬 Ответить</button>
        ` : ''
    ),

    // Рендер пользователя
    user: (item) => AdminRenderer.card(
        `
            <strong>${item.username}</strong>
            <div class="sub">
                <span>${item.fullName || 'Без имени'}</span>
                <span class="badge badge-${item.role?.toLowerCase() || 'user'}">${item.role || 'USER'}</span>
                <span>📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
        `,
        `<button onclick="adminDeleteUser(${item.id})" class="btn btn-sm btn-danger">🗑️</button>`
    ),

    // Рендер задачи
    task: (item) => AdminRenderer.card(
        `
            <strong>${item.title}</strong>
            <div class="sub">
                <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">${item.status || 'PENDING'}</span>
                <span>👤 ${item.assignedToName || 'Не назначен'}</span>
                <span>📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
        `,
        `
            <button onclick="adminUpdateTaskStatus(${item.id}, 'IN_PROGRESS')" class="btn btn-sm btn-primary">▶️</button>
            <button onclick="adminUpdateTaskStatus(${item.id}, 'COMPLETED')" class="btn btn-sm btn-success">✅</button>
            <button onclick="adminDeleteTask(${item.id})" class="btn btn-sm btn-danger">🗑️</button>
        `
    )
};

// ============================================
// ОБЩАЯ ФУНКЦИЯ ЗАГРУЗКИ ДАННЫХ
// ============================================

async function loadData(url, containerId, renderer, emptyMessage = 'Нет данных') {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}${url}`, { headers: getHeaders() });
        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            return;
        }

        container.innerHTML = data.map(renderer).join('');
    } catch (error) {
        console.error(`Ошибка загрузки ${containerId}:`, error);
        container.innerHTML = `<div class="empty-state">⚠️ Ошибка загрузки данных</div>`;
    }
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            const target = document.getElementById('tab-' + this.dataset.tab);
            if (target) target.classList.add('active');

            loadTabData(this.dataset.tab);
        });
    });

    loadTabData('news');
    updateStats();
});

function loadTabData(tabId) {
    switch (tabId) {
        case 'news': adminLoadNews(); break;
        case 'events': adminLoadEvents(); break;
        case 'applications': adminLoadApplications(); break;
        case 'questions': adminLoadQuestions(); break;
        case 'users': adminLoadUsers(); break;
        case 'tasks': adminLoadTasks(); break;
    }
}

// ============================================
// НОВОСТИ (автоматизировано)
// ============================================

async function adminLoadNews() {
    await loadData('/news', 'adminNewsList', AdminRenderer.news, 'Новостей нет');
}

function adminCreateNews() {
    Modal.open('newsModal');
}

async function adminDeleteNews(id) {
    if (!confirm('Удалить эту новость?')) return;
    await fetch(`${API_URL}/news/${id}`, { method: 'DELETE', headers: getHeaders() });
    adminLoadNews();
    updateStats();
}

// ============================================
// СОБЫТИЯ (автоматизировано)
// ============================================

async function adminLoadEvents() {
    await loadData('/events', 'adminEventsList', AdminRenderer.events, 'Событий нет');
}

function adminCreateEvent() {
    Modal.open('eventModal');
}

async function adminDeleteEvent(id) {
    if (!confirm('Удалить это событие?')) return;
    await fetch(`${API_URL}/events/${id}`, { method: 'DELETE', headers: getHeaders() });
    adminLoadEvents();
    updateStats();
}

// ============================================
// ЗАЯВКИ (автоматизировано)
// ============================================

async function adminLoadApplications() {
    await loadData('/applications', 'adminApplicationsList', AdminRenderer.application, 'Заявок нет');
}

// ============================================
// ВОПРОСЫ (автоматизировано)
// ============================================

async function adminLoadQuestions() {
    await loadData('/questions', 'adminQuestionsList', AdminRenderer.question, 'Вопросов нет');
}

async function adminAnswerQuestion(id) {
    const answer = prompt('Введите ответ:');
    if (!answer) return;

    await fetch(`${API_URL}/questions/${id}/answer`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ answer })
    });
    adminLoadQuestions();
    updateStats();
}

// ============================================
// ПОЛЬЗОВАТЕЛИ (автоматизировано)
// ============================================

async function adminLoadUsers() {
    await loadData('/admin/users', 'adminUsersList', AdminRenderer.user, 'Пользователей нет');
}

function adminCreateUser() {
    const username = prompt('Введите логин:');
    if (!username) return;
    const fullName = prompt('Введите ФИО:');
    if (!fullName) return;
    const email = prompt('Введите email:');
    if (!email) return;
    const password = prompt('Введите пароль:');
    if (!password) return;
    const role = prompt('Введите роль (USER / ADMIN / BOSS):', 'USER');

    fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, fullName, email, password, role: role || 'USER' })
    }).then(() => { adminLoadUsers(); updateStats(); });
}

async function adminDeleteUser(id) {
    if (!confirm('Удалить этого пользователя?')) return;
    await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: getHeaders() });
    adminLoadUsers();
    updateStats();
}

// ============================================
// ЗАДАЧИ (автоматизировано)
// ============================================

async function adminLoadTasks() {
    await loadData('/admin/tasks', 'adminTasksList', AdminRenderer.task, 'Задач нет');
}

function adminCreateTask() {
    const title = prompt('Введите название задачи:');
    if (!title) return;
    const description = prompt('Введите описание:');
    if (!description) return;
    const assignedToId = prompt('Введите ID пользователя (оставьте пустым):');

    fetch(`${API_URL}/admin/tasks`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
            title, description,
            assignedToId: assignedToId ? parseInt(assignedToId) : null
        })
    }).then(() => { adminLoadTasks(); updateStats(); });
}

async function adminUpdateTaskStatus(id, status) {
    await fetch(`${API_URL}/admin/tasks/${id}/status?status=${status}`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    adminLoadTasks();
    updateStats();
}

async function adminDeleteTask(id) {
    if (!confirm('Удалить эту задачу?')) return;
    await fetch(`${API_URL}/admin/tasks/${id}`, { method: 'DELETE', headers: getHeaders() });
    adminLoadTasks();
    updateStats();
}

// ============================================
// СТАТИСТИКА
// ============================================

async function updateStats() {
    try {
        const response = await fetch(`${API_URL}/statistics/dashboard`, {
            headers: getHeaders()
        });

        const data = await response.json();

        document.getElementById('statNews').textContent = data.totalNews || 0;
        document.getElementById('statEvents').textContent = data.totalEvents || 0;
        document.getElementById('statApplications').textContent = data.totalApplications || 0;
        document.getElementById('statQuestions').textContent = data.totalQuestions || 0;
        document.getElementById('statUsers').textContent = data.totalUsers || 0;
        document.getElementById('statTasks').textContent = data.totalTasks || 0;

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
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

// ============================================
// ОБРАБОТКА ЗАЯВКИ (через модалку)
// ============================================

function openApplicationModal(id, text, userName) {
    const modal = document.getElementById('applicationModal');
    if (!modal) return;

    document.getElementById('applicationForm').dataset.applicationId = id;
    document.getElementById('applicationInfo').innerHTML = `
        <div class="info-item"><span class="info-label">От:</span><span class="info-value">${userName || 'Неизвестно'}</span></div>
        <div class="info-item"><span class="info-label">Текст:</span><span class="info-value">${text}</span></div>
    `;
    document.getElementById('applicationResponse').value = '';
    document.getElementById('applicationStatus').value = 'APPROVED';
    modal.classList.add('show');
}

document.getElementById('applicationForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const id = this.dataset.applicationId;
    const status = document.getElementById('applicationStatus').value;
    const adminResponse = document.getElementById('applicationResponse').value.trim();

    if (!id) {
        alert('Ошибка: ID заявки не найден');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/applications/${id}/process`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status, adminResponse: adminResponse || '' })
        });

        if (response.ok) {
            alert('✅ Заявка обработана!');
            Modal.close('applicationModal');
            adminLoadApplications();
            updateStats();
        } else {
            const data = await response.json();
            alert('❌ Ошибка: ' + (data.message || data.messege || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка подключения к серверу');
    }
});

// ============================================
// ПРОСМОТР СОБЫТИЯ (добавлено!)
// ============================================

function viewEvent(id) {
    // Создаем модалку динамически
    const modalId = 'eventViewModal';
    let modal = document.getElementById(modalId);

    if (!modal) {
        modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-container">
                <div class="modal-header">
                    <h2><span class="modal-icon">📅</span> <span id="viewEventTitle">Событие</span></h2>
                    <button class="modal-close" onclick="Modal.close('${modalId}')">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="viewEventInfo"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="Modal.close('${modalId}')">Закрыть</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    Modal.open(modalId);
    document.getElementById('viewEventTitle').textContent = 'Событие #' + id;
    document.getElementById('viewEventInfo').innerHTML = '<p>Загрузка...</p>';

    fetch(`${API_URL}/events/${id}`, { headers: getHeaders() })
        .then(res => res.json())
        .then(data => {
            document.getElementById('viewEventInfo').innerHTML = `
                <div class="info-item"><span class="info-label">Название:</span><span class="info-value">${data.title}</span></div>
                <div class="info-item"><span class="info-label">Описание:</span><span class="info-value">${data.description || '—'}</span></div>
                <div class="info-item"><span class="info-label">Дата:</span><span class="info-value">${new Date(data.dateTime).toLocaleString('ru-RU')}</span></div>
                <div class="info-item"><span class="info-label">Место:</span><span class="info-value">${data.location || '—'}</span></div>
                <div class="info-item"><span class="info-label">Участников:</span><span class="info-value">${data.registeredCount || 0} / ${data.maxParticipants || 0}</span></div>
            `;
        })
        .catch(err => {
            document.getElementById('viewEventInfo').innerHTML = `<p style="color:#dc3545;">❌ Ошибка загрузки данных</p>`;
        });
}

// ============================================
// ФОРМЫ СОЗДАНИЯ
// ============================================

// Создание новости
document.getElementById('newsForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = document.getElementById('newsTitle').value.trim();
    const content = document.getElementById('newsContent').value.trim();
    const imageUrl = document.getElementById('newsImageUrl').value.trim();

    if (!title || !content) {
        alert('Заполните все обязательные поля');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/news`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ title, content, imageUrl: imageUrl || '' })
        });

        if (response.ok) {
            alert('✅ Новость создана!');
            Modal.close('newsModal');
            adminLoadNews();
            updateStats();
            this.reset();
        } else {
            const data = await response.json();
            alert('❌ Ошибка: ' + (data.message || data.messege || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка подключения к серверу');
    }
});

// Создание события
document.getElementById('eventForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value.trim();
    const maxParticipants = parseInt(document.getElementById('eventMaxParticipants').value) || 10;
    const imageUrl = document.getElementById('eventImageUrl').value.trim(); // ✅ ДОБАВЛЕНО

    if (!title || !description || !date || !time || !location) {
        alert('Заполните все обязательные поля');
        return;
    }

    const dateTime = `${date}T${time}:00`;

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title,
                description,
                dateTime,
                location,
                maxParticipants,
                imageUrl: imageUrl || '' // ✅ ДОБАВЛЕНО
            })
        });

        if (response.ok) {
            alert('✅ Событие создано!');
            Modal.close('eventModal');
            adminLoadEvents();
            updateStats();
            this.reset(); // Очищаем форму
        } else {
            const data = await response.json();
            alert('❌ Ошибка: ' + (data.message || data.messege || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка подключения к серверу');
    }
});

