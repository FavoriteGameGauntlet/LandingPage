"use strict";
const app = Vue.createApp({
    data() {
        return {
            season: 'Сезон 2026',
            contacts: 'Email / Telegram / Discord (добавьте актуальные контакты)',
            navLinks: [
                { title: 'Скачать приложение', href: '#download' },
                { title: 'Правила', href: '#rules' },
                { title: 'Ссылки сезона', href: '#current-season' },
                { title: 'Предыдущие сезоны', href: '#archive' }
            ]
        };
    }
});
app.mount('#app');
