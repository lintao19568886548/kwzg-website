export function createKwError(statusCode, code, publicMessage) {
  const error = new Error(publicMessage)
  error.name = 'KwBusinessError'
  error.statusCode = statusCode
  error.code = code
  error.publicMessage = publicMessage
  return error
}

function isKwBusinessError(error) {
  return error?.name === 'KwBusinessError' && Number.isInteger(error?.statusCode)
}

export function businessErrorResponse(event, error, requestId) {
  const known = isKwBusinessError(error)
  const code = known ? error.code : 'INTERNAL_ERROR'
  setResponseStatus(event, known ? error.statusCode : 500)
  setResponseHeader(event, 'Cache-Control', 'no-store, max-age=0')
  event.context.errorCode = code

  return {
    ok: false,
    error: {
      code,
      message: known ? error.publicMessage : '服务暂时不可用，请稍后再试。',
      requestId,
    },
  }
}
