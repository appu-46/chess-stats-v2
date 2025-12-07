export function oauthSignIn() {
  const OAUTH_CLIENT_ID = import.meta.env.VITE_OAUTH_CLIENT_ID
  const REDIRECTION_URI = 'http://localhost:3000/'

  console.log(OAUTH_CLIENT_ID)
  // Google's OAuth 2.0 endpoint for requesting an access token
  const oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth'

  // Create <form> element to submit parameters to OAuth 2.0 endpoint.
  const form = document.createElement('form')
  form.setAttribute('method', 'GET') // Send as a GET request.
  form.setAttribute('action', oauth2Endpoint)
  form.setAttribute('target', '_blank')

  // Parameters to pass to OAuth 2.0 endpoint.
  const params = {
    client_id: OAUTH_CLIENT_ID,
    redirect_uri: REDIRECTION_URI,
    response_type: 'token',
    scope: 'openid email profile',
    include_granted_scopes: 'true',
    state: 'pass-through value',
  }

  // Add form parameters as hidden input values.
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
