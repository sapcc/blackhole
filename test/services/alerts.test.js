jest.mock('../../src/app.hooks.js', () => ({}))
jest.mock('../../src/services/alerts/alerts.hooks.js', () => ({}))

const app = require('../../src/app');

describe('\'alerts\' service', () => {
  it('registered the service', () => {
    const service = app.service('alerts');
    expect(service).toBeTruthy();
  });
});
