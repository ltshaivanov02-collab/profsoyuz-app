// ============================================
// ЗАГРУЗИТЬ УВЕДОМЛЕНИЯ С СЕРВЕРА
// ============================================

async function loadNotifications() {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: getHeaders()
        });

        if (!response.ok) return [];

        return await response.json();

    } catch (error) {
        console.error('Ошибка загрузки уведомлений:', error);
        return [];
    }
}

// ============================================
// ЗАГРУЗИТЬ КОЛИЧЕСТВО НЕПРОЧИТАННЫХ
// ============================================

async function loadUnreadCount() {
    try {
        const response = await fetch(`${API_URL}/notifications/unread-count`, {
            headers: getHeaders()
        });

        if (!response.ok) return 0;

        const data = await response.json();
        return data.count || 0;

    } catch (error) {
        console.error('Ошибка загрузки счётчика:', error);
        return 0;
    }
}

// ============================================
// ОБНОВИТЬ БЕЙДЖ
// ============================================

async function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    const count = await loadUnreadCount();

    if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
}

// ============================================
// ОТКРЫТИЕ МОДАЛКИ УВЕДОМЛЕНИЙ
// ============================================

async function openNotificationsModal() {
    const modal = document.getElementById('notificationsModal');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Показываем "Загрузка..."
    const container = document.getElementById('notificationsList');
    container.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">Загрузка...</p>';

    const notifications = await loadNotifications();
    renderNotifications(notifications);
}

// ============================================
// ОТРИСОВКА УВЕДОМЛЕНИЙ
// ============================================

function renderNotifications(notifications) {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = `
            <div class="notifications-empty">
                <div class="empty-icon">🔔</div>
                <p>Уведомлений нет</p>
                <span>Здесь появятся уведомления о новых событиях, новостях и обращениях</span>
            </div>
        `;
        return;
    }

    container.innerHTML = notifications.map(n => {
        const icon = getNotificationIcon(n.type);
        const time = formatNotificationTime(n.createdAt);

        return `
            <div class="notification-item ${n.isRead ? 'read' : 'unread'}"
                 onclick="openNotification(${n.id}, '${n.link || ''}')">
                <div class="notification-icon">${icon}</div>
                <div class="notification-content">
                    <div class="notification-title">${n.title}</div>
                    <div class="notification-message">${n.message || ''}</div>
                    <div class="notification-time">${time}</div>
                </div>
                <button class="notification-delete"
                        onclick="event.stopPropagation(); deleteNotification(${n.id})"
                        title="Удалить">×</button>
            </div>
        `;
    }).join('');
}

// ============================================
// ОТКРЫТИЕ УВЕДОМЛЕНИЯ (ПОМЕТИТЬ ПРОЧИТАННЫМ)
// ============================================

async function openNotification(id, link) {
    try {
        await fetch(`${API_URL}/notifications/${id}/read`, {
            method: 'PUT',
            headers: getHeaders()
        });

        updateNotificationBadge();

        if (link) {
            window.location.href = link;
        } else {
            // Перерендерить список
            const notifications = await loadNotifications();
            renderNotifications(notifications);
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ============================================
// УДАЛИТЬ УВЕДОМЛЕНИЕ
// ============================================

async function deleteNotification(id) {
    try {
        await fetch(`${API_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        const notifications = await loadNotifications();
        renderNotifications(notifications);
        updateNotificationBadge();

    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
}

// ============================================
// ОЧИСТИТЬ ВСЕ
// ============================================

async function clearAllNotifications() {
    if (!confirm('Очистить все уведомления?')) return;

    try {
        await fetch(`${API_URL}/notifications/clear-all`, {
            method: 'DELETE',
            headers: getHeaders()
        });

        renderNotifications([]);
        updateNotificationBadge();

    } catch (error) {
        console.error('Ошибка очистки:', error);
    }
}

// ============================================
// ИКОНКА ПО ТИПУ
// ============================================

function getNotificationIcon(type) {
    const icons = {
        'news': '📰',
        'event': '📅',
        'application': '📋',
        'question': '❓',
        'task': '📌',
        'user': '👤',
        'system': '⚙️'
    };
    return icons[type] || '🔔';
}

// ============================================
// ВРЕМЯ
// ============================================

function formatNotificationTime(isoString) {
    if (!isoString) return '';

    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHour = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'только что';
    if (diffMin < 60) return `${diffMin} мин назад`;
    if (diffHour < 24) return `${diffHour} ч назад`;
    if (diffDay < 7) return `${diffDay} дн назад`;

    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
}

// ============================================
// ЗАКРЫТИЕ ПО КЛИКУ ВНЕ
// ============================================

document.addEventListener('click', function(e) {
    const modal = document.getElementById('notificationsModal');
    if (modal && e.target === modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('token')) {
        updateNotificationBadge();
        // Обновляем каждые 30 секунд
        setInterval(updateNotificationBadge, 30000);
    }
});