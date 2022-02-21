import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createI18n } from 'vue-i18n';
import messages from './locals.json';

library.add(
    faBars,
    faChevronRight,
    faChevronLeft
);

const i18n = createI18n({
    locale: localStorage.getItem('preferences.lang') || navigator.language.split('-')[0],
    fallbackLocale: 'en',
    messages
});

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount('#app');
