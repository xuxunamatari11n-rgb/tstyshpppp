export default defineEventHandler(async event => {
  const client = await requireRegie(event)
  const [resource, key, operation, ...extra] = (getRouterParam(event, 'path') ?? '').split('/')
  if (extra.length) return adminBad('not-found', 404)

  if (event.method === 'GET') {
    if (resource === 'products' && !operation) {
      return key ? regieProduct(client, adminId(key)) : regieProducts(client, getQuery(event))
    }
    if (resource === 'categories' && !key) return regieCategories(client)
    if (resource === 'settings' && !key) return regieResult(await client.from('store_settings').select('*').maybeSingle())
  }

  if (event.method === 'POST' && !key && resource === 'media') return regieUpload(event, client)

  if (event.method === 'POST' && !key) {
    if (resource === 'products') return saveRegieProduct(client, undefined, await readBody(event))
    if (resource === 'categories') return saveRegieCategory(client, undefined, await readBody(event))
  }

  if (event.method === 'PATCH' && !operation) {
    if (resource === 'settings' && !key) return saveRegieSettings(client, await readBody(event))
    if (key && resource === 'products') return saveRegieProduct(client, adminId(key), await readBody(event))
    if (key && resource === 'categories') return saveRegieCategory(client, adminId(key), await readBody(event))
  }

  if (event.method === 'POST' && resource === 'products' && key && operation === 'visibility') {
    const body = adminObject(await readBody(event))
    regieResult(await client.rpc('regie_visibility', { target: adminId(key), visible: adminBoolean(body.visible) }))
    return { ok: true }
  }

  if (event.method === 'DELETE' && key && !operation && (resource === 'products' || resource === 'categories')) {
    const version = adminVersion(getQuery(event).version)
    const id = adminId(key)
    if (resource === 'products') {
      const row = regieResult(await client.from('products').delete().eq('id', id).eq('updated_at',version).select('id').maybeSingle())
      if (!row) adminBad('conflict',409)
    } else {
      const row = regieResult(await client.from('categories').delete().eq('id', id).eq('updated_at',version).select('id').maybeSingle())
      if (!row) adminBad('conflict',409)
    }
    return { ok: true }
  }

  return adminBad('not-found', 404)
})

