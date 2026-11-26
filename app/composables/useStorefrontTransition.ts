export function useStorefrontTransition(distance = -8) {
  const { $gsap } = useNuxtApp()
  const tweens = new Map<Element, ReturnType<typeof $gsap.to>>()

  function clear(element: Element) {
    tweens.get(element)?.kill()
    tweens.delete(element)
    if (element instanceof HTMLElement) {
      element.style.removeProperty('transform')
      element.style.removeProperty('opacity')
    }
  }

  function animate(element: Element, entering: boolean, done: () => void) {
    clear(element)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      done()
      return
    }

    const hidden = { opacity: 0, y: distance }
    const visible = { opacity: 1, y: 0 }
    const tween = $gsap.fromTo(element, entering ? hidden : visible, {
      ...(entering ? visible : hidden),
      duration: entering ? 0.3 : 0.25,
      ease: 'power3.out',
      onComplete: () => {
        clear(element)
        done()
      },
    })
    tweens.set(element, tween)
  }

  onBeforeUnmount(() => tweens.forEach((_, element) => clear(element)))

  return {
    onEnter: (element: Element, done: () => void) => animate(element, true, done),
    onLeave: (element: Element, done: () => void) => animate(element, false, done),
    onEnterCancelled: clear,
    onLeaveCancelled: clear,
  }
}

