<script setup lang="ts">

import HelloWorld from "../components/HelloWorld.vue";
</script>

<template>
  <div>
    <a>
      <img src="./../assets/logo.png" class="logo" alt="Logo"/>
    </a>
  </div>
  <HelloWorld msg="FGG Wars"/>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em rgba(106, 82, 0, 1));
}
</style>