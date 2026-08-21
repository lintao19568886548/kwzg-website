function responseStatus(error) {
  return Number(error?.statusCode || error?.status || error?.response?.status || 0)
}

export function describeDemoSubmissionError(error, contactPhone) {
  const status = responseStatus(error)
  const code = error?.data?.error?.code || ''
  const publicMessage = error?.data?.error?.message || ''
  const fieldErrors = {}

  if (code === 'INVALID_PHONE') fieldErrors.phone = publicMessage || '请输入正确的大陆手机号，支持 +86'
  if (code === 'INVALID_PARK_COUNT') fieldErrors.parkCount = publicMessage || '请输入 1 至 999 的整数'
  if (code === 'PRIVACY_REQUIRED') fieldErrors.privacy = publicMessage || '请先阅读并同意隐私政策'
  if (code === 'VALIDATION_ERROR' && publicMessage.includes('姓名')) fieldErrors.name = publicMessage

  if (Object.keys(fieldErrors).length > 0) {
    return { message: '请检查并修正表单内容后重新提交。', fieldErrors }
  }

  if (status === 429 || code === 'RATE_LIMITED') {
    return { message: '提交过于频繁，请稍后再试。', fieldErrors }
  }

  if (status === 503 || ['DATABASE_UNAVAILABLE', 'DATABASE_CONFIGURATION_ERROR', 'DATABASE_MIGRATION_REQUIRED', 'SERVER_CONFIGURATION_ERROR'].includes(code)) {
    return { message: '服务暂时不可用，请稍后再试。', fieldErrors }
  }

  if (status === 409) {
    return { message: '该预约已经受理，请勿重复提交。', fieldErrors }
  }

  if (status === 400 || status === 422) {
    return { message: publicMessage || '提交内容未通过校验，请检查后重试。', fieldErrors }
  }

  if (!status && !code) {
    return { message: '网络连接失败，请检查网络后重新提交。', fieldErrors }
  }

  return { message: `提交未完成，请稍后重试或拨打${contactPhone}联系我们。`, fieldErrors }
}
