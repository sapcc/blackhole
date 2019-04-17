require('../src/importers/alerts')

module.exports = () => {
  jest.mock('pg', () => ({
    Pool: jest.fn(() => ({
      connect: () => ({
        query: jest.fn(() => ({rows: []})),
        release: jest.fn()
      })
    }))
  }))
  jest.mock('../src/importers/alerts', () => () => null)
  jest.mock('../src/app.hooks.js', () => ({}))
  jest.mock('../src/services/alerts/alerts.hooks.js', () => ({}))
  jest.mock('../src/services/clients/clients.hooks.js', () => ({}))
}
