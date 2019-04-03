// Application hooks that run for every services

const { NotAuthenticated } = require('@feathersjs/errors');
const { Pool } = require('pg')
const log = require('./hooks/log');
const crypto = require('crypto')

// cache api client data
const apiClients = {}

const loadApiClientData = async (apiKey) => {
  if(apiClients.hasOwnProperty(apiKey)) return apiClients[apiKey]
  try {
    const pool = new Pool()
    const client = await pool.connect()
    const res = await client.query({text: 'SELECT * FROM clients WHERE api_key = $1::text', values: [apiKey]})
    client.release()
    apiClients[apiKey] = res.rows[0]
    return apiClients[apiKey]
  } catch(e) { 
    return null 
  }
}

const validateAuthToken = async  (context) => {
  try {
    if(!context.params.authToken) {
      return Promise.reject(
        new NotAuthenticated('Missing auth token. Please check the presence of auth token')
      )
    }
    const [apiKey,signature,timestamp] = context.params.authToken.split('.')
    if(!apiKey || !signature || !timestamp) {
      return Promise.reject(new NotAuthenticated('Invalid token. Please check the syntax of auth token'))
    }
    const expirationTime = Number.parseInt(timestamp)
    if(Number.isNaN(expirationTime)) return Promise.reject(new NotAuthenticated('Invalid timestamp.'))
    const now = Math.floor(Date.now()/1000)

    if(expirationTime < now+60 || expirationTime > now + (60 * 60 * 2)) {
      return Promise.reject(new NotAuthenticated('Token expired or out of time range!'))
    }

    const apiClientData = await loadApiClientData(apiKey)
    if(!apiClientData) return Promise.reject(new NotAuthenticated('Could not find api key'))

    const refSignature  = crypto.createHmac('sha256', apiClientData.secret).update(timestamp).digest('base64')
    if(signature!=refSignature) return Promise.reject(new NotAuthenticated('Bad Signature'))

    delete context.params.apiClient
    delete context.params.query.apiClient
    context.params.apiClient = { ...apiClientData, secret: '' }

  } catch(e) { return Promise.reject(new NotAuthenticated(e.message))}

}

module.exports = {
  before: {
    all: [ 
      log(),
      validateAuthToken
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [ log() ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
