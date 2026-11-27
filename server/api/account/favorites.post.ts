export default defineEventHandler(async event => {
  requireShopOrigin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const user = await requireShopSession(event)
  const body = await readBody<{ productId?: unknown; favorite?: unknown; owner?: unknown }>(event)
  if (body?.owner !== undefined && body.owner !== user.id) throw createError({ statusCode: 409 })
  if (typeof body?.productId !== 'string' || !/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(body.productId)
    || typeof body.favorite !== 'boolean') throw createError({ statusCode: 400 })
  await updateShopFavorite(event, body.productId, body.favorite)
  return { ok: true }
})
