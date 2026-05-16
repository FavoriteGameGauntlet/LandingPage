<script setup lang="ts">
import Header from "./components/Header.vue";
</script>

<template>
  <Header/>

  <div class="content">
    <router-view v-slot="{ Component }">
      <KeepAlive include="Tools,Rules">
        <component :is="Component" />
      </KeepAlive>
    </router-view>
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
