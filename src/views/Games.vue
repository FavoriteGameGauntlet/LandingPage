<script lang="ts">
export default { name: 'Games' }
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import CardTabs from '../components/CardTabs.vue'
import GameWidget from '../components/GameWidget.vue'

const games = [
  { id: 'cursor10', label: 'Cursor*10', src: '/games/cursor10.swf' },
  { id: 'rose-camellia', label: 'Rose & Camellia', src: '/games/rose_and_camellia.swf' },
  { id: 'gunblood', label: 'GunBlood', src: '/games/gunblood.swf' },
  { id: 'xiaoxiao4', label: 'Xiao Xiao No. 4', src: '/games/xiaoxiao_4.swf' },
  { id: 'zombotron', label: 'Zombotron', src: '/games/zombotron.swf' },
]

const active = ref('')
const route = useRoute()
const enabled = computed(() => route.name === 'games')
</script>

<template>
  <div>
    <CardTabs :items="games" v-model="active" :toggleable="true" />
    <div class="panel">
      <div v-for="game in games" :key="game.id">
        <GameWidget v-if="active === game.id" :src="game.src" :enabled="enabled" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  padding: 8px 0;
  min-height: 200px;
}
</style>
