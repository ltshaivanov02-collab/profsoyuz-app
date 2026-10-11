// ============================================
// API URL
// ============================================

//const API_URL = 'http://localhost:8080/api';

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

let currentNewsId = null;
let currentEventId = null;
let currentApplicationId = null;
let currentApplicationFileUrl = null;
let currentQuestionId = null;
let allApplicationsCache = [];
let allQuestionsCache = [];
let currentTaskId = null;
let allTasksCache = [];
let currentTaskFilter = 'actual'; // 'actual' | 'past'

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
                 <span>${item.authorName || 'Unknown'}</span>
                 <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                 <span>Реакции: ${item.likesCount || 0}</span>
             </div>
         `,
         `<button onclick="viewNews(${item.id})" class="btn btn-sm btn-info">Редактировать</button>`
     ),

     events: (item) => AdminRenderer.card(
         `
             <strong>${item.title}</strong>
             <div class="sub">
                 <span>${new Date(item.dateTime).toLocaleDateString('ru-RU')}</span>
                 <span>${new Date(item.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                 <span>${item.registeredCount || 0} / ${item.maxParticipants || 0}</span>
             </div>
         `,
         `<button onclick="viewEvent(${item.id})" class="btn btn-sm btn-info">Редактировать</button>`
     ),

     application: (item) => AdminRenderer.card(
         `
             <strong>${item.subject || item.text || 'Без темы'}</strong>
             <div class="sub">
                 <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">${item.status || 'PENDING'}</span>
                 <span>${item.userName || 'Unknown'}</span>
                 <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
             </div>
         `,
         `<button onclick="viewApplication(${item.id})" class="btn btn-sm btn-info">Обработать</button>`
     ),

     question: (item) => {
         const isPending = item.status === 'PENDING';

         return AdminRenderer.card(
             `
                 <strong>${item.text}</strong>
                 <div class="sub">
                     <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">${item.status || 'PENDING'}</span>
                     <span>${item.userName || 'Unknown'}</span>
                     <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                 </div>
                 ${item.adminAnswer ? `<div style="font-size:13px;color:#666;margin-top:4px;">${item.adminAnswer}</div>` : ''}
             `,
             isPending
                 ? `<button onclick="viewQuestion(${item.id})" class="btn btn-sm btn-primary">Ответить</button>`
                 : `<button onclick="viewQuestion(${item.id})" class="btn btn-sm btn-info">Просмотр</button>`
         );
     },

     user: (item) => AdminRenderer.card(
         `
             <strong>${item.username}</strong>
             <div class="sub">
                 <span>${item.fullName || 'Без имени'}</span>
                 <span class="badge badge-${item.role?.toLowerCase() || 'user'}">${item.role || 'USER'}</span>
                 <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
             </div>
         `,
         `<button onclick="adminDeleteUser(${item.id})" class="btn btn-sm btn-danger">Удалить</button>`
     ),

     task: (item) => AdminRenderer.card(
         `
             <strong>${item.title}</strong>
             <div class="sub">
                 <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">${getTaskStatusText(item.status)}</span>
                 <span>${item.assignedToName || 'Не назначен'}</span>
                 <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
             </div>
         `,
         `
             <button onclick="viewTask(${item.id})" class="btn btn-sm btn-info">Открыть</button>
             <button onclick="adminDeleteTask(${item.id})" class="btn btn-sm btn-danger">Удалить</button>
         `
     ),

     eventWithRegistrations: (item) => AdminRenderer.card(
         `
             <strong>${item.eventTitle || 'Событие'}</strong>
             <div class="sub">
                 <span>${item.eventDateTime ? new Date(item.eventDateTime).toLocaleString('ru-RU') : '—'}</span>
                 <span>${item.eventLocation || 'Не указано'}</span>
             </div>
             <div class="sub" style="margin-top:6px;">
                 <span style="color:#0070B8;font-weight:600;">Записей: ${item.registrations.length}</span>
                 <span>Членов: ${item.totalMembers}</span>
                 <span>Родственников: ${item.totalRelatives}</span>
             </div>
         `,
         `<button onclick="viewEventRegistrations(${item.eventId})" class="btn btn-sm btn-info">Открыть</button>`
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

    // ✅ Инициализация обработчиков форм
    initEditFormHandler();
    initEventEditFormHandler();
    initApplicationProcessFormHandler();
    initQuestionProcessFormHandler();
});

function loadTabData(tabId) {
    switch (tabId) {
        case 'news': adminLoadNews(); break;
        case 'events': adminLoadEvents(); break;
        case 'applications': adminLoadApplications(); break;
        case 'questions': adminLoadQuestions(); break;
        case 'users': adminLoadUsers(); break;
        case 'tasks': adminLoadTasks(); break;
        case 'registrations': adminLoadRegistrations(); break;
    }
}

// ============================================
// НОВОСТИ
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
// СОБЫТИЯ
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
// ЗАЯВКИ (С КЭШИРОВАНИЕМ)
// ============================================

async function adminLoadApplications() {
    const container = document.getElementById('adminApplicationsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/applications`, { headers: getHeaders() });
        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state">Заявок нет</div>`;
            return;
        }

        // ✅ СОХРАНЯЕМ В КЭШ
        allApplicationsCache = data;

        container.innerHTML = data.map(AdminRenderer.application).join('');
    } catch (error) {
        console.error('Ошибка загрузки заявок:', error);
        container.innerHTML = `<div class="empty-state">⚠️ Ошибка загрузки</div>`;
    }
}

// ============================================
// ВОПРОСЫ (С КЭШИРОВАНИЕМ)
// ============================================

async function adminLoadQuestions() {
    const container = document.getElementById('adminQuestionsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/questions`, { headers: getHeaders() });
        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = `<div class="empty-state">Вопросов нет</div>`;
            return;
        }

        // ✅ СОХРАНЯЕМ В КЭШ
        allQuestionsCache = data;

        container.innerHTML = data.map(AdminRenderer.question).join('');
    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        container.innerHTML = `<div class="empty-state">⚠️ Ошибка загрузки</div>`;
    }
}

// ============================================
// ПРОСМОТР ВОПРОСА (ИЗ КЭША)
// ============================================

function viewQuestion(id) {
    currentQuestionId = id;

    // ✅ Берём данные из кэша
    const data = allQuestionsCache.find(q => q.id === id);
    if (!data) {
        alert('Вопрос не найден');
        return;
    }

    Modal.open('questionViewModal');
    renderQuestionView(data);
}

// ============================================
// ОТРИСОВКА ПРОСМОТРА ВОПРОСА
// ============================================

function renderQuestionView(data) {
    document.getElementById('viewQuestionTitle').textContent = 'Вопрос #' + data.id;

    const statusMap = {
        'PENDING': { text: 'В обработке', class: 'pending' },
        'ANSWERED': { text: 'Отвечено', class: 'approved' },
        'APPROVED': { text: 'Одобрено', class: 'approved' },
        'REJECTED': { text: 'Отклонено', class: 'rejected' }
    };

    const status = statusMap[data.status] || statusMap['PENDING'];

    document.getElementById('viewQuestionContent').innerHTML = `
        <div class="question-view-container">
            <div class="question-view-meta">
                <div class="question-view-meta-item">
                    <span class="label">От кого:</span>
                    <span class="value">${data.userName || 'Неизвестно'}</span>
                </div>
                <div class="question-view-meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${new Date(data.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="question-view-meta-item">
                    <span class="label">Статус:</span>
                    <span class="badge badge-${status.class}">${status.text}</span>
                </div>
            </div>

            <div class="question-view-text">
                <h3>Вопрос</h3>
                <p>${data.text || 'Нет текста'}</p>
            </div>

            ${data.adminAnswer ? `
                <div class="question-view-response">
                    <h3>Ответ администратора</h3>
                    <p>${data.adminAnswer}</p>
                </div>
            ` : `
                <div class="question-view-pending">
                    <p>Вопрос ещё не обработан</p>
                </div>
            `}
        </div>
    `;

    // ✅ УПРАВЛЕНИЕ КНОПКОЙ В FOOTER
    const editBtn = document.getElementById('questionEditBtn');
    if (editBtn) {
        if (data.status === 'PENDING') {
            editBtn.textContent = 'Ответить';
            editBtn.className = 'btn btn-primary';
        } else {
            editBtn.textContent = 'Редактировать';
            editBtn.className = 'btn btn-secondary';
        }
    }
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ В РЕЖИМ ОТВЕТА
// ============================================

function toggleQuestionProcess() {
    Modal.close('questionViewModal');

    // ✅ Берём данные из кэша
    const data = allQuestionsCache.find(q => q.id === currentQuestionId);
    if (!data) {
        alert('Вопрос не найден');
        return;
    }

    document.getElementById('processQuestionId').value = data.id;
    document.getElementById('processQuestionAnswer').value = data.adminAnswer || '';

    // Показываем информацию о вопросе
    document.getElementById('processQuestionInfo').innerHTML = `
        <div class="info-item">
            <span class="info-label">👤 От:</span>
            <span class="info-value">${data.userName || 'Неизвестно'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">📅 Дата:</span>
            <span class="info-value">${new Date(data.createdAt).toLocaleString('ru-RU')}</span>
        </div>
        <div class="info-item">
            <span class="info-label">❓ Вопрос:</span>
            <span class="info-value">${data.text || '—'}</span>
        </div>
    `;

    Modal.open('questionProcessModal');
}

// ============================================
// ОБРАБОТЧИК ФОРМЫ ОТВЕТА НА ВОПРОС
// ============================================

window.questionProcessSubmitHandler = async function(e) {
    e.preventDefault();

    const id = document.getElementById('processQuestionId').value;
    const answer = document.getElementById('processQuestionAnswer').value.trim();

    if (!id) {
        alert('Ошибка: ID вопроса не найден');
        return;
    }

    if (!answer) {
        alert('Введите ответ на вопрос');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    let originalText = 'Ответить';

    if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(`${API_URL}/questions/${id}/answer`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ answer })
        });

        if (response.ok) {
            alert('Ответ отправлен!');
            Modal.close('questionProcessModal');
            adminLoadQuestions();
            updateStats();
            setTimeout(() => viewQuestion(id), 300);
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКА ФОРМЫ ВОПРОСА
// ============================================

let questionProcessFormInitialized = false;

function initQuestionProcessFormHandler() {
    if (questionProcessFormInitialized) return;

    const form = document.getElementById('questionProcessForm');
    if (form) {
        form.removeEventListener('submit', window.questionProcessSubmitHandler);
        form.addEventListener('submit', window.questionProcessSubmitHandler);
        questionProcessFormInitialized = true;
        console.log('Обработчик формы ответа на вопрос привязан!');
    }
}



// ============================================
// ПОЛЬЗОВАТЕЛИ
// ============================================

async function adminLoadUsers() {
    await loadData('/admin/users', 'adminUsersList', AdminRenderer.user, 'Пользователей нет');
}

function adminCreateUser() {
      const form = document.getElementById('userCreateForm');
        if (form) form.reset();

        // Открываем модалку
        Modal.open('userCreateModal');

}

async function adminDeleteUser(id) {
    if (!confirm('Удалить этого пользователя?')) return;
    await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: getHeaders() });
    adminLoadUsers();
    updateStats();
}

// ============================================
 // ПОКАЗАТЬ / СКРЫТЬ ПАРОЛЬ (универсально)
 // ============================================

 function togglePasswordVisibility(inputId, iconId) {
     const input = document.getElementById(inputId);
     const icon = document.getElementById(iconId);

     if (!input || !icon) return;

     if (input.type === 'password') {
         input.type = 'text';
         icon.className = 'bx bx-hide';
     } else {
         input.type = 'password';
         icon.className = 'bx bx-show';
     }
 }

// ============================================
// ЗАДАЧИ
// ============================================

async function adminLoadTasks() {
    const container = document.getElementById('adminTasksList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/admin/tasks`, { headers: getHeaders() });
        const data = await response.json();

        allTasksCache = data || [];
        renderTasksWithFilter();

    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        container.innerHTML = `<div class="empty-state">Ошибка загрузки</div>`;
    }
}

async function adminCreateTask() {
    await loadUsersForTaskSelect();
    Modal.open('taskCreateModal');
}

async function loadUsersForTaskSelect() {
    const select = document.getElementById('taskAssignedTo');
    if (!select) return;

    try {
        const response = await fetch(`${API_URL}/admin/users`, { headers: getHeaders() });
        const users = await response.json();

        select.innerHTML = '<option value="">— Не назначен —</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.fullName || user.username} (${user.role})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
    }
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

// ФИЛЬТР ЗАДАЧ
function setTaskFilter(filter, btn) {
    currentTaskFilter = filter;
    document.querySelectorAll('.task-filters .filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasksWithFilter();
}

function renderTasksWithFilter() {
    const container = document.getElementById('adminTasksList');
    if (!container) return;

    const now = new Date();

    const filtered = allTasksCache.filter(task => {
        const isCompleted = task.status === 'COMPLETED';
        const deadline = task.deadline ? new Date(task.deadline) : null;
        const isOverdue = deadline && deadline < now;

        if (currentTaskFilter === 'actual') {
            return !isCompleted;
        } else {
            return isCompleted || isOverdue;
        }
    });

    if (filtered.length === 0) {
        container.innerHTML = `<div class="empty-state">Задач нет</div>`;
        return;
    }

    container.innerHTML = filtered.map(AdminRenderer.task).join('');
}

// ПРОСМОТР ЗАДАЧИ
// ============================================

function viewTask(id) {
    currentTaskId = id;

    const task = allTasksCache.find(t => t.id === id);
    if (!task) {
        alert('Задача не найдена');
        return;
    }

    Modal.open('taskViewModal');
    renderTaskView(task);
}

function renderTaskView(task) {
    document.getElementById('viewTaskTitle').textContent = 'Задача #' + task.id;

    const now = new Date();
    const deadline = task.deadline ? new Date(task.deadline) : null;
    const isOverdue = deadline && deadline < now && task.status !== 'COMPLETED';

    document.getElementById('viewTaskContent').innerHTML = `
        <div class="task-view-container">
            <div class="task-view-meta">
                <div class="task-view-meta-item">
                    <span class="label">Статус:</span>
                    <span class="badge badge-${task.status?.toLowerCase() || 'pending'}">${getTaskStatusText(task.status)}</span>
                </div>
                <div class="task-view-meta-item">
                    <span class="label">Ответственный:</span>
                    <span class="value">${task.assignedToName || 'Не назначен'}</span>
                </div>
                <div class="task-view-meta-item">
                    <span class="label">Создал:</span>
                    <span class="value">${task.createdByName || 'Неизвестно'}</span>
                </div>
                ${deadline ? `
                    <div class="task-view-meta-item">
                        <span class="label">Дедлайн:</span>
                        <span class="value" style="color:${isOverdue ? '#dc3545' : '#333'};">
                            ${isOverdue ? '⚠️ ' : ''}${deadline.toLocaleString('ru-RU')}
                        </span>
                    </div>
                ` : ''}
                <div class="task-view-meta-item">
                    <span class="label">Создано:</span>
                    <span class="value">${new Date(task.createdAt).toLocaleString('ru-RU')}</span>
                </div>
            </div>

            <div class="task-view-text">
                <h3>📌 ${task.title}</h3>
                <p>${task.description || 'Нет описания'}</p>
            </div>
        </div>
    `;
}

async function updateTaskStatusFromView(status) {
    if (!currentTaskId) return;

    try {
        const response = await fetch(`${API_URL}/admin/tasks/${currentTaskId}/status?status=${status}`, {
            method: 'PATCH',
            headers: getHeaders()
        });

        if (response.ok) {
            alert('Статус обновлён!');
            Modal.close('taskViewModal');
            adminLoadTasks();
            updateStats();
        } else {
            alert('Ошибка обновления');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения');
    }
}

function getTaskStatusText(status) {
    const map = {
        'PENDING': 'Ожидает',
        'IN_PROGRESS': 'В работе',
        'COMPLETED': 'Выполнено'
    };
    return map[status] || 'Ожидает';
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

        // ✅ ОБНОВИТЬ ВИДЖЕТЫ
        updateWidgetCounts();

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

function getReactionEmoji(type) {
    const emojis = {
        'LIKE': '👍',
        'HEART': '❤️',
        'FIRE': '🔥',
        'CLAP': '👏'
    };
    return emojis[type] || '👍';
}

// ============================================
// ПРОСМОТР НОВОСТИ
// ============================================

function viewNews(id) {
    currentNewsId = id;

    Modal.open('newsViewModal');
    document.getElementById('viewNewsTitle').textContent = 'Загрузка...';
    document.getElementById('viewNewsContent').innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    fetch(`${API_URL}/news/${id}`, { headers: getHeaders() })
        .then(res => {
            if (!res.ok) throw new Error('Новость не найдена');
            return res.json();
        })
        .then(data => {
            renderNewsView(data);
        })
        .catch(err => {
            document.getElementById('viewNewsContent').innerHTML = `
                <p style="color:#dc3545;">Ошибка загрузки новости</p>
                <p style="color:#888;font-size:13px;">${err.message}</p>
            `;
        });
}

function renderNewsView(data) {
    document.getElementById('viewNewsTitle').textContent = data.title || 'Новость';

    const reactions = data.reactions || {};
    const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

    let html = `
        <div class="news-view-container">
            ${data.imageUrl ? `
                <div class="news-view-image">
                    <img src="${data.imageUrl}" alt="${data.title}" onerror="this.style.display='none'">
                </div>
            ` : ''}

            <div class="news-view-meta">
                <div class="news-view-meta-item">
                    <span class="label">Автор:</span>
                    <span class="value">${data.authorName || 'Неизвестен'}</span>
                </div>
                <div class="news-view-meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${new Date(data.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                ${data.updatedAt && data.updatedAt !== data.createdAt ? `
                    <div class="news-view-meta-item">
                        <span class="label">Изменено:</span>
                        <span class="value">${new Date(data.updatedAt).toLocaleString('ru-RU')}</span>
                    </div>
                ` : ''}
                <div class="news-view-meta-item">
                    <span class="label">Реакции:</span>
                    <span class="value">${totalReactions || 0}</span>
                </div>
            </div>

            <div class="news-view-reactions">
                ${Object.entries(reactions).filter(([key, val]) => val > 0).map(([key, val]) => `
                    <span class="reaction-badge">${getReactionEmoji(key)} ${val}</span>
                `).join('') || '<span style="color:#888;font-size:13px;">Нет реакций</span>'}
            </div>

            <div class="news-view-text">
                <h3>${data.title}</h3>
                <p>${data.content || 'Нет текста'}</p>
            </div>
        </div>
    `;

    document.getElementById('viewNewsContent').innerHTML = html;
}

async function adminDeleteNewsFromView() {
    if (!currentNewsId) return;
    if (!confirm('Удалить эту новость?')) return;

    try {
        await fetch(`${API_URL}/news/${currentNewsId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        Modal.close('newsViewModal');
        adminLoadNews();
        updateStats();
        alert('Новость удалена');
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении новости');
    }
}

// ============================================
// РЕДАКТИРОВАНИЕ НОВОСТИ
// ============================================

function toggleNewsEdit() {
    Modal.close('newsViewModal');

    fetch(`${API_URL}/news/${currentNewsId}`, { headers: getHeaders() })
        .then(res => {
            if (!res.ok) throw new Error('Новость не найдена');
            return res.json();
        })
        .then(data => {
            document.getElementById('editNewsId').value = data.id;
            document.getElementById('editNewsTitle').value = data.title || '';
            document.getElementById('editNewsContent').value = data.content || '';
            document.getElementById('editNewsImageUrl').value = data.imageUrl || '';
            Modal.open('newsEditModal');
        })
        .catch(err => {
            alert('Ошибка загрузки данных для редактирования: ' + err.message);
        });
}

window.newsEditSubmitHandler = async function(e) {
    e.preventDefault();

    const id = document.getElementById('editNewsId').value;
    const title = document.getElementById('editNewsTitle').value.trim();
    const content = document.getElementById('editNewsContent').value.trim();
    const imageUrl = document.getElementById('editNewsImageUrl').value.trim();

    if (!title || !content) {
        alert('Заполните все обязательные поля');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    let originalText = 'Сохранить';

    if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.textContent = 'Сохранение...';
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(`${API_URL}/news/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ title, content, imageUrl: imageUrl || '' })
        });

        if (response.ok) {
            alert('Новость обновлена!');
            Modal.close('newsEditModal');
            adminLoadNews();
            updateStats();
            setTimeout(() => viewNews(id), 300);
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
};

// ============================================
// ПРОСМОТР СОБЫТИЯ
// ============================================

function viewEvent(id) {
    currentEventId = id;

    Modal.open('eventViewModal');
    document.getElementById('viewEventTitle').textContent = 'Загрузка...';
    document.getElementById('viewEventContent').innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    fetch(`${API_URL}/events/${id}`, { headers: getHeaders() })
        .then(res => {
            if (!res.ok) throw new Error('Событие не найдено');
            return res.json();
        })
        .then(data => {
            renderEventView(data);
        })
        .catch(err => {
            document.getElementById('viewEventContent').innerHTML = `
                <p style="color:#dc3545;">Ошибка загрузки события</p>
                <p style="color:#888;font-size:13px;">${err.message}</p>
            `;
        });
}

function renderEventView(data) {
    document.getElementById('viewEventTitle').textContent = data.title || 'Событие';

    const now = new Date();
    const eventDate = new Date(data.dateTime);
    const isPast = eventDate < now;
    const remainingPlaces = (data.maxParticipants || 0) - (data.registeredCount || 0);

    let statusText = 'Предстоит';
    let statusClass = 'upcoming';
    if (isPast) { statusText = 'Прошло'; statusClass = 'past'; }
    if (remainingPlaces <= 0) { statusText = 'Мест нет'; statusClass = 'fully-booked'; }

    let html = `
        <div class="event-view-container">
            ${data.imageUrl ? `
                <div class="event-view-image">
                    <img src="${data.imageUrl}" alt="${data.title}" onerror="this.style.display='none'">
                </div>
            ` : ''}

            <div class="event-view-meta">
                <div class="event-view-meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${new Date(data.dateTime).toLocaleString('ru-RU')}</span>
                </div>
                <div class="event-view-meta-item">
                    <span class="label">Место:</span>
                    <span class="value">${data.location || 'Не указано'}</span>
                </div>
                <div class="event-view-meta-item">
                    <span class="label">Участников:</span>
                    <span class="value">${data.registeredCount || 0} / ${data.maxParticipants || 0}</span>
                </div>
                <div class="event-view-meta-item">
                    <span class="label">Свободно:</span>
                    <span class="value">${remainingPlaces > 0 ? remainingPlaces : 'Мест нет'}</span>
                </div>
                ${data.createdByName ? `
                    <div class="event-view-meta-item">
                        <span class="label">Создал:</span>
                        <span class="value">${data.createdByName}</span>
                    </div>
                ` : ''}
                <div class="event-view-meta-item">
                    <span class="label">Статус:</span>
                    <span class="event-status ${statusClass}">${statusText}</span>
                </div>
            </div>

            <div class="event-view-text">
                <h3>${data.title}</h3>
                <p>${data.description || 'Нет описания'}</p>
            </div>
        </div>
    `;

    document.getElementById('viewEventContent').innerHTML = html;
}

async function adminDeleteEventFromView() {
    if (!currentEventId) return;
    if (!confirm('Удалить это событие?')) return;

    try {
        await fetch(`${API_URL}/events/${currentEventId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        Modal.close('eventViewModal');
        adminLoadEvents();
        updateStats();
        alert('Событие удалено');
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении события');
    }
}

// ============================================
// РЕДАКТИРОВАНИЕ СОБЫТИЯ
// ============================================

function toggleEventEdit() {
    Modal.close('eventViewModal');

    fetch(`${API_URL}/events/${currentEventId}`, { headers: getHeaders() })
        .then(res => {
            if (!res.ok) throw new Error('Событие не найдено');
            return res.json();
        })
        .then(data => {
            document.getElementById('editEventId').value = data.id;
            document.getElementById('editEventTitle').value = data.title || '';
            document.getElementById('editEventDescription').value = data.description || '';
            document.getElementById('editEventImageUrl').value = data.imageUrl || '';

            if (data.dateTime) {
                const dt = new Date(data.dateTime);
                const date = dt.toISOString().split('T')[0];
                const time = dt.toTimeString().slice(0, 5);
                document.getElementById('editEventDate').value = date;
                document.getElementById('editEventTime').value = time;
            }

            document.getElementById('editEventLocation').value = data.location || '';
            document.getElementById('editEventMaxParticipants').value = data.maxParticipants || 10;

            Modal.open('eventEditModal');
        })
        .catch(err => {
            alert('Ошибка загрузки данных для редактирования: ' + err.message);
        });
}

// ============================================
// ЗАПИСИ НА МЕРОПРИЯТИЯ (С ГРУППИРОВКОЙ)
// ============================================

let allRegistrationsCache = [];        // Плоский список записей
let groupedRegistrations = [];         // Сгруппированные по событиям

async function adminLoadRegistrations() {
    const container = document.getElementById('adminRegistrationsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/events/registrations`, {
            headers: getHeaders()
        });

        const data = await response.json();
        allRegistrationsCache = data || [];

        if (allRegistrationsCache.length === 0) {
            container.innerHTML = `<div class="empty-state">Записей нет</div>`;
            return;
        }

        // ✅ ГРУППИРУЕМ ПО СОБЫТИЯМ
        groupedRegistrations = groupRegistrationsByEvent(allRegistrationsCache);

        container.innerHTML = groupedRegistrations.map(AdminRenderer.eventWithRegistrations).join('');

    } catch (error) {
        console.error('Ошибка загрузки записей:', error);
        container.innerHTML = `<div class="empty-state">Ошибка загрузки</div>`;
    }
}

// ============================================
// ГРУППИРОВКА ЗАПИСЕЙ ПО СОБЫТИЯМ
// ============================================

function groupRegistrationsByEvent(registrations) {
    const map = new Map();

    registrations.forEach(reg => {
        const eventId = reg.eventId;

        if (!map.has(eventId)) {
            map.set(eventId, {
                eventId: eventId,
                eventTitle: reg.eventTitle,
                eventDateTime: reg.eventDateTime,
                eventLocation: reg.eventLocation,
                registrations: [],
                totalMembers: 0,
                totalRelatives: 0
            });
        }

        const group = map.get(eventId);
        group.registrations.push(reg);
        group.totalMembers += reg.membersCount || 0;
        group.totalRelatives += reg.relativesCount || 0;
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.eventDateTime) - new Date(a.eventDateTime));
}

// ============================================
// ПРОСМОТР ЗАПИСЕЙ КОНКРЕТНОГО СОБЫТИЯ
// ============================================

function viewEventRegistrations(eventId) {
    const group = groupedRegistrations.find(g => g.eventId === eventId);
    if (!group) {
        alert('Событие не найдено');
        return;
    }

    Modal.open('eventRegistrationsModal');

    document.getElementById('eventRegistrationsTitle').textContent = group.eventTitle || 'Событие';

    // Формируем таблицу участников
    const rows = group.registrations.map((reg, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${reg.userName || 'Неизвестно'}</td>
            <td>${reg.userEmail || '—'}</td>
            <td style="text-align:center;">${reg.membersCount || 0}</td>
            <td style="text-align:center;">${reg.relativesCount || 0}</td>
            <td>${reg.comment || '—'}</td>
        </tr>
    `).join('');

    document.getElementById('eventRegistrationsContent').innerHTML = `
        <div class="event-registrations-header">
            <div class="event-registrations-meta">
                <div class="meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${group.eventDateTime ? new Date(group.eventDateTime).toLocaleString('ru-RU') : '—'}</span>
                </div>
                <div class="meta-item">
                    <span class="label">Место:</span>
                    <span class="value">${group.eventLocation || 'Не указано'}</span>
                </div>
                <div class="meta-item">
                    <span class="label">Всего записей:</span>
                    <span class="value">${group.registrations.length}</span>
                </div>
                <div class="meta-item">
                    <span class="label">Членов профсоюза:</span>
                    <span class="value">${group.totalMembers}</span>
                </div>
                <div class="meta-item">
                    <span class="label">Родственников:</span>
                    <span class="value">${group.totalRelatives}</span>
                </div>
            </div>
        </div>

        <div class="event-registrations-table-wrapper">
            <table class="event-registrations-table">
                <thead>
                    <tr>
                        <th>№</th>
                        <th>Участник</th>
                        <th>Email</th>
                        <th>Членов</th>
                        <th>Родственников</th>
                        <th>Комментарий</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
}

window.eventEditSubmitHandler = async function(e) {
    e.preventDefault();

    const id = document.getElementById('editEventId').value;
    const title = document.getElementById('editEventTitle').value.trim();
    const description = document.getElementById('editEventDescription').value.trim();
    const imageUrl = document.getElementById('editEventImageUrl').value.trim();
    const date = document.getElementById('editEventDate').value;
    const time = document.getElementById('editEventTime').value;
    const location = document.getElementById('editEventLocation').value.trim();
    const maxParticipants = parseInt(document.getElementById('editEventMaxParticipants').value) || 10;

    if (!title || !description || !date || !time || !location) {
        alert('Заполните все обязательные поля');
        return;
    }

    const dateTime = `${date}T${time}:00`;

    const submitBtn = this.querySelector('button[type="submit"]');
    let originalText = 'Сохранить';

    if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.textContent = 'Сохранение...';
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(`${API_URL}/events/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({
                title,
                description,
                dateTime,
                location,
                maxParticipants,
                imageUrl: imageUrl || ''
            })
        });

        if (response.ok) {
            alert('Событие обновлено!');
            Modal.close('eventEditModal');
            adminLoadEvents();
            updateStats();
            setTimeout(() => viewEvent(id), 300);
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
};

// ============================================
// ПРОСМОТР ЗАЯВКИ (ИЗ КЭША)
// ============================================

function viewApplication(id) {
    currentApplicationId = id;

    // ✅ Берём данные из кэша (без fetch!)
    const data = allApplicationsCache.find(a => a.id === id);
    if (!data) {
        alert('Заявка не найдена');
        return;
    }

    Modal.open('applicationViewModal');
    renderApplicationView(data);
}

// ============================================
// ОТРИСОВКА ПРОСМОТРА ЗАЯВКИ
// ============================================

function renderApplicationView(data) {
    document.getElementById('viewApplicationTitle').textContent = 'Заявка #' + data.id;

    const statusMap = {
        'PENDING': { text: 'В обработке', class: 'pending' },
        'APPROVED': { text: 'Одобрено', class: 'approved' },
        'REJECTED': { text: 'Отклонено', class: 'rejected' }
    };

    const status = statusMap[data.status] || statusMap['PENDING'];
    const fileUrl = data.fileUrl || data.documentUrl || null;

    currentApplicationFileUrl = fileUrl;

    document.getElementById('viewApplicationContent').innerHTML = `
        <div class="application-view-container">
            <div class="application-view-meta">
                <div class="application-view-meta-item">
                    <span class="label">От кого:</span>
                    <span class="value">${data.userName || 'Неизвестно'}</span>
                </div>
                <div class="application-view-meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${new Date(data.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="application-view-meta-item">
                    <span class="label">Статус:</span>
                    <span class="badge badge-${status.class}">${status.text}</span>
                </div>
            </div>

            ${data.subject ? `
                <div class="application-view-subject">
                    <h3>Тема обращения</h3>
                    <p>${data.subject}</p>
                </div>
            ` : ''}

            <div class="application-view-text">
                <h3>Текст заявки</h3>
                <p>${data.text || 'Нет текста'}</p>
            </div>

            ${fileUrl ? `
                <div class="application-view-document">
                    <h3>📎 Прикреплённый документ</h3>
                    <button onclick="openCurrentPdfInBrowser()" class="document-link">
                        <i class="bx bx-file"></i> Открыть PDF в браузере
                    </button>
                </div>
            ` : ''}

            ${data.adminResponse ? `
                <div class="application-view-response">
                    <h3>Ответ администратора</h3>
                    <p>${data.adminResponse}</p>
                </div>
            ` : ''}
        </div>
    `;
}

// ============================================
// ОТКРЫТИЕ PDF В БРАУЗЕРЕ (НОВАЯ ВКЛАДКА)
// ============================================

function openCurrentPdfInBrowser() {
    if (!currentApplicationFileUrl) {
        alert('PDF не найден');
        return;
    }

    try {
        let blobUrl;

        // Если это Base64 (data:application/pdf;base64,...)
        if (currentApplicationFileUrl.startsWith('data:application/pdf')) {
            // 1. Извлекаем Base64 часть
            const base64Data = currentApplicationFileUrl.split(',')[1];

            // 2. Декодируем Base64 в бинарные данные
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            // 3. Создаём Blob с типом application/pdf
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            // 4. Создаём URL для Blob
            blobUrl = URL.createObjectURL(blob);
        } else {
            // Обычная ссылка
            blobUrl = currentApplicationFileUrl;
        }

        // 5. Открываем в новой вкладке
        window.open(blobUrl, '_blank');

    } catch (error) {
        console.error('Ошибка открытия PDF:', error);
        alert('Не удалось открыть PDF в браузере');
    }
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ В РЕЖИМ ОБРАБОТКИ
// ============================================

function toggleApplicationProcess() {
    Modal.close('applicationViewModal');

    // ✅ Берём данные из кэша (без fetch!)
    const data = allApplicationsCache.find(a => a.id === currentApplicationId);
    if (!data) {
        alert('Заявка не найдена');
        return;
    }

    document.getElementById('processApplicationId').value = data.id;
    document.getElementById('processApplicationStatus').value = data.status || 'APPROVED';
    document.getElementById('processApplicationResponse').value = data.adminResponse || '';

    // Показываем информацию о заявке
    document.getElementById('processApplicationInfo').innerHTML = `
        <div class="info-item">
            <span class="info-label">От:</span>
            <span class="info-value">${data.userName || 'Неизвестно'}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Дата:</span>
            <span class="info-value">${new Date(data.createdAt).toLocaleString('ru-RU')}</span>
        </div>
        ${data.subject ? `
            <div class="info-item">
                <span class="info-label">Тема:</span>
                <span class="info-value">${data.subject}</span>
            </div>
        ` : ''}
        <div class="info-item">
            <span class="info-label">Текст:</span>
            <span class="info-value">${data.text || '—'}</span>
        </div>
        ${data.fileUrl ? `
            <div class="info-item">
                <span class="info-label">📎 Документ:</span>
                <span class="info-value">
                    <button onclick="openCurrentPdfInBrowser()" class="document-link" style="padding:4px 10px;font-size:12px;">
                        Открыть PDF
                    </button>
                </span>
            </div>
        ` : ''}
    `;

    Modal.open('applicationProcessModal');
}

// ============================================
// ОБРАБОТЧИК ФОРМЫ ОБРАБОТКИ ЗАЯВКИ
// ============================================

window.applicationProcessSubmitHandler = async function(e) {
    e.preventDefault();

    const id = document.getElementById('processApplicationId').value;
    const status = document.getElementById('processApplicationStatus').value;
    const adminResponse = document.getElementById('processApplicationResponse').value.trim();

    if (!id) {
        alert('Ошибка: ID заявки не найден');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    let originalText = 'Обработать';

    if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.textContent = 'Обработка...';
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(`${API_URL}/applications/${id}/process`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status, adminResponse: adminResponse || '' })
        });

        if (response.ok) {
            alert('Заявка обработана!');
            Modal.close('applicationProcessModal');
            adminLoadApplications();
            updateStats();
            setTimeout(() => viewApplication(id), 300);
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКА ФОРМЫ ЗАЯВКИ
// ============================================

let applicationProcessFormInitialized = false;

function initApplicationProcessFormHandler() {
    if (applicationProcessFormInitialized) return;

    const form = document.getElementById('applicationProcessForm');
    if (form) {
        form.removeEventListener('submit', window.applicationProcessSubmitHandler);
        form.addEventListener('submit', window.applicationProcessSubmitHandler);
        applicationProcessFormInitialized = true;
        console.log('Обработчик формы обработки заявки привязан!');
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ ФОРМ
// ============================================

let editFormHandlerInitialized = false;

function initEditFormHandler() {
    if (editFormHandlerInitialized) return;

    const editForm = document.getElementById('newsEditForm');
    if (editForm) {
        editForm.removeEventListener('submit', window.newsEditSubmitHandler);
        editForm.addEventListener('submit', window.newsEditSubmitHandler);
        editFormHandlerInitialized = true;
        console.log('Обработчик формы редактирования новости привязан!');
    }
}

let eventEditFormHandlerInitialized = false;

function initEventEditFormHandler() {
    if (eventEditFormHandlerInitialized) return;

    const editForm = document.getElementById('eventEditForm');
    if (editForm) {
        editForm.removeEventListener('submit', window.eventEditSubmitHandler);
        editForm.addEventListener('submit', window.eventEditSubmitHandler);
        eventEditFormHandlerInitialized = true;
        console.log('Обработчик формы редактирования события привязан!');
    }
}

// ============================================
// ФОРМЫ СОЗДАНИЯ
// ============================================

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
            alert('Новость создана!');
            Modal.close('newsModal');
            adminLoadNews();
            updateStats();
            this.reset();
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || data.messege || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    }
});

document.getElementById('eventForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = document.getElementById('eventTitle').value.trim();
    const description = document.getElementById('eventDescription').value.trim();
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const location = document.getElementById('eventLocation').value.trim();
    const maxParticipants = parseInt(document.getElementById('eventMaxParticipants').value) || 10;
    const imageUrl = document.getElementById('eventImageUrl').value.trim();

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
                imageUrl: imageUrl || ''
            })
        });

        if (response.ok) {
            alert('Событие создано!');
            Modal.close('eventModal');
            adminLoadEvents();
            updateStats();
            this.reset();
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || data.messege || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    }
});

// ============================================
// ОБРАБОТЧИК ФОРМЫ СОЗДАНИЯ ЗАДАЧИ
// ============================================

document.getElementById('taskCreateForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const assignedToId = document.getElementById('taskAssignedTo').value;
    const deadline = document.getElementById('taskDeadline').value;

    if (!title) {
        alert('Введите название задачи');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/admin/tasks`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                title,
                description,
                assignedToId: assignedToId ? parseInt(assignedToId) : null,
                deadline: deadline ? deadline + ':00' : null
            })
        });

        if (response.ok) {
            alert('Задача создана!');
            Modal.close('taskCreateModal');
            this.reset();
            adminLoadTasks();
            updateStats();
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    }
});


// ============================================
// ПРИНУДИТЕЛЬНАЯ ПРИВЯЗКА ОБРАБОТЧИКОВ
// ============================================

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initEditFormHandler();
    initEventEditFormHandler();
    initApplicationProcessFormHandler();
    initQuestionProcessFormHandler();
} else {
    document.addEventListener('DOMContentLoaded', function() {
        initEditFormHandler();
        initEventEditFormHandler();
        initApplicationProcessFormHandler();
        initQuestionProcessFormHandler();
    });
}

// ============================================
// МОБИЛЬНЫЕ ВИДЖЕТЫ АДМИНКИ
// ============================================

function openAdminSection(sectionId) {
    const widgets = document.getElementById('adminWidgets');
    const section = document.getElementById('adminSection');
    const backBtn = document.getElementById('adminBackBtn');

    // Скрыть виджеты
    if (widgets) widgets.style.display = 'none';

    // Показать секцию
    if (section) section.classList.add('active');
    if (backBtn) backBtn.style.display = 'inline-flex';

    // Активировать нужную вкладку
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const target = document.getElementById('tab-' + sectionId);
    if (target) target.classList.add('active');

    // Синхронизировать верхние табы
    document.querySelectorAll('.tab-btn').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === sectionId);
    });

    // Загрузить данные
    loadTabData(sectionId);

    // Скролл вверх
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeAdminSection() {
    const widgets = document.getElementById('adminWidgets');
    const section = document.getElementById('adminSection');
    const backBtn = document.getElementById('adminBackBtn');

    if (widgets) widgets.style.display = 'block';
    if (section) section.classList.remove('active');
    if (backBtn) backBtn.style.display = 'none';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateWidgetCounts() {
    const stats = {
        widgetNews: 'statNews',
        widgetEvents: 'statEvents',
        widgetApplications: 'statApplications',
        widgetQuestions: 'statQuestions',
        widgetUsers: 'statUsers',
        widgetTasks: 'statTasks'
    };

    Object.entries(stats).forEach(([widgetId, statId]) => {
        const widget = document.getElementById(widgetId);
        const stat = document.getElementById(statId);
        if (widget && stat) {
            widget.textContent = stat.textContent || '0';
        }
    });

    // Записи — считаем уникальные события
    const widgetRegistrations = document.getElementById('widgetRegistrations');
    if (widgetRegistrations) {
        widgetRegistrations.textContent = groupedRegistrations.length || 0;
    }
}

function checkMobileAdmin() {
    const isMobile = window.innerWidth <= 1024;
    const widgets = document.getElementById('adminWidgets');
    const section = document.getElementById('adminSection');

    if (isMobile) {
        if (widgets) widgets.style.display = 'block';
        if (section) section.classList.remove('active');
    } else {
        if (widgets) widgets.style.display = 'none';
        if (section) section.classList.add('active');
    }
}

// ============================================
// ОБРАБОТЧИК ФОРМЫ СОЗДАНИЯ ПОЛЬЗОВАТЕЛЯ
// ============================================

document.getElementById('userCreateForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('userUsername').value.trim();
    const fullName = document.getElementById('userFullName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;

    // Валидация
    if (!username || !fullName || !email || !password) {
        alert('Заполните все обязательные поля');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    let originalText = 'Создать';

    if (submitBtn) {
        originalText = submitBtn.textContent;
        submitBtn.textContent = 'Создание...';
        submitBtn.disabled = true;
    }

    try {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ username, fullName, email, password, role })
        });

        if (response.ok) {
            alert('Пользователь создан');
            Modal.close('userCreateModal');
            this.reset();
            adminLoadUsers();
            updateStats();
        } else {
            const data = await response.json();
            alert('Ошибка: ' + (data.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    if (response.ok) {
        alert('Пользователь создан');
        Modal.close('userCreateModal');
        this.reset();
        document.getElementById('userFormError').style.display = 'none';
        adminLoadUsers();
        updateStats();
    } else {
        const data = await response.json();
        const errorEl = document.getElementById('userFormError');
        errorEl.textContent = data.message || 'Ошибка создания пользователя';
        errorEl.className = 'result-area error';
        errorEl.style.display = 'block';
    }
});

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    checkMobileAdmin();
    setTimeout(updateWidgetCounts, 500);
});

window.addEventListener('resize', checkMobileAdmin);

