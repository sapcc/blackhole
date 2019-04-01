const app = require('../../src/app');
const crypto = require('crypto')
const { pgQueryMock } = require('../pg_mock')

const apiClientData = {api_key: 'api_admin', secret: 'secret', permissions: ['api_admin'] }

const createValidToken = (apiKey,secret) => {
  const timestamp = Math.floor(Date.now()/1000+1000)
  const signature = crypto.createHmac('sha256',secret).update(`${timestamp}`).digest('base64')
  return `${apiKey}.${signature}.${timestamp}`
}

describe('\'Clients\' service', () => {
  it('registered the service', () => {
    const service = app.service('clients');
    expect(service).toBeTruthy();
  })

  describe('api admin token', () => {
    const token = createValidToken(apiClientData.api_key,apiClientData.secret)
    beforeEach(done => {
      pgQueryMock([
        { query: `SELECT * FROM clients WHERE api_key = 'api_admin'`, result: [apiClientData] }
      ])
      this.service = app.service('clients')
      done()
    })

    it('should not throw an error',() => {
      expect(() => {
        this.service.find({authToken: token})
      }).not.toThrow()
    })

    it('runs find', () => {
      this.service.find({authToken: token}).then((clients) => {
        expect(clients.length).toEqual(0)
      })
    })
  })
})
