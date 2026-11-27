export default defineEventHandler(async event => {
  await requireShopSession(event)
  return listShopFavorites(event)
})
