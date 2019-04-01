const { NotAuthenticated } = require('@feathersjs/errors')

module.exports = {
  before: {
    all: [
      (context) => {
        if(context.params.apiClient.permissions.indexOf('api_admin')<0 || context.params.apiClient.status !== 'active') {
          return Promise.reject(new NotAuthenticated('Not Authorized'))
        }
      }
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}

