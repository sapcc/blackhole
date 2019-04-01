const { Pool }  = require('pg')
jest.mock('pg')

module.exports = {
  pgQueryMock:  (query,result) => {
    const queryResults = {}

    if(!result) {
      query.forEach(q => queryResults[q.query] = q.result)
    } else {
      queryResults[query] = result
    }

    const client = {
      query: (params) => {
        if(queryResults['*']) return {rows: queryResults['*']}
        return { rows: queryResults[params.text]}
      },
      release: jest.fn()
    }

    Pool.mockReset()
    Pool.mockImplementation(() => ({connect: ()  => client}))
  }
}
