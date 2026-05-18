<script setup lang="ts">
import { useRoute } from 'vue-router'
import Header from "./components/Header.vue"
import GamesView from "./views/Games.vue"

const route = useRoute()
</script>

<template>
  <Header/>

  <div class="content">
    <router-view v-slot="{ Component }">
      <KeepAlive include="Tools,Rules">
        <component :is="Component" />
      </KeepAlive>
    </router-view>
    <GamesView v-show="route.name === 'games'" />
  </div>
</template>

<style scoped>
.content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1.5rem 1rem 0;
  text-align: left;
}
</style>
