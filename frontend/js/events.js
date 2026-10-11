//const API_URL = 'http://localhost:8080/api';

// ============================================
// ЗАГРУЗКА СОБЫТИЙ
// ============================================
let eventsCache = [];
async function loadEvents() {
    const container = document.getElementById('eventsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/events`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            container.innerHTML = '<p style="color:#888;">❌ Ошибка загрузки событий</p>';
            return;
        }

        const events = await response.json();
        eventsCache = events;
        renderEvents(container, events);

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="color:#888;">Ошибка подключения к серверу</p>';
    }
}

// ============================================
// ОТРИСОВКА СОБЫТИЙ
// ============================================

function renderEvents(container, events) {
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-events">
                <i class="bx bx-calendar-x"></i>
                <p>Событий пока нет</p>
                <p style="font-size:14px;">Следите за обновлениями</p>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(item => {
        const now = new Date();
        const eventDate = new Date(item.dateTime);
        const isPast = eventDate < now;
        const isFull = item.remainingPlaces <= 0;

        let statusText = 'Предстоит';
        let statusClass = 'upcoming';
        if (isPast) { statusText = 'Прошло'; statusClass = 'past'; }
        if (isFull && !isPast) { statusText = 'Мест нет'; statusClass = 'fully-booked'; }

        return `
            <div class="card event-card" id="event-${item.id}" data-event-id="${item.id}">
                <!-- 1. ИЗОБРАЖЕНИЕ -->
                ${item.imageUrl ? `
                    <div class="card-image">
                        <img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">
                        <span class="event-status ${statusClass}">${statusText}</span>
                    </div>
                ` : `
                    <div class="card-image no-image">
                        <span class="event-status ${statusClass}">${statusText}</span>
                    </div>
                `}

                <!-- 2. ЗАГОЛОВОК -->
                <h3>${item.title}</h3>

                <!-- 3. ТЕКСТ -->
                <div class="card-text">
                    <div class="card-text-content">
                        <p>${item.description || 'Описание отсутствует'}</p>
                    </div>
                    ${item.description && item.description.length > 100 ? `
                        <button class="read-more-btn" onclick="toggleReadMore(this)">Читать полностью</button>
                    ` : ''}
                </div>

                <!-- 4. ИНФОРМАЦИЯ -->
                <div class="event-info">
                    <div class="event-info-item">
                        <i class="bx bx-calendar"></i>
                        <span>${formatDateTime(item.dateTime)}</span>
                    </div>
                    <div class="event-info-item">
                        <i class="bx bx-map"></i>
                        <span>${item.location || 'Место не указано'}</span>
                    </div>
                    <div class="event-info-item">
                        <i class="bx bx-group"></i>
                        <span>${item.registeredCount || 0} / ${item.maxParticipants || 0}</span>
                        <span class="${item.remainingPlaces > 0 ? 'available' : 'full'}">
                            ${item.remainingPlaces > 0 ? `(свободно: ${item.remainingPlaces})` : '(мест нет)'}
                        </span>
                    </div>
                </div>

                <!-- 5. ДЕЙСТВИЯ -->
                <div class="actions">
                    <!-- ❤️ Сердечко -->
                    <button onclick="addEventReaction(${item.id}, 'HEART')"
                            class="action-btn reaction-btn ${item.userReaction === 'HEART' ? 'active' : ''}"
                            title="Нравится">
                        <i class='bx bx-heart'></i>
                        <span>${item.heartsCount || 0}</span>
                    </button>

                    <!-- ⭐ Закладка -->
                    <button onclick="toggleEventBookmark(${item.id})"
                            class="action-btn bookmark-btn ${item.isBookmarked ? 'active' : ''}"
                            title="В закладки">
                        <i class='bx bx-bookmark'></i>
                    </button>

                    <!-- 💬 Комментарии -->
                    <button onclick="openEventComments(${item.id})"
                            class="action-btn comment-btn"
                            title="Комментарии">
                        <i class='bx bx-message-rounded'></i>
                        <span>${item.commentsCount || 0}</span>
                    </button>

                    <!-- 📝 Записаться -->
                    ${!isPast && !isFull ? `
                        <button onclick="openRegisterModal(${item.id})" class="register-btn">Записаться</button>
                    ` : `
                        <button class="register-btn" disabled>${isPast ? 'Завершено' : 'Мест нет'}</button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// РАСКРЫТИЕ ТЕКСТА "ЧИТАТЬ ПОЛНОСТЬЮ"
// ============================================

function toggleReadMore(button) {
    const cardText = button.closest('.card-text');
    const content = cardText.querySelector('.card-text-content');

    content.classList.toggle('expanded');

    if (content.classList.contains('expanded')) {
        button.textContent = 'Свернуть';
        button.classList.add('expanded');
    } else {
        button.textContent = 'Читать полностью';
        button.classList.remove('expanded');
    }
}

// ============================================
// ЗАКЛАДКИ ДЛЯ СОБЫТИЙ
// ============================================

async function toggleEventBookmark(eventId) {
    try {
        // Проверяем, есть ли в закладках
        const response = await fetch(`${API_URL}/events/${eventId}/bookmarked`, {
            headers: getHeaders()
        });
        const isBookmarked = await response.json();

        await fetch(`${API_URL}/events/${eventId}/bookmark`, {
            method: isBookmarked ? 'DELETE' : 'POST',
            headers: getHeaders()
        });
        loadEvents();

    } catch (error) {
        console.error('Ошибка закладки:', error);
        alert('Ошибка при добавлении в закладки');
    }
}

// ============================================
// ФОРМАТИРОВАНИЕ ДАТЫ И ВРЕМЕНИ
// ============================================

function formatDateTime(dateString) {
    if (!dateString) return 'Дата неизвестна';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// ОТКРЫТИЕ МОДАЛКИ ЗАПИСИ
// ============================================

function openRegisterModal(eventId) {
    document.getElementById('registerEventId').value = eventId;
    document.getElementById('registerMembers').value = 1;
    document.getElementById('registerRelatives').value = 0;
    document.getElementById('registerComment').value = '';

    // Показываем информацию о событии
    const event = eventsCache?.find(e => e.id === eventId);
    if (event) {
        document.getElementById('registerEventInfo').innerHTML = `
            <div class="info-item">
                <span class="info-label">Событие:</span>
                <span class="info-value">${event.title}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Дата:</span>
                <span class="info-value">${new Date(event.dateTime).toLocaleString('ru-RU')}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Место:</span>
                <span class="info-value">${event.location || 'Не указано'}</span>
            </div>
        `;
    }

    Modal.open('registerEventModal');
}

// ============================================
// ОТПРАВКА ФОРМЫ ЗАПИСИ
// ============================================

document.getElementById('registerEventForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const eventId = document.getElementById('registerEventId').value;
    const membersCount = parseInt(document.getElementById('registerMembers').value) || 1;
    const relativesCount = parseInt(document.getElementById('registerRelatives').value) || 0;
    const comment = document.getElementById('registerComment').value.trim();

    console.log('Отправка:', { eventId, membersCount, relativesCount, comment });

    if (membersCount < 1) {
        alert('Количество членов профсоюза должно быть минимум 1');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/events/${eventId}/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                membersCount,
                relativesCount,
                comment
            })
        });

        const result = await response.text();

        if (response.ok) {
            alert(result);
            Modal.close('registerEventModal');
            loadEvents();
        } else {
            alert('Ошибка: ' + result);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения');
    }
});



// ============================================
// SIDEBAR: ЗАКЛАДКИ СОБЫТИЙ
// ============================================

async function loadBookmarkedEvents() {
    const container = document.getElementById('bookmarkedEventsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/bookmarks`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const bookmarks = await response.json();
        const eventBookmarks = bookmarks.filter(b => b.eventId);

        if (eventBookmarks.length === 0) {
            container.innerHTML = '<p class="sidebar-empty">Нет закладок</p>';
            return;
        }

        const latest = eventBookmarks.slice(0, 5);

        container.innerHTML = latest.map(item => `
            <div class="sidebar-item" onclick="scrollToEvent(${item.eventId})">
                <div class="sidebar-item-title">${item.eventTitle || 'Событие'}</div>
                <div class="sidebar-item-meta">
                    📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки закладок:', error);
        container.innerHTML = '<p class="sidebar-empty">Ошибка загрузки</p>';
    }
}

// ============================================
// SIDEBAR: МОИ ЗАПИСИ НА СОБЫТИЯ
// ============================================

async function loadMyEvents() {
    const container = document.getElementById('myEventsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/events/registered`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const events = await response.json();

        if (!events || events.length === 0) {
            container.innerHTML = '<p class="sidebar-empty">Вы не записаны ни на одно событие</p>';
            return;
        }

        const latest = events.slice(0, 5);

        container.innerHTML = latest.map(item => `
            <div class="sidebar-item" onclick="scrollToEvent(${item.id})">
                <div class="sidebar-item-title">${item.title || 'Событие'}</div>
                <div class="sidebar-item-meta">
                    📅 ${new Date(item.dateTime).toLocaleDateString('ru-RU')}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки записей:', error);
        container.innerHTML = '<p class="sidebar-empty">Ошибка загрузки</p>';
    }
}

// ============================================
// ПЕРЕХОД К СОБЫТИЮ ПО КЛИКУ
// ============================================

function scrollToEvent(eventId) {
    const target = document.getElementById(`event-${eventId}`);

    if (!target) {
        alert('Событие не найдено на странице');
        return;
    }

    // Плавный скролл
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Подсветка на 2 секунды
    target.style.transition = 'box-shadow 0.3s ease';
    target.style.boxShadow = '0 0 0 4px rgba(40, 167, 69, 0.4)';

    setTimeout(() => {
        target.style.boxShadow = '';
    }, 2000);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    loadBookmarkedEvents();
    loadMyEvents();

     const params = new URLSearchParams(window.location.search);
        const eventId = params.get('eventId');

        if (eventId) {
            setTimeout(() => {
                const eventCard = document.querySelector(`[data-event-id="${eventId}"]`);
                if (eventCard) {
                    eventCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    eventCard.style.transition = 'box-shadow 0.5s ease';
                    eventCard.style.boxShadow = '0 0 0 4px rgba(0, 112, 184, 0.4)';
                    setTimeout(() => {
                        eventCard.style.boxShadow = '';
                    }, 2000);
                }
            }, 500);

            window.history.replaceState({}, '', 'events.html');
        }
});

// ============================================
// РЕАКЦИИ НА СОБЫТИЯ
// ============================================

async function addEventReaction(eventId, type) {
    try {
        const response = await fetch(`${API_URL}/events/${eventId}/reactions?type=${type}`, {
            method: 'POST',
            headers: getHeaders()
        });

        if (response.ok) {
            loadEvents();  // Перезагрузить список
        } else {
            console.error('Ошибка реакции');
        }
    } catch (error) {
        console.error('Ошибка реакции:', error);
    }
}


