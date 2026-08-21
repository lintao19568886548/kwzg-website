export const mobileDialUserAgentPattern = /MicroMessenger|Android|iPhone|iPad|Mobile/i

export function shouldAttemptAutomaticDial(userAgent = '') {
  return mobileDialUserAgentPattern.test(userAgent)
}

export function createSingleDialAttempt(phoneHref, navigate) {
  let attempted = false

  return () => {
    if (attempted) return false
    attempted = true
    navigate(phoneHref)
    return true
  }
}
