export default defineEventHandler(event => loadShopMeta(event, shopLocale(getQuery(event).locale)))
