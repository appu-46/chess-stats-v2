export function processAndClearAccessToken(): string | null {
  const hash = window.location.hash
  if (!hash) return null

  const params = new URLSearchParams(hash.substring(1))
  const accessToken = params.get('access_token')
  if (!accessToken) return null

  const expiresIn = params.get('expires_in')

  history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search,
  )

  sessionStorage.setItem('access_token', accessToken)
  if (expiresIn) {
    sessionStorage.setItem(
      'token_expiry',
      String(Date.now() + Number(expiresIn) * 1000),
    )
  }

  return accessToken
}
