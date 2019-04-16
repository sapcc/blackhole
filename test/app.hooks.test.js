jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    connect: () => ({
      query: jest.fn(),
      release: jest.fn()
    })
  }))
}))

let {Pool} = require('pg')

Pool.mockImplementation(() => ({
  connect: () => ({
    release: jest.fn(),
    query: (params) => { 
      if(params.text == 'SELECT * FROM clients WHERE api_key = $1::text' && params.values[0] == 'valid_api_key') {
        return {rows: [apiClientData]}
      } else return {rows: []}
    }
  })
}))

const feathers = require('@feathersjs/feathers')
const appHooks = require('../src/app.hooks')
const crypto = require('crypto')

const apiClientData = {api_key: 'valid_api_key', secret: 'secret', permissions: ['api_admin'], status: 'active' }

describe('app hooks', () => {
  let app
  let service

  beforeEach(() => {
    app = feathers()

    app.use('test', {
      async find() { return [] }
    })

    app.service('test').hooks(appHooks)
    service = app.service('test')
  })

  describe('before hook is called for all methods', () => {
    it('before hook for all is not empty', () => expect(appHooks.before.all.length).not.toBe(0))
  })


  describe('missing auth token', () => {
    it('returns 401 error', () => {
      return service.find().then().catch(res => {
        expect(res.code).toBe(401)
        expect(res.message).toEqual('Missing auth token. Please check the presence of auth token')
      })
    })
  }) 

  describe('invalid token syntax', () => {
    it('returns 401 error', () => {

      return service.find({authToken: 'invalid_token'}).catch(res => {
        expect(res.code).toBe(401)
        expect(res.message).toEqual('Invalid token. Please check the syntax of auth token')
      })
    })
  }) 

  describe('invalid timestamp', () => {
    it('token expired', () => {
      return service.find({authToken: `api_key.signature.${Math.floor(Date.now()/1000)}`}).catch(res => {
        expect(res.code).toBe(401)
        expect(res.message).toEqual('Token expired or out of time range!')
      })
    })
    it('token out of time range', () => {
      return service.find({authToken: `api_key.signature.${Math.floor(Date.now()/1000+8000)}`}).catch(res => {
        expect(res.code).toBe(401)
        expect(res.message).toEqual('Token expired or out of time range!')
      })
    })
  }) 

  describe('Bad API key', () => {
    it('Could not find api key', () => {
      return service.find({authToken: 'bad_api_key.signature.'+Math.floor(Date.now()/1000+1000)}).catch(res => {
        expect(res.code).toBe(401)
        expect(res.message).toEqual('Could not find api key')
      })
    })
  }) 

  describe('Bad signature', () => {
    it('throw 401 error', () => {
      const timestamp = Math.floor(Date.now()/1000+1000)
      const signature = 'bad_signature'
      return service.find({authToken: `valid_api_key.${signature}.${timestamp}`}).catch(res => {
        expect(res.code).toBe(401)
        expect(res.message).toEqual('Bad Signature')
      })
    })
  }) 

  describe('Valid signature', () => {
    it('do not throw an error', async () => {
      const timestamp = Math.floor(Date.now()/1000+1000)
      const signature = crypto.createHmac('sha256',apiClientData.secret).update(`${timestamp}`).digest('base64') 

      await expect(service.find({authToken: `valid_api_key.${signature}.${timestamp}`})).resolves.toEqual([])
    })
  }) 
})
