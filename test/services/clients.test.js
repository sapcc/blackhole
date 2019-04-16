jest.mock('../../src/app.hooks.js', () => ({}))
jest.mock('../../src/services/clients/clients.hooks.js', () => ({}))

const app = require('../../src/app');

describe('\'Clients\' service', () => {
  it('registered the service', () => {
    const service = app.service('clients');
    service.hooks({})
    expect(service).toBeTruthy();
  })

  describe('api admin token', () => {
    beforeEach( () => {
      this.service = app.service('clients')
    })

    it('should not throw an error',async () => {
      await expect(this.service.find()).resolves.not.toBe(null)
    })
  })
})
