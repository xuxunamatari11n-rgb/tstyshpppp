import type { Ref } from 'vue'

export function useCommercialReveal(root: Readonly<Ref<HTMLElement | null>>, immediate = false) {
  const { $gsap } = useNuxtApp()
  let preference: MediaQueryList | undefined
  let observer: IntersectionObserver | undefined
  let context: ReturnType<typeof $gsap.context> | undefined

  function reset() {
    observer?.disconnect()
    context?.revert()
    context = undefined
  }

  function reveal() {
    observer?.disconnect()
    const element = root.value
    if (!element || preference?.matches) return

    context = $gsap.context(() => {
      const text = element.querySelectorAll('[data-commercial-reveal]')
      const photos = element.querySelectorAll('[data-commercial-photo]')
      if (text.length) $gsap.from(text, { y: 10, opacity: 0.86, duration: 0.38, stagger: 0.045, ease: 'power3.out', clearProps: 'transform,opacity' })
      if (photos.length) $gsap.from(photos, { y: 14, opacity: 0.9, duration: 0.48, stagger: 0.055, ease: 'power3.out', clearProps: 'transform,opacity' })
    }, element)
  }

  onMounted(() => {
    preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', reset)
    if (!root.value || preference.matches) return
    if (immediate || !('IntersectionObserver' in window)) {
      reveal()
      return
    }
    observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) reveal()
    }, { threshold: 0.16 })
    observer.observe(root.value)
  })

  onBeforeUnmount(() => {
    preference?.removeEventListener('change', reset)
    reset()
  })
}

