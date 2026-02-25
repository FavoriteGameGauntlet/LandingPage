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
    },
    template: `
    <div class="page-wrapper">
      <header class="site-header">
        <a class="logo-slot" href="#" aria-label="FGG Challenge">
          Логотип FGG
        </a>

        <nav class="top-nav" aria-label="Основная навигация">
          <a
            v-for="item in navLinks"
            :key="item.title"
            :href="item.href"
            class="nav-link"
          >
            {{ item.title }}
          </a>
        </nav>
      </header>

      <main class="hero">
        <p class="season-badge">{{ season }}</p>
        <h1>FGG Challenge</h1>

        <section class="description-slot">
          <h2>Описание FGG</h2>
          <p>
            Здесь будет размещён ваш текст о том, что такое FGG и зачем он нужен.
            Блок специально оставлен крупным, чтобы вместить описание на 1–1.5 экрана.
          </p>

          <div class="placeholder-lines" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span><span></span>
            <span></span><span></span>
          </div>
        </section>
      </main>

      <footer class="footer">
        <p>Связь с разработчиками:</p>
        <p class="contacts">{{ contacts }}</p>
      </footer>
    </div>
  `
});
app.mount('#app');
