<script setup lang="ts">

</script>

<template>
  <div class="background">
    <div class="menu">
      <router-link to="/" class="logo">
        <img src="./../assets/logo.png" alt="Logo"/>
      </router-link>

      <div class="buttons">
        <router-link to="/download">
          <button type="button" class="button">Скачать</button>
        </router-link>
        <router-link to="/rules">
          <button type="button" class="button">Правила</button>
        </router-link>
        <router-link to="/useful-links">
          <button type="button" class="button">Полезные ссылки</button>
        </router-link>
        <router-link to="/previous-seasons">
          <button type="button" class="button">Предыдущие сезоны</button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.background {
  background-color: #0f777a;
  align-items: center;
}

.menu {
  height: 72px;
  display: flex;
  max-width: 1280px;
  margin: 0 auto;
  align-items: center;
  justify-content: space-between;
}

.logo {
  height: 4em;
  cursor: pointer;
  display: flex;
}
.logo:hover {
  filter: drop-shadow(0 0 2em rgba(248, 212, 200, 0.75));
}

.buttons {
  display: flex;
  align-items: center;
  height: 72px;
}

.button {
  color: lightgray;
  margin: 0 1em;
  padding: 0.6em 1.2em;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background: transparent;
  border: transparent;
  transition: color 0.25s;
}

button:hover {
  color: white;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>