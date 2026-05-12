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
  background-color: var(--color-nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-accent-cyan);
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
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
  filter: drop-shadow(0 0 2em var(--color-logo-glow));
}

.buttons {
  display: flex;
  align-items: center;
  height: 72px;
}

.button {
  color: var(--color-nav-link);
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
  color: var(--color-nav-link-hover);
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}
</style>