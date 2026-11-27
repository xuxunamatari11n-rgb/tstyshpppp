export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return { active: await regieRecoveryActive(event) }
})

