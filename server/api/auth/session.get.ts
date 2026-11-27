export default defineEventHandler(async event => ({ user: await readShopSession(event) }))
