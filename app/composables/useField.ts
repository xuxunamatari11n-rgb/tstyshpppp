import type { FieldProps } from '~/types/ui'

export function useField(props: FieldProps) {
  const generatedId = useId()
  const controlId = computed(() => props.id ?? generatedId)
  const hintId = computed(() => `${controlId.value}-hint`)
  const errorId = computed(() => `${controlId.value}-error`)
  const describedBy = computed(() => {
    return [props.hint && hintId.value, props.error && errorId.value].filter(Boolean).join(' ') || undefined
  })

  return { controlId, hintId, errorId, describedBy }
}
