type NavItem = {
  title: string;
  href: string;
};

declare const Vue: {
  createApp: (options: {
    data: () => {
      season: string;
      contacts: string;
      navLinks: NavItem[];
    };
  }) => { mount: (selector: string) => void };
};

const app = Vue.createApp({
  data() {
    return {
      season: 'FGGW2',
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
