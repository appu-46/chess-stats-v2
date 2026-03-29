/**
 * Processes the window.location.hash, extracts the token, and clears the hash.
 * @returns {string | null} The extracted access token, or null if not found.
 */
export function processAndClearAccessToken(): string | null {
  // 1. Get the fragment string (starts with #)
  const hash = window.location.hash

  // Check if the hash exists and is not empty
  if (!hash) {
    return null
  }

  // 2. Parse the hash as standard URL query parameters
  // We strip the leading '#' for correct parsing
  const params = new URLSearchParams(hash.substring(1))
  const accessToken = params.get('access_token')

  // Check if the access_token was actually in the hash
  if (!accessToken) {
    return null
  }

  history.replaceState(
    null,
    document.title,
    window.location.pathname + window.location.search,
  )

  // 4. Return the token for use (e.g., storing it in localStorage or a state variable)
  sessionStorage.setItem('access_token', accessToken)
  // console.log(accessToken)
  return accessToken
}
