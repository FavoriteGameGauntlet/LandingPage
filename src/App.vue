<script setup lang="ts">
import Header from "./components/Header.vue";
import Footer from "./components/Footer.vue";
</script>

<template>
  <Header/>

  <div class="content">
    <router-view v-slot="{ Component }">
      <KeepAlive include="Tools">
        <component :is="Component" />
      </KeepAlive>
    </router-view>
  </div>

  <Footer/>
</template>

<style scoped>
.content {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.5rem 1rem 0;
  text-align: left;
}
</style>
