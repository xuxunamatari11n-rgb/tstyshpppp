import type { Ref } from 'vue'

type CloseDisclosure = (restoreFocus?: boolean) => void

export function useStorefrontDisclosure(
  root: Readonly<Ref<HTMLElement | null>>,
  open: Readonly<Ref<boolean>>,
  close: CloseDisclosure,
) {
  const route = useRoute()
  watch(() => route.fullPath, () => close())

  function outside(event: PointerEvent) {
    if (open.value && event.target instanceof Node && !root.value?.contains(event.target)) close()
  }

  function onFocusOut(event: FocusEvent) {
    if (open.value && event.relatedTarget instanceof Node && !root.value?.contains(event.relatedTarget)) close()
  }

  function onEscape(event: KeyboardEvent) {
    if (!open.value) return
    event.preventDefault()
    event.stopPropagation()
    close(true)
  }

  let desktop: MediaQueryList | undefined
  function breakpointChanged(event: MediaQueryListEvent) {
    if (!event.matches) close()
  }

  onMounted(() => {
    document.addEventListener('pointerdown', outside)
    desktop = window.matchMedia('(min-width: 64rem)')
    desktop.addEventListener('change', breakpointChanged)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', outside)
    desktop?.removeEventListener('change', breakpointChanged)
  })

  return { onFocusOut, onEscape }
}

