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
                submitBtn.textContent = '📤 Отправить заявление';
            } else {
                fileGroup.classList.add('hidden');
                submitBtn.textContent = '📤 Отправить вопрос';
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
                fileName.textContent = '📎 ' + this.files[0].name;
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
});

async function submitCommunication(e) {
    e.preventDefault();

    const type = document.querySelector('input[name="type"]:checked').value;
    const message = document.getElementById('message').value.trim();
    const result = document.getElementById('result');

    if (!message) {
        showResult(result, 'Пожалуйста, заполните текст обращения', 'error');
        return;
    }

    showResult(result, 'Отправка...', 'info');

    try {
        const token = localStorage.getItem('token');

        if (type === 'application') {
            const response = await fetch(`${API_URL}/applications`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text: message, fileUrl: null })
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

function showResult(container, message, type) {
    container.textContent = message;
    container.className = 'result-area ' + type;
    container.style.display = 'block';

    clearTimeout(window.resultTimer);
    window.resultTimer = setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}
