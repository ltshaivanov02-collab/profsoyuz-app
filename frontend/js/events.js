//const API_URL = 'http://localhost:8080/api';

// ============================================
// ЗАГРУЗКА СОБЫТИЙ
// ============================================

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
        renderEvents(container, events);

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="color:#888;">❌ Ошибка подключения к серверу</p>';
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
        const isRegistered = item.isRegistered || false;

        let statusText = 'Предстоит';
        let statusClass = 'upcoming';
        if (isPast) { statusText = 'Прошло'; statusClass = 'past'; }
        if (isFull && !isPast) { statusText = 'Мест нет'; statusClass = 'fully-booked'; }

        return `
            <div class="card event-card" data-event-id="${item.id}">
                <!-- 1. ИЗОБРАЖЕНИЕ (сверху) -->
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

                <!-- 3. ТЕКСТ С ОБРЕЗКОЙ -->
                <div class="card-text">
                    <div class="card-text-content">
                        <p>${item.description || 'Описание отсутствует'}</p>
                    </div>
                    ${item.description && item.description.length > 100 ? `
                        <button class="read-more-btn" onclick="toggleReadMore(this)">Читать полностью ▼</button>
                    ` : ''}
                </div>

                <!-- 4. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ -->
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
                    ${!isPast && !isFull ? `
                        <button onclick="registerForEvent(${item.id})" class="register-btn">
                            📝 Записаться
                        </button>
                    ` : `
                        <button class="register-btn" disabled>
                            ${isPast ? '⏳ Завершено' : '❌ Мест нет'}
                        </button>
                    `}
                    <button onclick="checkRegistration(${item.id})" class="btn btn-sm btn-secondary">
                        🔍 Проверить
                    </button>
                    <button onclick="toggleEventBookmark(${item.id})" class="btn-sm bookmark-btn">
                        ⭐
                    </button>
                    <!-- ❌ КНОПКА УДАЛЕНИЯ УДАЛЕНА -->
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
        button.textContent = 'Свернуть ▲';
        button.classList.add('expanded');
    } else {
        button.textContent = 'Читать полностью ▼';
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
// ЗАПИСЬ НА СОБЫТИЕ
// ============================================

async function registerForEvent(eventId) {
    const quantity = prompt('Сколько мест забронировать? (по умолчанию 1)', '1');
    if (quantity === null) return;
    const qty = parseInt(quantity) || 1;

    try {
        const response = await fetch(`${API_URL}/events/${eventId}/register?quantity=${qty}`, {
            method: 'POST',
            headers: getHeaders()
        });
        const result = await response.text();
        alert(result);
        loadEvents();

    } catch (error) {
        console.error('Ошибка записи:', error);
        alert('Ошибка подключения к серверу');
    }
}

// ============================================
// ПРОВЕРКА ЗАПИСИ
// ============================================

async function checkRegistration(eventId) {
    try {
        const response = await fetch(`${API_URL}/events/${eventId}/registered`, {
            headers: getHeaders()
        });
        const isRegistered = await response.json();
        alert(isRegistered ? '✅ Вы записаны на это событие' : '❌ Вы не записаны на это событие');

    } catch (error) {
        console.error('Ошибка проверки:', error);
        alert('Ошибка подключения к серверу');
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
});
