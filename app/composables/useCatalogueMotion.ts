export function useCatalogueMotion() {
  const { $gsap } = useNuxtApp()
  const active = new Map<Element, ReturnType<typeof $gsap.context>>()

  function clear(element: Element) {
    active.get(element)?.revert()
    active.delete(element)
  }

  function enter(element: Element, done: () => void) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done()
      return
    }
    const context = $gsap.context(() => {
      $gsap.from(element, {
        opacity: 0.78, y: 4, duration: 0.19, ease: 'power2.out',
        onComplete: () => { clear(element); done() },
      })
    }, element)
    active.set(element, context)
  }

  onBeforeUnmount(() => active.forEach((_, element) => clear(element)))
  return { onEnter: enter, onEnterCancelled: clear }
}
