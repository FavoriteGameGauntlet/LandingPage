<script setup lang="ts">

</script>

<template>
  <h1>Полезные ссылки</h1>
  <ul>
    <li>
      <a href="https://www.google.com/search?q=roll+dice" target="_blank">Бросить кубик</a>
    </li>
    <li>
      <a href="https://www.google.com/search?q=flip+a+coin" target="_blank">Подбросить монетку</a>
    </li>
    <li>
      <a href="https://1drv.ms/p/c/a24b107ddb981c5e/IQAz0qPb8CLqRpJ6kRpZrw6UASiukNZcHMgSpAM94v9TrLs?e=j6aUXb"
         target="_blank">Квесты</a>
      <p>(Переход по квестам может работать медленно, необходимо просто подождать)</p>
    </li>
    <li>
      <a href="https://disk.yandex.ru/d/h78NiH8P9jdoEQ" target="_blank">Материалы</a>
    </li>
  </ul>
</template>

<style scoped>
ul {
  text-align: start;
  font-size: 20px;
}

a {
  color: lightgray;
  text-decoration: none;
}

a:hover {
  color: white;
}

li {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

li p {
  margin: 0;
  opacity: 0.5;
}
</style>