import paypal from '@paypal/checkout-server-sdk'

//Configure PayPal env
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET

  
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
  //production: return new paypal.core.LiveEnvironment(clientId, clientSecret)
}

//PayPal client
function client() {
  return new paypal.core.PayPalHttpClient(environment())
}

export default client

