import { randomUUID } from 'node:crypto'

export default defineEventHandler((event) => {
  const requestId = randomUUID()
  const startedAt = Date.now()
  event.context.requestId = requestId
  setResponseHeader(event, 'X-Request-Id', requestId)

  event.node.res.once('finish', () => {
    console.info(JSON.stringify({
      requestId,
      route: getRequestURL(event).pathname,
      statusCode: event.node.res.statusCode,
      durationMs: Date.now() - startedAt,
      ...(event.context.errorCode ? { errorCode: event.context.errorCode } : {}),
    }))
  })
})
