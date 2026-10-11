// ============================================
// ПАНЕЛЬ КОММЕНТАРИЕВ
// ============================================

const CommentsPanel = {
    isOpen: false,
    currentType: null,
    currentId: null,

    // Открыть
    open(type, id) {
        this.currentType = type;
        this.currentId = id;

        let panel = document.getElementById('commentsPanel');

        if (!panel) {
            panel = this.create();
            document.body.appendChild(panel);
        }

        panel.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;

        this.loadComments();
    },

    // Закрыть
    close() {
        const panel = document.getElementById('commentsPanel');
        if (panel) panel.classList.remove('active');
        document.body.style.overflow = '';
        this.isOpen = false;
        this.currentType = null;
        this.currentId = null;
    },

    // Создать панель
    create() {
        const panel = document.createElement('div');
        panel.id = 'commentsPanel';
        panel.className = 'comments-panel';
        panel.innerHTML = `
            <div class="comments-backdrop" onclick="CommentsPanel.close()"></div>
            <div class="comments-container">
                <div class="comments-header">
                    <div class="comments-handle"></div>
                    <h3>Комментарии</h3>
                    <button class="comments-close" onclick="CommentsPanel.close()">
                        <i class='bx bx-x'></i>
                    </button>
                </div>
                <div class="comments-list" id="commentsList">
                    <p style="text-align:center;color:#888;padding:20px;">Загрузка...</p>
                </div>
                <div class="comments-form">
                    <textarea id="commentInput" rows="1" placeholder="Написать комментарий..."></textarea>
                    <button class="comments-send" onclick="CommentsPanel.send()">
                        <i class='bx bx-send'></i>
                    </button>
                </div>
            </div>
        `;
        return panel;
    },

    // Загрузить
    async loadComments() {
        const list = document.getElementById('commentsList');
        if (!list) return;

        try {
            const url = this.currentType === 'news'
                ? `${API_URL}/news/${this.currentId}/comments`
                : `${API_URL}/events/${this.currentId}/comments`;

            const response = await fetch(url, { headers: getHeaders() });
            const comments = await response.json();

            if (!comments || comments.length === 0) {
                list.innerHTML = '<p style="text-align:center;color:#888;padding:20px;">Комментариев пока нет</p>';
                return;
            }

            list.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <div class="comment-avatar">
                        <i class='bx bx-user-circle'></i>
                    </div>
                    <div class="comment-content">
                        <div class="comment-author">${c.userName || 'Неизвестно'}</div>
                        <div class="comment-text">${c.text}</div>
                        <div class="comment-date">${new Date(c.createdAt).toLocaleString('ru-RU')}</div>
                    </div>
                </div>
            `).join('');

        } catch (error) {
            console.error('Ошибка загрузки:', error);
            list.innerHTML = '<p style="text-align:center;color:#dc3545;padding:20px;">Ошибка загрузки</p>';
        }
    },

    // Отправить
    async send() {
        const input = document.getElementById('commentInput');
        const text = input?.value.trim();

        if (!text) return;

        try {
            const url = this.currentType === 'news'
                ? `${API_URL}/news/${this.currentId}/comments`
                : `${API_URL}/events/${this.currentId}/comments`;

            const response = await fetch(url, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                input.value = '';
                this.loadComments();
            } else {
                alert('Ошибка отправки');
            }
        } catch (error) {
            console.error('Ошибка:', error);
            alert('Ошибка подключения');
        }
    }
};

// ============================================
// ОТКРЫТИЕ
// ============================================

function openComments(newsId) {
    CommentsPanel.open('news', newsId);
}

function openEventComments(eventId) {
    CommentsPanel.open('event', eventId);
}