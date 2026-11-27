import { selectionBatchSize, uuidPattern } from '~~/shared/utils/commerceSelection'

export default defineEventHandler(event => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  const { ids: raw, locale } = getQuery(event)
  const ids = typeof raw === 'string' && raw.length <= selectionBatchSize * 37 ? [...new Set(raw.split(','))] : []
  if (!ids.length || ids.length > selectionBatchSize || !ids.every(id => uuidPattern.test(id))) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid product selection' })
  }
  return loadShopSelection(event, shopLocale(locale), ids)
})

