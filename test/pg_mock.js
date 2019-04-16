//const { Pool }  = require('pg')
//jest.mock('pg')
//
//module.exports = {
//  pgQueryMock:  (query,result) => {
//    const queryResults = {}
//
//    if(!result) {
//      query.forEach(q => queryResults[q.query] = q.result)
//    } else {
//      queryResults[query] = result
//    }
//
//    const client = {
//      query: (params) => {
//        if(queryResults['*']) return {rows: queryResults['*']}
//        return { rows: queryResults[params.text]}
//      },
//      release: jest.fn()
//    }
//
//    Pool.mockReset()
//    Pool.mockImplementation(() => ({connect: ()  => client}))
//  }
//}

jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    connect: () => ({
      query: jest.fn(),
      release: jest.fn()
    })
  }))
}))

let {Pool} = require('pg')

module.exports = {
  pgQueryMock: (func) =>    
    Pool.mockImplementation(() => ({
      connect: () => ({
        release: jest.fn(),
        query: func
      })
    }))
}
