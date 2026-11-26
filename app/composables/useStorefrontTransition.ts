export function useStorefrontTransition(distance = -8, axis: 'x' | 'y' = 'y', stagger = false) {
  const { $gsap } = useNuxtApp()
  const animations = new Map<Element, ReturnType<typeof $gsap.context>>()

  function clear(element: Element) {
    animations.get(element)?.revert()
    animations.delete(element)
  }

  function animate(element: Element, entering: boolean, done: () => void) {
    clear(element)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done()
      return
    }

    const hidden = { opacity: 0, [axis]: distance }
    const visible = { opacity: 1, [axis]: 0 }
    const animation = $gsap.context(() => {
      const timeline = $gsap.timeline({ onComplete: () => { clear(element); done() } })
      timeline.fromTo(element, entering ? hidden : visible, {
        ...(entering ? visible : hidden),
        duration: entering ? 0.28 : 0.22,
        ease: 'power3.out',
      })
      if (stagger && entering) {
        timeline.from(element.querySelectorAll('[data-drawer-group]'), {
          y: 7, opacity: 0.72, duration: 0.19, stagger: 0.025, ease: 'power2.out',
        }, 0.035)
      }
    }, element)
    animations.set(element, animation)
  }

  onBeforeUnmount(() => animations.forEach((_, element) => clear(element)))

  return {
    onEnter: (element: Element, done: () => void) => animate(element, true, done),
    onLeave: (element: Element, done: () => void) => animate(element, false, done),
    onEnterCancelled: clear,
    onLeaveCancelled: clear,
  }
}

