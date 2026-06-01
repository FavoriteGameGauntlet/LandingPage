interface LeavingItem { el: HTMLElement; left: number; top: number; w: number; done: () => void }

export function useCardLeave() {
  let clearing = false
  const leavingBatch: LeavingItem[] = []
  let leavingScheduled = false

  function clearStart() { clearing = true }
  function clearEnd() { clearing = false }

  function onLeave(el: Element, done: () => void) {
    if (clearing) { done(); return }
    const htmlEl = el as HTMLElement
    const rect = htmlEl.getBoundingClientRect()
    const parentRect = htmlEl.offsetParent?.getBoundingClientRect() ?? { left: 0, top: 0 }

    leavingBatch.push({
      el: htmlEl,
      left: rect.left - parentRect.left,
      top: rect.top - parentRect.top,
      w: rect.width,
      done,
    })

    if (!leavingScheduled) {
      leavingScheduled = true
      queueMicrotask(() => {
        leavingScheduled = false
        animateLeaving([...leavingBatch])
        leavingBatch.length = 0
      })
    }
  }

  async function animateLeaving(batch: LeavingItem[]) {
    batch.forEach(({ el, left, top, w }) => {
      el.style.position = 'absolute'
      el.style.left = `${left}px`
      el.style.top = `${top}px`
      el.style.width = `${w}px`
      el.style.margin = '0'
    })

    const target = batch.reduce((a, b) =>
      b.top > a.top || (b.top === a.top && b.left > a.left) ? b : a
    )

    const phase1 = batch
      .filter(it => it !== target)
      .map(it =>
        it.el.animate(
          [
            { transform: 'translate(0,0)', opacity: '1' },
            { transform: `translate(${target.left - it.left}px, ${target.top - it.top}px)`, opacity: '0.7' },
          ],
          { duration: 180, easing: 'ease-in', fill: 'forwards' }
        )
      )

    await Promise.all(phase1.map(a => a.finished))

    batch.forEach(({ el }) => {
      el.style.left = `${target.left}px`
      el.style.top  = `${target.top}px`
    })
    phase1.forEach(a => a.cancel())

    await Promise.all(batch.map(({ el }) =>
      el.animate(
        [
          { opacity: '0.7', transform: 'translateX(0)' },
          { opacity: '0',   transform: `translateX(${target.w + 12}px)` },
        ],
        { duration: 280, easing: 'ease-in' }
      ).finished
    ))

    batch.forEach(({ done }) => done())
  }

  return { clearStart, clearEnd, onLeave }
}
