<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isOpen = ref(false)
const router = useRouter()

router.afterEach(() => {
  isOpen.value = false
})
</script>

<template>
  <div class="background">
    <div class="menu">
      <router-link to="/" class="logo">
        <img src="./../assets/logo.webp" alt="Logo" fetchpriority="high"/>
      </router-link>

      <button class="hamburger" :class="{ open: isOpen }" @click="isOpen = !isOpen" aria-label="Меню">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="buttons" :class="{ open: isOpen }">
        <router-link to="/download" class="button">Скачать</router-link>
        <router-link to="/rules" class="button">Правила</router-link>
        <router-link to="/tools" class="button">Инструменты</router-link>
        <router-link to="/previous-seasons" class="button">Предыдущие сезоны</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.background {
  background-color: var(--color-nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-accent-red);
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
  padding: 0 1rem;
}

.logo {
  height: 4em;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
}
.logo:hover {
  filter: drop-shadow(0 0 2em var(--color-accent-red));
}

.buttons {
  display: flex;
  align-items: center;
  height: 72px;
}

.button {
  margin: 0 1em;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
}

button:focus {
  outline: none;
}

.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background-color: var(--color-accent-red);
  border-radius: 2px;
  transition: transform 0.25s, opacity 0.25s;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

@media (max-width: 768px) {
  .hamburger {
    display: flex;
  }

  .buttons {
    display: none;
    position: absolute;
    top: 72px;
    left: 0;
    right: 0;
    flex-direction: column;
    height: auto;
    background-color: var(--color-bg);
    border-bottom: 1px solid var(--color-accent-red);
    padding: 0.5rem 0;
  }

  .buttons.open {
    display: flex;
  }

  .button {
    width: 100%;
    text-align: center;
    margin: 0;
    padding: 0.8em 1.2em;
  }
}
</style>
