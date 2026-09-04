const Modal = {

    // ============================================
    // ОТКРЫТЬ МОДАЛКУ
    // ============================================

    open(modalId) {
        const overlay = document.getElementById(modalId);
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    // ============================================
    // ЗАКРЫТЬ МОДАЛКУ
    // ============================================

    close(modalId) {
        const overlay = document.getElementById(modalId);
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    },

    // ============================================
    // ЗАКРЫТЬ ВСЕ МОДАЛКИ
    // ============================================

    closeAll() {
        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.classList.remove('active');
        });
        document.body.style.overflow = '';
    },

    // ============================================
    // ЗАКРЫТЬ ПО КЛИКУ ВНЕ МОДАЛКИ
    // ============================================

    init() {
        // Закрытие по клику на подложку
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Закрытие по Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                Modal.closeAll();
            }
        });
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    Modal.init();
});