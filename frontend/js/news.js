//const API_URL = 'http://localhost:8080/api';

// ============================================
// ЗАГРУЗКА НОВОСТЕЙ
// ============================================

async function loadNews() {
    const container = document.getElementById('newsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/news`, {
            headers: getHeaders()
        });

        if (!response.ok) {
            container.innerHTML = '<p style="color:#888;">Ошибка загрузки новостей</p>';
            return;
        }

        const news = await response.json();
        renderNews(container, news);

    } catch (error) {
        console.error('Ошибка:', error);
        container.innerHTML = '<p style="color:#888;">Ошибка подключения к серверу</p>';
    }
}

// ============================================
// ОТРИСОВКА НОВОСТЕЙ
// ============================================

function renderNews(container, news) {
    if (!news || news.length === 0) {
        container.innerHTML = `
            <div class="empty-news">
                <i class="bx bx-news"></i>
                <p>Новостей пока нет</p>
                <p style="font-size:14px;">Будьте первым, кто создаст новость!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = news.map(item => `
        <div class="card" id="news-${item.id}" data-news-id="${item.id}">
            <!-- 1. ИЗОБРАЖЕНИЕ (сверху) -->
            ${item.imageUrl ? `
                <div class="card-image">
                    <img src="${item.imageUrl}" alt="${item.title}" onerror="this.style.display='none'">
                </div>
            ` : ''}

            <!-- 2. ЗАГОЛОВОК -->
            <h3>${item.title}</h3>

            <!-- 3. ТЕКСТ С ОБРЕЗКОЙ -->
            <div class="card-text">
                <div class="card-text-content">
                    <p>${item.content}</p>
                </div>
                ${item.content && item.content.length > 100 ? `
                    <button class="read-more-btn" onclick="toggleReadMore(this)">Читать полностью</button>
                ` : ''}
            </div>

            <!-- 4. МЕТАДАННЫЕ -->
            <div class="meta">
                <span><i class="bx bx-user"></i> ${item.authorName || 'Неизвестный автор'}</span>
                <span><i class="bx bx-calendar"></i> ${formatDate(item.createdAt)}</span>
            </div>

            <!-- 5. ДЕЙСТВИЯ -->
            <div class="actions">
                <!-- ❤️ Сердечко -->
                <button onclick="addReaction(${item.id}, 'HEART')"
                        class="action-btn reaction-btn ${item.userReaction === 'HEART' ? 'active' : ''}"
                        title="Нравится">
                    <i class='bx bx-heart'></i>
                    <span>${item.heartsCount || 0}</span>
                </button>

                <!-- ⭐ Закладка -->
                <button onclick="toggleBookmark(${item.id})"
                        class="action-btn bookmark-btn ${item.isBookmarked ? 'active' : ''}"
                        title="В закладки">
                    <i class='bx bx-bookmark'></i>
                </button>

                <!-- 💬 Комментарий -->
                <button onclick="openComments(${item.id})"
                        class="action-btn comment-btn"
                        title="Комментарии">
                    <i class='bx bx-message-rounded'></i>
                    <span>${item.commentsCount || 0}</span>
                </button>

            </div>
        </div>
    `).join('');
}
// ============================================
// РАСКРЫТИЕ ТЕКСТА "ЧИТАТЬ ПОЛНОСТЬЮ"
// ============================================

function toggleReadMore(button) {
    const cardText = button.closest('.card-text');
    const content = cardText.querySelector('.card-text-content');

    // Переключаем класс expanded
    content.classList.toggle('expanded');

    // Меняем текст кнопки
    if (content.classList.contains('expanded')) {
        button.textContent = 'Свернуть';
        button.classList.add('expanded');
    } else {
        button.textContent = 'Читать полностью';
        button.classList.remove('expanded');
    }
}

// ============================================
// ФОРМАТИРОВАНИЕ ДАТЫ
// ============================================

function formatDate(dateString) {
    if (!dateString) return 'Дата неизвестна';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
}

// ============================================
// РЕАКЦИИ
// ============================================

async function addReaction(newsId, type) {
    try {
        await fetch(`${API_URL}/news/${newsId}/reactions?type=${type}`, {
            method: 'POST',
            headers: getHeaders()
        });
        loadNews();
    } catch (error) {
        console.error('Ошибка реакции:', error);
    }
}

// ============================================
// ЗАКЛАДКИ
// ============================================

async function toggleBookmark(newsId) {
    try {
        const response = await fetch(`${API_URL}/news/${newsId}/bookmarked`, {
            headers: getHeaders()
        });
        const isBookmarked = await response.json();

        await fetch(`${API_URL}/news/${newsId}/bookmark`, {
            method: isBookmarked ? 'DELETE' : 'POST',
            headers: getHeaders()
        });
        loadNews();

    } catch (error) {
        console.error('Ошибка закладки:', error);
    }
}

// ============================================
// SIDEBAR: МНЕ ПОНРАВИЛОСЬ
// ============================================

async function loadLikedNews() {
    const container = document.getElementById('likedNewsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/news/reactions/my`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const data = await response.json();

        if (!data || data.length === 0) {
            container.innerHTML = '<p class="sidebar-empty">Вы ещё не реагировали на новости</p>';
            return;
        }

        const latest = data.slice(0, 5);

        container.innerHTML = latest.map(item => `
            <div class="sidebar-item" onclick="scrollToNews(${item.newsId})">
                <div class="sidebar-item-title">${item.newsTitle || 'Новость'}</div>
                <div class="sidebar-item-meta">
                    <i class="bx bx-heart" style="color: #dc3545;"></i>
                    ${item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString('ru-RU')
                        : ''}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки лайков:', error);
        container.innerHTML = '<p class="sidebar-empty">Ошибка загрузки</p>';
    }
}
// ============================================
// SIDEBAR: ЗАКЛАДКИ НОВОСТЕЙ
// ============================================

async function loadBookmarkedNews() {
    const container = document.getElementById('bookmarkedNewsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/bookmarks`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const bookmarks = await response.json();
        const newsBookmarks = bookmarks.filter(b => b.newsId);

        if (newsBookmarks.length === 0) {
            container.innerHTML = '<p class="sidebar-empty">Нет закладок</p>';
            return;
        }

        const latest = newsBookmarks.slice(0, 5);

        container.innerHTML = latest.map(item => `
            <div class="sidebar-item" onclick="scrollToNews(${item.newsId})">
                <div class="sidebar-item-title">${item.newsTitle || 'Новость'}</div>
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
// ПЕРЕХОД К НОВОСТИ
// ============================================

function scrollToNews(newsId) {
    // Закрываем sidebar? Нет — просто скроллим

    const target = document.getElementById(`news-${newsId}`);
    if (!target) {
        // Если новость не загружена (например, фильтр), перезагружаем
        alert('Новость не найдена на странице. Прокрутите вниз для загрузки.');
        return;
    }

    // Плавный скролл
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Подсветка на 2 секунды
    target.style.transition = 'all 0.3s ease';
    target.style.boxShadow = '0 0 0 4px rgba(15, 52, 96, 0.3)';

    setTimeout(() => {
        target.style.boxShadow = '';
    }, 2000);
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
    loadLikedNews();
    loadBookmarkedNews();

    const params = new URLSearchParams(window.location.search);
        const newsId = params.get('newsId');

        if (newsId) {
            // Ждём загрузки новостей
            setTimeout(() => {
                const newsCard = document.querySelector(`[data-news-id="${newsId}"]`);
                if (newsCard) {
                    newsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Подсветка
                    newsCard.style.transition = 'box-shadow 0.5s ease';
                    newsCard.style.boxShadow = '0 0 0 4px rgba(0, 112, 184, 0.4)';
                    setTimeout(() => {
                        newsCard.style.boxShadow = '';
                    }, 2000);
                }
            }, 500);

            // Убираем параметр из URL
            window.history.replaceState({}, '', 'index.html');
        }
});