import { useTemplateRef, onMounted, onUnmounted } from 'vue'
import { GATHER_MS } from './useCardLeave'
import slideSound from '../assets/sounds/cards/card-slide.ogg'
import whooshSound from '../assets/sounds/cards/card-whoosh.ogg'
import flipSound from '../assets/sounds/cards/card-flip.ogg'

const VOLUME = 0.3
// Three flips sound at once at the widest spread, so a single one carries less than it would alone
const FLIP_VOLUME = 0.2

// Both card widgets flip and drop cards on the same timings, and share one set of files
export function useCardSounds() {
  // Bound by name to the widget root: the sounds stop once it leaves the screen
  const root = useTemplateRef<HTMLElement>('root')

  const slideAudio = new Audio(slideSound)
  slideAudio.volume = VOLUME

  const whooshAudio = new Audio(whooshSound)
  whooshAudio.volume = VOLUME

  // Never played itself: the flips overlap, so every card turns over a clone of its own
  const flipAudio = new Audio(flipSound)

  const audios = [slideAudio, whooshAudio, flipAudio]

  // The widget mounts along with the whole tools page, so nothing is fetched up front:
  // the files load once the tab is opened and are silenced once it is left
  for (const audio of audios) audio.preload = 'none'

  let observer: IntersectionObserver | null = null
  let warmed = false
  let visible = false
  const flips: HTMLAudioElement[] = []
  let sweepTimer: ReturnType<typeof setTimeout> | null = null

  function warm() {
    if (warmed) return
    warmed = true
    for (const audio of audios) {
      audio.preload = 'auto'
      audio.load()
    }
  }

  function play(audio: HTMLAudioElement) {
    audio.currentTime = 0
    audio.play().catch(() => {})
  }

  // The leaving cards gather into a pile, then the pile sweeps off: a sound per phase.
  // A lone card has nothing to gather with, so it only sweeps
  function playLeave(count: number) {
    if (count < 2) {
      play(whooshAudio)
      return
    }
    play(slideAudio)
    if (sweepTimer) clearTimeout(sweepTimer)
    sweepTimer = setTimeout(() => play(whooshAudio), GATHER_MS)
  }

  // Cards turn over 100ms apart while the sound itself runs 312ms, so a shared element would cut
  // the previous card off. The detune keeps twenty of them from reading as one machine gun
  function playFlip() {
    if (!visible) return
    const flip = flipAudio.cloneNode() as HTMLAudioElement
    flip.volume = FLIP_VOLUME
    flip.playbackRate = 0.94 + Math.random() * 0.12
    flip.addEventListener('ended', () => {
      const i = flips.indexOf(flip)
      if (i !== -1) flips.splice(i, 1)
    })
    flips.push(flip)
    play(flip)
  }

  // Silence the sound only: the timers that turn the cards over have to run, otherwise
  // the deal would be left lying face down
  function silence() {
    visible = false
    if (sweepTimer) { clearTimeout(sweepTimer); sweepTimer = null }
    slideAudio.pause()
    whooshAudio.pause()
    for (const flip of flips) flip.pause()
    flips.length = 0
  }

  onMounted(() => {
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        visible = true
        warm()
      } else {
        silence()
      }
    }, { rootMargin: '200px' })
    observer.observe(root.value!)
  })

  onUnmounted(() => {
    observer?.disconnect()
    silence()
  })

  return { playFlip, playLeave }
}
