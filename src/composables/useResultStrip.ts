import { ref } from 'vue'

export function useResultStrip(displayMs = 3000, fadeMs = 400) {
  const showResult = ref(false)
  const slowHide = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function hideInstant() {
    if (timer) { clearTimeout(timer); timer = null }
    slowHide.value = false
    showResult.value = false
  }

  function show() {
    if (timer) clearTimeout(timer)
    showResult.value = true
    timer = setTimeout(() => {
      slowHide.value = true
      showResult.value = false
      setTimeout(() => { slowHide.value = false }, fadeMs)
    }, displayMs)
  }

  return { showResult, slowHide, hideInstant, show }
}
