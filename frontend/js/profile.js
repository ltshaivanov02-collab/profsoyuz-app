//const API_URL = 'http://localhost:8080/api';

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
    loadApplications('all');
    loadBookmarks();
    loadActivityStats();
    loadCalendar(currentYear, currentMonth);

    document.getElementById('changePasswordBtn')?.addEventListener('click', changePassword);
    document.getElementById('editProfileBtn')?.addEventListener('click', editProfile);

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

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadApplications(this.dataset.filter);
        });
    });
});

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
        if (photo) {
            photo.src = user.photoUrl || 'https://via.placeholder.com/120';
        }

    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
    }
}

function editProfile() {
    const currentName = document.getElementById('fullName').textContent;
    const newName = prompt('Введите новое имя:', currentName);

    if (newName && newName !== currentName) {
        updateProfile(newName);
    }
}

async function updateProfile(fullName) {
    try {
        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ fullName })
        });

        if (response.ok) {
            document.getElementById('fullName').textContent = fullName;
            alert('Профиль обновлён');
        } else {
            alert('Ошибка обновления профиля');
        }

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка подключения к серверу');
    }
}

function changePassword() {
    const oldPassword = prompt('Введите текущий пароль:');
    if (!oldPassword) return;

    const newPassword = prompt('Введите новый пароль (мин. 6 символов):');
    if (!newPassword || newPassword.length < 6) {
        alert('Пароль должен быть не менее 6 символов');
        return;
    }

    const confirmPassword = prompt('Подтвердите новый пароль:');
    if (newPassword !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }

    changePasswordRequest(oldPassword, newPassword, confirmPassword);
}

async function changePasswordRequest(oldPassword, newPassword, confirmPassword) {
    try {
        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Пароль успешно изменён!');
            if (data.token) localStorage.setItem('token', data.token);
        } else {
            alert(`Ошибка: ${data.message || 'Неизвестная ошибка'}`);
        }

    } catch (error) {
        console.error('Ошибка смены пароля:', error);
        alert('Ошибка подключения к серверу');
    }
}

// ============================================
// 2. ЗАЯВЛЕНИЯ
// ============================================

async function loadApplications(filter) {
    const container = document.getElementById('applicationsList');

    try {
        const response = await fetch(`${API_URL}/applications/my`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки заявлений');

        let applications = await response.json();

        if (!applications || applications.length === 0) {
            container.innerHTML = '<p style="color:#888;">У вас пока нет заявлений</p>';
            return;
        }

        if (filter !== 'all') {
            applications = applications.filter(app => app.status === filter);
        }

        if (applications.length === 0) {
            container.innerHTML = `<p style="color:#888;">Нет заявлений со статусом "${filter}"</p>`;
            return;
        }

        container.innerHTML = applications.map(item => `
            <div class="application-item">
                <div class="app-info">
                    <div class="app-text">${item.text}</div>
                    <div class="app-meta">
                        <span>📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                        <span class="badge badge-${item.status?.toLowerCase() || 'pending'}">${item.status || 'PENDING'}</span>
                    </div>
                    ${item.adminResponse ? `<div style="font-size:13px;color:#555;margin-top:4px;">📝 ${item.adminResponse}</div>` : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки заявлений:', error);
        container.innerHTML = '<p style="color:#888;">Ошибка загрузки</p>';
    }
}

// ============================================
// 3. ЗАКЛАДКИ
// ============================================

async function loadBookmarks() {
    const container = document.getElementById('bookmarksList');

    try {
        const response = await fetch(`${API_URL}/bookmarks`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки закладок');

        const bookmarks = await response.json();

        if (!bookmarks || bookmarks.length === 0) {
            container.innerHTML = '<p style="color:#888;">У вас пока нет закладок</p>';
            return;
        }

        container.innerHTML = bookmarks.map(item => `
            <div class="bookmark-item">
                <span class="bookmark-title">
                    ${item.newsTitle ? `📰 ${item.newsTitle}` : ''}
                    ${item.eventTitle ? `📅 ${item.eventTitle}` : ''}
                </span>
                <span class="bookmark-type">📅 ${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки закладок:', error);
        container.innerHTML = '<p style="color:#888;">Ошибка загрузки</p>';
    }
}

// ============================================
// 4. АКТИВНОСТЬ
// ============================================

async function loadActivityStats() {
    try {
        const token = localStorage.getItem('token');

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

        // События
        const eventsRes = await fetch(`${API_URL}/events/registered`, { headers: getHeaders() });
        const events = await eventsRes.json();
        document.getElementById('activityEvents').textContent = events?.length || 0;

    } catch (error) {
        console.error('Ошибка загрузки активности:', error);
    }
}

// ============================================
// 5. КАЛЕНДАРЬ
// ============================================

async function loadCalendar(year, month) {
    const grid = document.getElementById('calendarGrid');
    const label = document.getElementById('currentMonthLabel');

    if (!grid || !label) return;

    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    label.textContent = `${monthNames[month]} ${year}`;

    const events = await getUserEvents(year, month + 1);

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

async function showDayEvents(dateStr, year, month, day) {
    const container = document.getElementById('selectedDayEvents');
    if (!container) return;

    const events = await getUserEvents(year, month + 1);
    const dayEvents = events.filter(e => e.dateTime && e.dateTime.startsWith(dateStr));

    if (dayEvents.length === 0) {
        container.innerHTML = `<p style="color:#888;">📅 ${dateStr} — событий нет</p>`;
        return;
    }

    container.innerHTML = `
        <div style="font-weight:600;margin-bottom:8px;">📅 ${dateStr}</div>
        ${dayEvents.map(e => `
            <div style="padding:6px 10px;background:#fff;border-radius:6px;margin-bottom:4px;border-left:3px solid #0f3460;">
                <strong>${e.title}</strong>
                <div style="font-size:13px;color:#888;">${e.location || ''} • ${new Date(e.dateTime).toLocaleTimeString('ru-RU', {hour:'2-digit', minute:'2-digit'})}</div>
            </div>
        `).join('')}
    `;
}
