export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const user = await requireShopSession(event)
  if (getQuery(event).owner !== undefined && getQuery(event).owner !== user.id) throw createError({ statusCode: 409 })
  return listShopFavorites(event)
})
