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

    const role = localStorage.getItem('role');

    container.innerHTML = news.map(item => `
        <div class="card" data-news-id="${item.id}">
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
                    <button class="read-more-btn" onclick="toggleReadMore(this)">Читать полностью ▼</button>
                ` : ''}
            </div>

            <!-- 4. МЕТАДАННЫЕ -->
            <div class="meta">
                <span><i class="bx bx-user"></i> ${item.authorName || 'Неизвестный автор'}</span>
                <span><i class="bx bx-calendar"></i> ${formatDate(item.createdAt)}</span>
            </div>

            <!-- 5. ДЕЙСТВИЯ -->
            <div class="actions">
                <button onclick="addReaction(${item.id}, 'LIKE')">👍 ${item.likesCount || 0}</button>
                <button onclick="addReaction(${item.id}, 'HEART')">❤️ ${item.heartsCount || 0}</button>
                <button onclick="addReaction(${item.id}, 'FIRE')">🔥 ${item.firesCount || 0}</button>
                <button onclick="addReaction(${item.id}, 'CLAP')">👏 ${item.clapsCount || 0}</button>
                <button onclick="toggleBookmark(${item.id})" class="btn-sm">⭐</button>
                ${role === 'ADMIN' || role === 'BOSS' ? `
                    <button onclick="deleteNews(${item.id})" class="btn-danger-sm">🗑️</button>
                ` : ''}
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
        button.textContent = 'Свернуть ▲';
        button.classList.add('expanded');
    } else {
        button.textContent = 'Читать полностью ▼';
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
// УДАЛЕНИЕ НОВОСТИ (ADMIN/BOSS)
// ============================================

async function deleteNews(newsId) {
    if (!confirm('Удалить эту новость?')) return;

    try {
        await fetch(`${API_URL}/news/${newsId}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        loadNews();

    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении новости');
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadNews();
});