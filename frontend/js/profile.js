//const API_URL = 'http://localhost:8080/api';

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let myApplicationsCache = [];
let myQuestionsCache = [];
let currentMyAppFileUrl = null;

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadActivityStats();

    // Календарь
    document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        loadCalendar(currentYear, currentMonth);
    });

    document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        loadCalendar(currentYear, currentMonth);
    });

    // Фото профиля
    const photoInput = document.getElementById('photoUpload');
    if (photoInput) {
        photoInput.addEventListener('change', uploadProfilePhoto);
    }

    const removePhotoBtn = document.getElementById('removePhotoBtn');
    if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', removeProfilePhoto);
    }

    // ✅ Проверка ?openSettings=true
    checkOpenSettings();
});

// ✅ Функция ВНЕ DOMContentLoaded
function checkOpenSettings() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('openSettings') === 'true') {
        window.history.replaceState({}, '', 'profile.html');
        setTimeout(() => {
            openSettingsModal();
        }, 300);
    }
}

// ============================================
// 1. ПРОФИЛЬ
// ============================================

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки профиля');

        const user = await response.json();

        document.getElementById('fullName').textContent = user.fullName || '—';
        document.getElementById('username').textContent = user.username || '—';
        document.getElementById('roleBadge').textContent = user.role || 'USER';
        document.getElementById('roleText').textContent = user.role || '—';
        document.getElementById('email').textContent = user.email || '—';

        const photo = document.getElementById('profilePhoto');
        const settingsPhoto = document.getElementById('settingsPhoto');

        if (user.photoUrl && (user.photoUrl.startsWith('data:image') || user.photoUrl.startsWith('http'))) {
            if (photo) photo.src = user.photoUrl;
            if (settingsPhoto) settingsPhoto.src = user.photoUrl;
        } else {
            const name = encodeURIComponent(user.fullName || 'User');
            const defaultUrl = `https://ui-avatars.com/api/?name=${name}&background=0f3460&color=fff&size=120`;
            if (photo) photo.src = defaultUrl;
            if (settingsPhoto) settingsPhoto.src = defaultUrl;
        }

        // Заполняем поля в настройках
        document.getElementById('settingsFullName').value = user.fullName || '';
        document.getElementById('settingsEmail').value = user.email || '';

    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

// ============================================
// 2. АКТИВНОСТЬ
// ============================================

async function loadActivityStats() {
    try {
        const [appsRes, questionsRes, bookmarksRes] = await Promise.all([
            fetch(`${API_URL}/applications/my`, { headers: getHeaders() }),
            fetch(`${API_URL}/questions/my`, { headers: getHeaders() }),
            fetch(`${API_URL}/bookmarks`, { headers: getHeaders() })
        ]);

        const apps = await appsRes.json();
        const questions = await questionsRes.json();
        const bookmarks = await bookmarksRes.json();

        document.getElementById('activityApplications').textContent = apps?.length || 0;
        document.getElementById('activityQuestions').textContent = questions?.length || 0;
        document.getElementById('activityBookmarks').textContent = bookmarks?.length || 0;
        document.getElementById('activityEvents').textContent = 0;

    } catch (error) {
        console.error('Ошибка загрузки активности:', error);
    }
}

// ============================================
// 3. НАСТРОЙКИ ПРОФИЛЯ
// ============================================

function openSettingsModal() {
    loadProfile();
    Modal.open('settingsModal');
}

async function saveProfileSettings() {
    const fullName = document.getElementById('settingsFullName').value.trim();
    const email = document.getElementById('settingsEmail').value.trim();

    if (!fullName || !email) {
        alert('Заполните все поля');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ fullName, email })
        });

        if (response.ok) {
            alert('✅ Профиль обновлён!');
            loadProfile();
            Modal.close('settingsModal');
        } else {
            alert('❌ Ошибка обновления');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка подключения');
    }
}

// ============================================
// ПОКАЗАТЬ / СКРЫТЬ ПАРОЛЬ
// ============================================

function togglePasswordVisibility(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!input || !icon) {
        console.warn('Не найдено:', inputId, iconId);
        return;
    }

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bx bx-hide';
    } else {
        input.type = 'password';
        icon.className = 'bx bx-show';
    }
}

async function saveNewPassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!oldPassword || !newPassword || !confirmPassword) {
        alert('Заполните все поля');
        return;
    }

    if (newPassword.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Пароль изменён!');
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            alert('❌ Ошибка: ' + (data.message || 'Неизвестная ошибка'));
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка подключения');
    }
}

// ============================================
// 4. ЗАГРУЗКА И УДАЛЕНИЕ ФОТО
// ============================================

async function uploadProfilePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите изображение');
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Файл слишком большой! Максимум 5MB');
        return;
    }

    try {
        const compressedBase64 = await compressImage(file, 300, 300);

        const response = await fetch(`${API_URL}/users/profile/photo`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ photoUrl: compressedBase64 })
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('profilePhoto').src = data.photoUrl || compressedBase64;
            document.getElementById('settingsPhoto').src = data.photoUrl || compressedBase64;
            alert('✅ Фото обновлено!');
        } else {
            alert('❌ Ошибка загрузки фото');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка подключения');
    }
}

function compressImage(file, maxWidth, maxHeight) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

// ============================================
// 5. КАЛЕНДАРЬ
// ============================================

function openCalendarModal() {
    Modal.open('calendarModal');
    loadCalendar(currentYear, currentMonth);

    // ✅ Показать ближайшее событие
    setTimeout(() => showNearestEvent(), 300);
}

// ============================================
// ЗАГРУЗКА КАЛЕНДАРЯ
// ============================================

let calendarEventsCache = [];        // Кэш событий календаря
let currentCalendarMonth = null;      // Текущий месяц/год

async function loadCalendar(year, month) {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('currentMonthLabel');

    if (!grid || !label) return;

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    label.textContent = `${monthNames[month]} ${year}`;

    const events = await getUserEvents(year, month + 1);
    calendarEventsCache = events || [];
    currentCalendarMonth = { year, month };

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = '';
    const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    dayNames.forEach(name => {
        html += `<div class="day-name">${name}</div>`;
    });

    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startOffset; i++) {
        html += `<div class="day empty"></div>`;
    }

    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const hasEvent = events.some(e => e.dateTime && e.dateTime.startsWith(dateStr));
        const isToday = (day === todayDate && month === todayMonth && year === todayYear);

        html += `
            <div class="day ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}"
                 onclick="showDayEvents('${dateStr}', ${year}, ${month}, ${day})">
                ${day}
            </div>
        `;
    }

    grid.innerHTML = html;
}

// ============================================
// ПОЛУЧИТЬ СОБЫТИЯ ПОЛЬЗОВАТЕЛЯ ЗА МЕСЯЦ
// ============================================

async function getUserEvents(year, month) {
    try {
        const response = await fetch(`${API_URL}/events/calendar?year=${year}&month=${month}`, {
            headers: getHeaders()
        });

        if (!response.ok) return [];
        return await response.json();

    } catch (error) {
        console.error('Ошибка загрузки календаря:', error);
        return [];
    }
}

// ============================================
// ПОКАЗАТЬ СОБЫТИЯ КОНКРЕТНОГО ДНЯ
// ============================================

async function showDayEvents(dateStr, year, month, day) {
    const container = document.getElementById('selectedDayEvents');
    if (!container) return;

    // ✅ Берём из кэша, если месяц совпадает
    let events = calendarEventsCache;

    if (!currentCalendarMonth ||
        currentCalendarMonth.year !== year ||
        currentCalendarMonth.month !== month) {
        events = await getUserEvents(year, month + 1);
        calendarEventsCache = events;
        currentCalendarMonth = { year, month };
    }

    const dayEvents = events.filter(e => e.dateTime && e.dateTime.startsWith(dateStr));

    if (dayEvents.length === 0) {
        container.innerHTML = `
            <div class="day-events-empty">
                <p>${new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="font-size:13px;color:#aaa;">Событий нет</p>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="day-events-header">
            ${new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div class="day-events-list">
            ${dayEvents.map(e => `
                <div class="day-event-item" onclick="viewCalendarEvent(${e.id})">
                    <div class="day-event-time">
                        ${new Date(e.dateTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div class="day-event-info">
                        <strong>${e.title}</strong>
                        <span>${e.location || 'Не указано'}</span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================
// ПОКАЗАТЬ БЛИЖАЙШЕЕ СОБЫТИЕ
// ============================================

async function showNearestEvent() {
    const container = document.getElementById('selectedDayEvents');
    if (!container) return;

    // ✅ Загружаем все события за текущий и следующий месяц
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const currentMonthEvents = await getUserEvents(currentYear, currentMonth + 1);
    const nextMonthEvents = await getUserEvents(
        currentMonth === 11 ? currentYear + 1 : currentYear,
        currentMonth === 11 ? 1 : currentMonth + 2
    );

    const allEvents = [...currentMonthEvents, ...nextMonthEvents];

    // ✅ Фильтруем только будущие
    const futureEvents = allEvents
        .filter(e => e.dateTime && new Date(e.dateTime) >= today)
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

    if (futureEvents.length === 0) {
        container.innerHTML = `
            <div class="day-events-empty">
                <p>Ближайших событий нет</p>
                <p style="font-size:13px;color:#aaa;">Вы пока не записаны ни на одно событие</p>
            </div>
        `;
        return;
    }

    const nearest = futureEvents[0];
    const nearestDate = new Date(nearest.dateTime);

    container.innerHTML = `
        <div class="day-events-header">
            Ближайшее событие
        </div>
        <div class="day-events-list">
            <div class="day-event-item featured" onclick="viewCalendarEvent(${nearest.id})">
                <div class="day-event-time">
                    ${nearestDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                    <br>
                    ${nearestDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div class="day-event-info">
                    <strong>${nearest.title}</strong>
                    <span>${nearest.location || 'Не указано'}</span>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// ПРОСМОТР СОБЫТИЯ ИЗ КАЛЕНДАРЯ
// ============================================

async function viewCalendarEvent(eventId) {
    try {
        const response = await fetch(`${API_URL}/events/${eventId}`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Событие не найдено');

        const data = await response.json();

        document.getElementById('calendarEventViewTitle').textContent = data.title || 'Событие';

        const eventDate = new Date(data.dateTime);
        const now = new Date();
        const isPast = eventDate < now;
        const remainingPlaces = (data.maxParticipants || 0) - (data.registeredCount || 0);

        let statusText = 'Предстоит';
        let statusClass = 'upcoming';
        if (isPast) { statusText = 'Прошло'; statusClass = 'past'; }
        if (remainingPlaces <= 0) { statusText = 'Мест нет'; statusClass = 'fully-booked'; }

        document.getElementById('calendarEventViewContent').innerHTML = `
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

        Modal.open('calendarEventViewModal');

    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Не удалось загрузить событие');
    }
}

// ============================================
// 6. МОИ ЗАЯВЛЕНИЯ
// ============================================

async function openMyApplications() {
    Modal.open('myApplicationsModal');
    const container = document.getElementById('myApplicationsList');
    container.innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/applications/my`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const data = await response.json();
        myApplicationsCache = data || [];

        if (myApplicationsCache.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#888;">У вас пока нет заявлений</p>';
            return;
        }

       container.innerHTML = myApplicationsCache.map(item => `
           <div class="my-list-item" onclick="viewMyApplication(${item.id})">
               <div class="my-list-item-header">
                   <strong>${item.subject || item.text || 'Без темы'}</strong>
                   <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">
                       ${getStatusText(item.status)}
                   </span>
               </div>
               <div class="my-list-item-meta">
                   <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                   ${item.adminResponse ? '<span class="has-answer">Есть ответ</span>' : ''}
               </div>
           </div>
       `).join('');

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;">Ошибка загрузки</p>';
    }
}

function viewMyApplication(id) {
    const app = myApplicationsCache.find(a => a.id === id);
    if (!app) {
        alert('❌ Заявление не найдено');
        return;
    }

    Modal.close('myApplicationsModal');
    Modal.open('myApplicationViewModal');

    document.getElementById('myApplicationViewTitle').textContent = 'Заявление #' + app.id;

    const status = getStatusInfo(app.status);

    let html = `
        <div class="app-detail">
            <div class="app-detail-meta">
                <div class="app-detail-meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${new Date(app.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="app-detail-meta-item">
                    <span class="label">Статус:</span>
                    <span class="badge badge-${status.class}">${status.text}</span>
                </div>
            </div>

            ${app.subject ? `
                <div class="app-detail-section">
                    <h3>Тема</h3>
                    <p>${app.subject}</p>
                </div>
            ` : ''}

            <div class="app-detail-section">
                <h3>Текст заявления</h3>
                <p>${app.text || 'Нет текста'}</p>
            </div>

            ${app.fileUrl ? `
                <div class="app-detail-section">
                    <h3>Прикреплённый документ</h3>
                    <button onclick="openMyApplicationPdf()" class="document-link">
                        Открыть PDF
                    </button>
                </div>
            ` : ''}

            ${app.adminResponse ? `
                <div class="app-detail-response">
                    <h3>Ответ администратора</h3>
                    <p>${app.adminResponse}</p>
                </div>
            ` : `
                <div class="app-detail-pending">
                    <p>Заявление ещё не обработано</p>
                </div>
            `}
        </div>
    `;

    document.getElementById('myApplicationViewContent').innerHTML = html;
    currentMyAppFileUrl = app.fileUrl || null;
}

// ============================================
// ВЕРНУТЬСЯ К СПИСКУ ЗАЯВЛЕНИЙ
// ============================================

function backToApplicationsList() {
    // Закрываем детали
    Modal.close('myApplicationViewModal');

    // Открываем список
    Modal.open('myApplicationsModal');
}

function openMyApplicationPdf() {
    if (!currentMyAppFileUrl) {
        alert('PDF не найден');
        return;
    }

    try {
        let blobUrl;

        if (currentMyAppFileUrl.startsWith('data:application/pdf')) {
            const base64Data = currentMyAppFileUrl.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            blobUrl = URL.createObjectURL(blob);
        } else {
            blobUrl = currentMyAppFileUrl;
        }

        window.open(blobUrl, '_blank');
    } catch (error) {
        console.error('Ошибка открытия PDF:', error);
        alert('❌ Не удалось открыть PDF');
    }
}

// ============================================
// 7. МОИ ВОПРОСЫ
// ============================================

async function openMyQuestions() {
    Modal.open('myQuestionsModal');
    const container = document.getElementById('myQuestionsList');
    container.innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/questions/my`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const data = await response.json();
        myQuestionsCache = data || [];

        if (myQuestionsCache.length === 0) {
            container.innerHTML = '<p style="text-align:center;color:#888;">У вас пока нет вопросов</p>';
            return;
        }

        container.innerHTML = myQuestionsCache.map(item => `
            <div class="my-list-item" onclick="viewMyQuestion(${item.id})">
                <div class="my-list-item-header">
                    <strong>${item.text || 'Без текста'}</strong>
                    <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">
                        ${getStatusText(item.status)}
                    </span>
                </div>
                <div class="my-list-item-meta">
                    <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                    ${item.adminAnswer ? '<span class="has-answer">Есть ответ</span>' : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;">Ошибка загрузки</p>';
    }
}

function viewMyQuestion(id) {
    const question = myQuestionsCache.find(q => q.id === id);
    if (!question) {
        alert('❌ Вопрос не найден');
        return;
    }

    Modal.close('myQuestionsModal');
    Modal.open('myQuestionViewModal');

    document.getElementById('myQuestionViewTitle').textContent = 'Вопрос #' + question.id;

    const status = getStatusInfo(question.status);

    let html = `
    <div class="app-detail">
        <div class="app-detail-meta">
            <div class="app-detail-meta-item">
                <span class="label">Дата:</span>
                <span class="value">${new Date(question.createdAt).toLocaleString('ru-RU')}</span>
            </div>
            <div class="app-detail-meta-item">
                <span class="label">Статус:</span>
                <span class="badge badge-${status.class}">${status.text}</span>
            </div>
        </div>

        <div class="app-detail-section">
            <h3>Вопрос</h3>
            <p>${question.text || 'Нет текста'}</p>
        </div>

        ${question.adminAnswer ? `
            <div class="app-detail-response">
                <h3>Ответ администратора</h3>
                <p>${question.adminAnswer}</p>
            </div>
        ` : `
            <div class="app-detail-pending">
                <p>Вопрос ещё не обработан</p>
            </div>
        `}
    </div>
`;

document.getElementById('myQuestionViewContent').innerHTML = html;
}

// ============================================
// ВЕРНУТЬСЯ К СПИСКУ ВОПРОСОВ
// ============================================

function backToQuestionsList() {
    // Закрываем детали
    Modal.close('myQuestionViewModal');

    // Открываем список
    Modal.open('myQuestionsModal');
}

// ============================================
// 8. ЗАКЛАДКИ
// ============================================

let allBookmarksCache = [];
let currentBookmarkFilter = 'all';   // 'all' | 'news' | 'events'

async function openBookmarksModal() {
    Modal.open('bookmarksModal');
    currentBookmarkFilter = 'all';

    // Сбрасываем активный таб
    document.querySelectorAll('.bookmark-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.bookmark-tab[data-type="all"]')?.classList.add('active');

    await loadBookmarks();
}

async function loadBookmarks() {
    const container = document.getElementById('bookmarksModalList');
    if (!container) return;

    container.innerHTML = '<p style="text-align:center;color:#888;">Загрузка...</p>';

    try {
        const response = await fetch(`${API_URL}/bookmarks`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const bookmarks = await response.json();
        allBookmarksCache = bookmarks || [];

        renderBookmarks();

    } catch (error) {
        console.error('Ошибка загрузки закладок:', error);
        container.innerHTML = '<p style="text-align:center;color:#dc3545;">Ошибка загрузки</p>';
    }
}

function setBookmarkFilter(type, btn) {
    currentBookmarkFilter = type;
    document.querySelectorAll('.bookmark-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    renderBookmarks();
}

function renderBookmarks() {
    const container = document.getElementById('bookmarksModalList');
    if (!container) return;

    let bookmarks = allBookmarksCache;

    // Фильтрация
    if (currentBookmarkFilter === 'news') {
        bookmarks = bookmarks.filter(b => b.newsId);
    } else if (currentBookmarkFilter === 'events') {
        bookmarks = bookmarks.filter(b => b.eventId);
    }

    if (bookmarks.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#888;">У вас пока нет закладок</p>';
        return;
    }

    container.innerHTML = bookmarks.map(item => {
        const isNews = !!item.newsId;
        const isEvent = !!item.eventId;
        const title = item.newsTitle || item.eventTitle || 'Без названия';
        const typeClass = isNews ? 'news' : 'event';
        const typeLabel = isNews ? 'Новость' : 'Событие';

        return `
            <div class="my-list-item bookmark-item" onclick="openBookmark(${item.newsId || 'null'}, ${item.eventId || 'null'})">
                <div class="my-list-item-header">
                    <strong>${title}</strong>
                    <span class="bookmark-type ${typeClass}">${typeLabel}</span>
                </div>
                <div class="my-list-item-meta">
                    <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// ПЕРЕХОД НА НОВОСТЬ/СОБЫТИЕ ПО ЗАКЛАДКЕ
// ============================================

function openBookmark(newsId, eventId) {
    if (newsId) {
        // ✅ Переход на новость
        window.location.href = `index.html?newsId=${newsId}#news-${newsId}`;
    } else if (eventId) {
        // ✅ Переход на событие
        window.location.href = `events.html?eventId=${eventId}#event-${eventId}`;
    }
}

// ============================================
// АККОРДЕОН НАСТРОЕК
// ============================================

function toggleAccordion(accordionId) {
    const accordion = document.getElementById(accordionId);
    if (!accordion) return;

    // ✅ Закрываем другие аккордеоны
    document.querySelectorAll('.accordion').forEach(acc => {
        if (acc.id !== accordionId) {
            acc.classList.remove('open');
        }
    });

    // ✅ Переключаем текущий
    accordion.classList.toggle('open');
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

function getStatusInfo(status) {
    const map = {
        'PENDING': { text: '⏳ В обработке', class: 'pending' },
        'APPROVED': { text: '✅ Одобрено', class: 'approved' },
        'REJECTED': { text: '❌ Отклонено', class: 'rejected' },
        'ANSWERED': { text: '💬 Отвечено', class: 'approved' }
    };
    return map[status] || map['PENDING'];
}

function getStatusText(status) {
    const info = getStatusInfo(status);
    return info.text;
}
