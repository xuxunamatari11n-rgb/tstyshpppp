import type { Ref } from 'vue'
import { customerDestination, customerReturnQuery } from '~~/shared/utils/customerAccount'

type AuthMode = 'login' | 'signup' | 'reset' | 'recover'
type AuthAction = AuthMode | 'logout'
type AuthNotice = 'signupSent' | 'resetSent' | 'updated'
type AuthField = 'email' | 'password' | 'confirmation'

export function useAuthFlow(form: Readonly<Ref<HTMLFormElement | null>>) {
  const { locale } = useI18n()
  const { invalidate } = useShopIdentityControl()
  const route = useRoute()
  const localePath = useLocalePath()
  const session = useShopSession()
  const { data, status, error, refresh } = session
  const user = computed(() => data.value?.user)
  const mode = computed<AuthMode>(() => route.query.intent === 'create-account' ? 'signup'
    : route.query.intent === 'reset' ? 'reset' : route.query.intent === 'recovery' ? 'recover' : 'login')
  const working = ref(false)
  const failure = ref('')
  const notice = ref<AuthNotice>()
  const fieldErrors = reactive<Partial<Record<AuthField, string>>>({})
  const email = ref('')
  const password = ref('')
  const confirmation = ref('')
  const firstName = ref('')
  const lastName = ref('')

  const view = computed(() => {
    if (notice.value) return notice.value
    if (status.value === 'pending' && !data.value) return 'pending'
    if (error.value) return 'unavailable'
    if (route.query.auth === 'invalid' || (mode.value === 'recover' && !user.value)) return 'expired'
    if (route.query.auth === 'confirmed' && user.value) return 'confirmed'
    if (user.value && mode.value !== 'recover') return 'signedIn'
    return mode.value
  })

  function accountLink(intent?: string) {
    const next = customerReturnQuery(route.query.next, route.query.address)
    return localePath({ name: 'account', query: { ...next, ...(intent ? { intent } : {}) } })
  }

  function returnDestination() {
    const target = customerDestination(route.query.next, route.query.address)
    return target ? localePath(target) : undefined
  }

  function clearFeedback() {
    failure.value = ''
    for (const field of ['email', 'password', 'confirmation'] as const) delete fieldErrors[field]
  }

  function clearField(field: AuthField) {
    delete fieldErrors[field]
    if (field === 'password') delete fieldErrors.confirmation
    failure.value = ''
  }

  watch(mode, () => {
    password.value = ''
    confirmation.value = ''
    clearFeedback()
    if (notice.value !== 'updated') notice.value = undefined
  })
  async function validate(action: AuthMode) {
    if (action !== 'recover' && (email.value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value))) {
      fieldErrors.email = 'auth.errors.email'
    }
    if (action !== 'reset') {
      if (!password.value) fieldErrors.password = 'auth.access.enterPassword'
      else if (password.value.length > 128 || (action !== 'login' && password.value.length < 8)) {
        fieldErrors.password = 'auth.errors.password'
      }
    }
    if (action === 'recover' && password.value && password.value !== confirmation.value) {
      fieldErrors.confirmation = 'auth.access.passwordMismatch'
    }
    if (!Object.keys(fieldErrors).length) return true
    await nextTick()
    form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return false
  }

  async function submit(action: AuthAction) {
    if (working.value) return
    clearFeedback()
    if (action !== 'logout') {
      const values = new FormData(form.value ?? undefined)
      if (values.has('email')) email.value = String(values.get('email')).trim()
      if (values.has('password')) password.value = String(values.get('password'))
      if (values.has('confirmation')) confirmation.value = String(values.get('confirmation'))
      if (values.has('firstName')) firstName.value = String(values.get('firstName'))
      if (values.has('lastName')) lastName.value = String(values.get('lastName'))
      if (!await validate(action) || working.value) return
    }

    working.value = true
    notice.value = undefined
    try {
      await $fetch('/api/auth/action', {
        method: 'POST', body: { action, locale: locale.value, email: email.value, password: password.value,
          owner: action === 'recover' || action === 'logout' ? user.value?.id : undefined,
          firstName: firstName.value, lastName: lastName.value },
      })
      password.value = ''
      confirmation.value = ''
      if (action === 'login' || action === 'logout') {
        invalidate(action === 'logout' ? null : undefined)
        try { localStorage.setItem('testy-shop/auth-changed', String(Date.now())) } catch { /* Current tab still refreshes. */ }
      }
      if (action === 'signup' || action === 'reset') {
        if (mode.value === action) notice.value = action === 'signup' ? 'signupSent' : 'resetSent'
        await refresh()
      } else {
        await refresh()
        await navigateTo(action === 'login' ? returnDestination() || accountLink() : accountLink(), { replace: true })
        if (action === 'recover') notice.value = 'updated'
      }
    } catch (caught) {
      const reason = (caught as { data?: { data?: { code?: string } } }).data?.data?.code
      if (reason === 'email' || reason === 'password') {
        fieldErrors[reason] = `auth.errors.${reason}`
        await nextTick()
        form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      } else {
        failure.value = reason && ['rate', 'unconfirmed', 'credentials', 'invalid', 'reauth'].includes(reason) ? reason : 'unavailable'
      }
    } finally {
      working.value = false
    }
  }

  return { user, mode, working, failure, notice, fieldErrors, email, password, confirmation, firstName, lastName,
    view, session, refresh, accountLink, returnDestination, clearField, submit }
}

