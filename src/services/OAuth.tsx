export function oauthSignIn() {
  const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID
  const REDIRECTION_URI = import.meta.env.VITE_REDIRECTION_URI

  const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

  const form = document.createElement('form')
  form.setAttribute('method', 'GET')
  form.setAttribute('action', oauth2Endpoint)
  // form.setAttribute('target', '_blank')

  const params = {
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: REDIRECTION_URI,
    response_type: 'token',
    scope: 'openid email profile',
    include_granted_scopes: 'true',
    state: 'pass-through value',
  }

  for (const p in params) {
    const key = p as keyof typeof params
    const input = document.createElement('input')
    input.setAttribute('type', 'hidden')
    input.setAttribute('name', p)
    input.setAttribute('value', params[key])
    form.appendChild(input)
  }

  // Add form to page and submit it to open the OAuth 2.0 endpoint.
  document.body.appendChild(form)
  form.submit()
}

export async function fetchGoogleUser(token: string) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`)

  return res.json()
}
