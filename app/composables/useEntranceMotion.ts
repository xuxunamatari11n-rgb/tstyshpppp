import type { Ref } from 'vue'

export function useEntranceMotion(target: Readonly<Ref<HTMLElement | null>>) {
  const { $gsap } = useNuxtApp()
  let preference: MediaQueryList | undefined
  let tween: ReturnType<typeof $gsap.from> | undefined

  onMounted(() => {
    preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', stop)
    play()
  })

  onBeforeUnmount(() => {
    preference?.removeEventListener('change', stop)
    stop()
  })

  function stop() {
    tween?.revert()
    tween = undefined
  }

  function play() {
    const element = target.value
    if (!preference || preference.matches || !element) return
    stop()
    tween = $gsap.from(element, { y: 10, opacity: 0, duration: 0.5, ease: 'power3.out' })
  }

  return { play }
}
