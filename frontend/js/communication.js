//const API_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', function() {

    // Переключение типа
    const typeOptions = document.querySelectorAll('.type-option');
    const fileGroup = document.getElementById('fileGroup');
    const submitBtn = document.getElementById('submitBtn');
    const result = document.getElementById('result');

    typeOptions.forEach(option => {
        option.addEventListener('click', function() {
            typeOptions.forEach(o => o.classList.remove('active'));
            this.classList.add('active');

            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;

            const type = radio.value;
            if (type === 'application') {
                fileGroup.classList.remove('hidden');
                submitBtn.textContent = 'Отправить заявление';
            } else {
                fileGroup.classList.add('hidden');
                submitBtn.textContent = 'Отправить вопрос';
            }

            result.className = 'result-area';
            result.style.display = 'none';
        });
    });

    // Имя файла
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                fileName.textContent = this.files[0].name;
            } else {
                fileName.textContent = '';
            }
        });
    }

    // Отправка формы
    const form = document.getElementById('communicationForm');
    if (form) {
        form.addEventListener('submit', submitCommunication);
    }

    loadMyApplicationsSidebar();
    loadMyQuestionsSidebar();
});

async function submitCommunication(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="type"]:checked').value;
    const subject = document.getElementById('subject')?.value.trim() || '';   // ✅ ДОБАВИТЬ
    const message = document.getElementById('message').value.trim();
    const result = document.getElementById('result');
    const fileInput = document.getElementById('fileInput');
    const file = fileInput?.files[0];

    if (!message) {
        showResult(result, 'Пожалуйста, заполните текст обращения', 'error');
        return;
    }

    showResult(result, 'Отправка...', 'info');

    try {
        const token = localStorage.getItem('token');

        if (type === 'application') {
            let fileUrl = null;
            if (file) {
                fileUrl = await fileToBase64(file);
            }

            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    subject: subject,        // ✅ ДОБАВИТЬ
                    text: message,
                    fileUrl: fileUrl
                })
            });

            const data = await response.json();

            if (response.ok) {
                showResult(result, `Заявление отправлено! Статус: ${data.status || 'PENDING'}`, 'success');
                document.getElementById('communicationForm').reset();
                document.getElementById('fileName').textContent = '';
            } else {
                showResult(result, `Ошибка: ${data.message || data.messege || 'Неизвестная ошибка'}`, 'error');
            }

        } else {
            const response = await fetch(`${API_URL}/questions`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text: message })
            });

            const data = await response.json();

            if (response.ok) {
                showResult(result, `Вопрос отправлен! Статус: ${data.status || 'PENDING'}`, 'success');
                document.getElementById('communicationForm').reset();
            } else {
                showResult(result, `Ошибка: ${data.message || data.messege || 'Неизвестная ошибка'}`, 'error');
            }
        }

    } catch (error) {
        console.error('Ошибка:', error);
        showResult(result, 'Ошибка подключения к серверу', 'error');
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}

function showResult(container, message, type) {
    container.textContent = message;
    container.className = 'result-area ' + type;
    container.style.display = 'block';

    clearTimeout(window.resultTimer);
    window.resultTimer = setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}

// ============================================
// SIDEBAR: МОИ ЗАЯВЛЕНИЯ (С МОДАЛКОЙ)
// ============================================

let myApplicationsCache = [];

async function loadMyApplicationsSidebar() {
    const container = document.getElementById('myApplicationsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/applications/my`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const data = await response.json();
        myApplicationsCache = data || [];

        if (myApplicationsCache.length === 0) {
            container.innerHTML = '<p class="sidebar-empty">Вы ещё не подавали заявлений</p>';
            return;
        }

        const latest = myApplicationsCache.slice(0, 5);

        container.innerHTML = latest.map(item => `
            <div class="sidebar-item" onclick="viewMyApplicationFromSidebar(${item.id})">
                <div class="sidebar-item-title">${item.subject || item.text || 'Без темы'}</div>
                <div class="sidebar-item-meta">
                    <span>${getStatusText(item.status)}</span>
                    <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки заявлений:', error);
        container.innerHTML = '<p class="sidebar-empty">Ошибка загрузки</p>';
    }
}

// ============================================
// SIDEBAR: МОИ ВОПРОСЫ (С МОДАЛКОЙ)
// ============================================

let myQuestionsCache = [];

async function loadMyQuestionsSidebar() {
    const container = document.getElementById('myQuestionsList');
    if (!container) return;

    try {
        const response = await fetch(`${API_URL}/questions/my`, {
            headers: getHeaders()
        });

        if (!response.ok) throw new Error('Ошибка загрузки');

        const data = await response.json();
        myQuestionsCache = data || [];

        if (myQuestionsCache.length === 0) {
            container.innerHTML = '<p class="sidebar-empty">Вы ещё не задавали вопросов</p>';
            return;
        }

        const latest = myQuestionsCache.slice(0, 5);

        container.innerHTML = latest.map(item => `
            <div class="sidebar-item" onclick="viewMyQuestionFromSidebar(${item.id})">
                <div class="sidebar-item-title">${item.text || 'Без текста'}</div>
                <div class="sidebar-item-meta">
                    <span>${getStatusText(item.status)}</span>
                    <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Ошибка загрузки вопросов:', error);
        container.innerHTML = '<p class="sidebar-empty">Ошибка загрузки</p>';
    }
}

// ============================================
// ОТКРЫТИЕ МОДАЛКИ ДЕТАЛЕЙ ЗАЯВЛЕНИЯ
// ============================================

function viewMyApplicationFromSidebar(id) {
    const app = myApplicationsCache.find(a => a.id === id);
    if (!app) {
        alert('Заявление не найдено');
        return;
    }

    // ✅ Используем СУЩЕСТВУЮЩУЮ модалку
    Modal.open('myApplicationViewModal');

    document.getElementById('myApplicationViewTitle').textContent = 'Заявление #' + app.id;

    const statusInfo = getStatusInfo(app.status);

    document.getElementById('myApplicationViewContent').innerHTML = `
        <div class="app-detail">
            <div class="app-detail-meta">
                <div class="app-detail-meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${new Date(app.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="app-detail-meta-item">
                    <span class="label">Статус:</span>
                    <span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>
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
                    <button onclick="openMyApplicationPdf('${encodeURIComponent(app.fileUrl)}')" class="document-link">
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
}

function viewMyQuestionFromSidebar(id) {
    const question = myQuestionsCache.find(q => q.id === id);
    if (!question) {
        alert('Вопрос не найден');
        return;
    }

    // ✅ Используем СУЩЕСТВУЮЩУЮ модалку
    Modal.open('myQuestionViewModal');

    document.getElementById('myQuestionViewTitle').textContent = 'Вопрос #' + question.id;

    const statusInfo = getStatusInfo(question.status);

    document.getElementById('myQuestionViewContent').innerHTML = `
        <div class="app-detail">
            <div class="app-detail-meta">
                <div class="app-detail-meta-item">
                    <span class="label">Дата:</span>
                    <span class="value">${new Date(question.createdAt).toLocaleString('ru-RU')}</span>
                </div>
                <div class="app-detail-meta-item">
                    <span class="label">Статус:</span>
                    <span class="badge badge-${statusInfo.class}">${statusInfo.text}</span>
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
}

// ============================================
// ОТКРЫТИЕ PDF
// ============================================

function openMyApplicationPdf(encodedUrl) {
    const fileUrl = decodeURIComponent(encodedUrl);
    if (!fileUrl) return;

    try {
        let blobUrl;

        if (fileUrl.startsWith('data:application/pdf')) {
            const base64Data = fileUrl.split(',')[1];
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            blobUrl = URL.createObjectURL(blob);
        } else {
            blobUrl = fileUrl;
        }

        window.open(blobUrl, '_blank');
    } catch (error) {
        console.error('Ошибка открытия PDF:', error);
        alert(' Не удалось открыть PDF');
    }
}

// ============================================
// СТАТУСЫ
// ============================================

function getStatusText(status) {
    const map = {
        'PENDING': 'В обработке',
        'APPROVED': 'Одобрено',
        'REJECTED': 'Отклонено',
        'ANSWERED': 'Отвечено'
    };
    return map[status] || 'В обработке';
}

function getStatusInfo(status) {
    const map = {
        'PENDING': { text: 'В обработке', class: 'pending' },
        'APPROVED': { text: 'Одобрено', class: 'approved' },
        'REJECTED': { text: 'Отклонено', class: 'rejected' },
        'ANSWERED': { text: 'Отвечено', class: 'approved' }
    };
    return map[status] || map['PENDING'];
}



