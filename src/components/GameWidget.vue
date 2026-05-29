<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import volumeIcon from '../assets/icons/game/volume.svg?raw'
import muteIcon from '../assets/icons/game/mute.svg?raw'
import fullscreenIcon from '../assets/icons/game/fullscreen.svg?raw'

const props = defineProps<{ src: string; enabled: boolean }>()

const container = ref<HTMLDivElement>()
const volume = ref(0.25)
let prevVolume = 0.25
let player: any = null

watch(volume, (v) => {
  if (player) player.volume = props.enabled ? v : 0
})

watch(() => props.enabled, (v) => {
  if (player) player.volume = v ? volume.value : 0
})

const currentVolumeIcon = computed(() => volume.value === 0 ? muteIcon : volumeIcon)

function toggleMute() {
  if (volume.value > 0) {
    prevVolume = volume.value
    volume.value = 0
  } else {
    volume.value = prevVolume
  }
}

function fullscreen() {
  player?.requestFullscreen()
}

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://unpkg.com/@ruffle-rs/ruffle'
  script.onload = () => {
    const ruffle = (window as any).RufflePlayer.newest()
    player = ruffle.createPlayer()
    container.value!.appendChild(player)
    player.load(props.src).then(() => { player.volume = props.enabled ? volume.value : 0 })
  }
  document.head.appendChild(script)
})
</script>

<template>
  <div class="game-container">
    <div ref="container" class="game-player" />
    <div class="divider" />
    <div class="controls">
      <div class="volume-control">
        <button class="icon-btn" v-html="currentVolumeIcon" @click="toggleMute" />
        <input type="range" min="0" max="1" step="0.05" v-model.number="volume" />
      </div>
      <button class="icon-btn" v-html="fullscreenIcon" @click="fullscreen" />
    </div>
  </div>
</template>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.game-player {
  display: flex;
  justify-content: center;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
}

.icon-btn :deep(svg) {
  width: 3em;
  height: 3em;
  display: block;
  fill: var(--color-primary);
}

.divider {
  width: 100%;
  height: 1px;
  background-color: var(--color-primary);
  opacity: 0.3;
}

input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 150px;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(
    to right,
    var(--color-primary) 0%,
    var(--color-primary) calc(v-bind('volume * 100') * 1%),
    var(--color-bg-secondary) calc(v-bind('volume * 100') * 1%),
    var(--color-bg-secondary) 100%
  );
  outline: none;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 6px;
  height: 18px;
  border-radius: 2px;
  background: var(--color-primary);
  box-shadow: 0 0 4px rgb(from var(--color-primary) r g b / 0.6);
  transition: box-shadow 0.15s;
}

input[type="range"]:hover::-webkit-slider-thumb {
  box-shadow: 0 0 8px var(--color-primary);
}

input[type="range"]::-moz-range-thumb {
  width: 6px;
  height: 18px;
  border-radius: 2px;
  border: none;
  background: var(--color-primary);
  box-shadow: 0 0 4px rgb(from var(--color-primary) r g b / 0.6);
  transition: box-shadow 0.15s;
}

input[type="range"]:hover::-moz-range-thumb {
  box-shadow: 0 0 8px var(--color-primary);
}
</style>
