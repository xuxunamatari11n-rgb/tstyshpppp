export const uuidPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i
export const selectionBatchSize = 40
export const maxCartLines = 40

// Keep quantities and line totals within the safe integer range even at database limits.
export const maxCartQuantity = Math.floor(Number.MAX_SAFE_INTEGER / (maxCartLines * 2_147_483_647))

