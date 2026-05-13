<script setup lang="ts">

</script>

<template>
  <h1>Полезные ссылки</h1>
  <ul class="page-list">
    <li>
      <router-link to="/dice-roller">Бросить кубик</router-link>
    </li>
    <li>
      <a href="https://www.google.com/search?q=flip+a+coin" target="_blank">Подбросить монетку</a>
    </li>
    <li class="with-note">
      <a href="https://1drv.ms/p/c/a24b107ddb981c5e/IQAz0qPb8CLqRpJ6kRpZrw6UASiukNZcHMgSpAM94v9TrLs?e=j6aUXb"
         target="_blank">Квесты</a>
      <p class="note">Переход по квестам может работать медленно, необходимо просто подождать</p>
    </li>
    <li>
      <a href="https://disk.yandex.ru/d/h78NiH8P9jdoEQ" target="_blank">Материалы</a>
    </li>
  </ul>
</template>

<style scoped>
.with-note {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.note {
  margin: 0;
  font-size: 0.8em;
  color: var(--color-text);
  opacity: 0.7;
  border-left: 2px solid var(--color-accent-cyan);
  padding-left: 0.5rem;
}
</style>