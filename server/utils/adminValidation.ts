import type { AdminLocale } from '~~/shared/types/admin'

export function adminBad(code: string, statusCode = 422): never {
  throw createError({ statusCode, statusMessage: 'Administration request rejected', data: { code } })
}

export function adminObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return adminBad('invalid')
  return value as Record<string, unknown>
}

export function adminString(value: unknown, length: number, code = 'invalid', required = false) {
  if (typeof value !== 'string' || value.length > length || value.includes('\0') || (required && !value.trim())) return adminBad(code)
  return value.trim()
}

export function adminId(value: unknown) {
  if (typeof value !== 'string' || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)) return adminBad('invalid')
  return value
}

export function adminBoolean(value: unknown) {
  if (typeof value !== 'boolean') return adminBad('invalid')
  return value
}

export function adminInteger(value: unknown, code = 'invalid', min = 0, max = 2147483647) {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) return adminBad(code)
  return value
}

export function adminList(value: unknown, max: number) {
  if (!Array.isArray(value) || value.length > max) return adminBad('invalid')
  return value as unknown[]
}

export function adminSlug(value: unknown) {
  const slug = adminString(value, 120, 'slug', true)
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return adminBad('slug')
  return slug
}

export function adminLocale(value: unknown): AdminLocale {
  if (value !== 'fr' && value !== 'es') return adminBad('invalid')
  return value
}

export function adminTranslation(text: Record<string, unknown>, max: number) {
  const locale = adminLocale(text.locale)
  const name = adminString(text.name, max, locale === 'fr' ? 'french-required' : 'spanish-name')
  return { locale, name }
}

export function adminLocalText(value: unknown, max: number, required = false) {
  const text = adminObject(value)
  return { fr: adminString(text.fr, max, 'spec-french', required), es: adminString(text.es, max) }
}

export function adminVersion(value: unknown) {
  if (typeof value !== 'string' || value.length > 45 || !Number.isFinite(Date.parse(value))) return adminBad('conflict')
  return value
}

