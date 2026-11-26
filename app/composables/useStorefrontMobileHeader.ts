import type { Ref } from 'vue'

export function useStorefrontMobileHeader(header: Readonly<Ref<HTMLElement | null>>) {
  const compact = ref(false)
  let lastY = 0
  let travel = 0
  let frame = 0
  let desktop: MediaQueryList | undefined
  let motion: MediaQueryList | undefined

  function reset() {
    lastY = Math.max(0, window.scrollY)
    travel = 0
    compact.value = false
  }

  function checkScroll() {
    frame = 0
    const y = Math.max(0, window.scrollY)
    const delta = y - lastY
    lastY = y
    if (desktop?.matches || motion?.matches || document.querySelector('dialog[open], [aria-modal="true"]:not([hidden])')) {
      travel = 0
      return
    }
    if (y < 100 || header.value?.contains(document.activeElement)) {
      reset()
      return
    }
    if (delta === 0) return
    travel = Math.sign(delta) === Math.sign(travel) ? travel + delta : delta
    if (y > 160 && travel >= 24) compact.value = true
    else if (travel <= -16) compact.value = false
  }

  function onScroll() {
    if (!frame) frame = window.requestAnimationFrame(checkScroll)
  }

  onMounted(() => {
    reset()
    desktop = window.matchMedia('(min-width: 64rem)')
    motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    desktop.addEventListener('change', reset)
    motion.addEventListener('change', reset)
    window.addEventListener('scroll', onScroll, { passive: true })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    desktop?.removeEventListener('change', reset)
    motion?.removeEventListener('change', reset)
    if (frame) window.cancelAnimationFrame(frame)
  })

  return compact
}
