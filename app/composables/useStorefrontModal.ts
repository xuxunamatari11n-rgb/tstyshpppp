import type { Ref } from 'vue'

let scrollLocks = 0
let pageOverflow = ''
let bodyOverflow = ''

export function useStorefrontModal(
  dialog: Readonly<Ref<HTMLDialogElement | null>>,
  initialFocus: Readonly<Ref<HTMLElement | null>>,
  options: { mobileOnly?: boolean; desktopOnly?: boolean } = {},
) {
  const active = ref(false)
  const route = useRoute()
  let invoker: HTMLElement | null = null
  let scrollLocked = false
  let restoreFocus = true
  let desktop: MediaQueryList | undefined

  async function open(trigger: HTMLElement) {
    const element = dialog.value
    if (!element || element.open) return
    invoker = trigger
    restoreFocus = true
    active.value = true
    await nextTick()
    if (!active.value || !element.isConnected) return
    element.showModal()
    scrollLocked = true
    if (scrollLocks++ === 0) {
      pageOverflow = document.documentElement.style.overflow
      bodyOverflow = document.body.style.overflow
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    }
    initialFocus.value?.focus({ preventScroll: true })
  }

  function finishClose() {
    dialog.value?.close()
    if (scrollLocked) {
      scrollLocked = false
      if (--scrollLocks === 0) {
        document.documentElement.style.overflow = pageOverflow
        document.body.style.overflow = bodyOverflow
      }
    }
    if (restoreFocus && invoker?.isConnected && invoker.getClientRects().length) {
      invoker.focus({ preventScroll: true })
    }
    invoker = null
  }

  function close(restore = true) {
    if (!active.value) return
    restoreFocus = restore
    active.value = false
  }

  function trapFocus(event: KeyboardEvent) {
    const candidates = [...(dialog.value?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter(element =>
      element.tabIndex >= 0
      && element.getClientRects().length
      && !element.closest('[inert]')
      && (element.tagName === 'SUMMARY' || !element.closest('details:not([open])')),
    )
    const first = candidates[0]
    const last = candidates.at(-1)
    if (!first || !last) return

    const focused = document.activeElement
    if (event.shiftKey && (focused === first || !candidates.includes(focused as HTMLElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (focused === last || !candidates.includes(focused as HTMLElement))) {
      event.preventDefault()
      first.focus()
    }
  }

  function breakpointChanged(event: MediaQueryListEvent) {
    if (options.desktopOnly ? !event.matches : event.matches) close(false)
  }

  watch(() => route.fullPath, () => close(false))
  onMounted(() => {
    if (options.mobileOnly === false && !options.desktopOnly) return
    desktop = window.matchMedia('(min-width: 64rem)')
    desktop.addEventListener('change', breakpointChanged)
  })
  onBeforeUnmount(() => {
    desktop?.removeEventListener('change', breakpointChanged)
    restoreFocus = false
    finishClose()
  })

  return { active, open, close, finishClose, trapFocus }
}
