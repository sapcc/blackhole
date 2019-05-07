/*eslint no-console: ["error", { allow: ["info","warn", "error"] }] */

require('dotenv').config()
const https = require('https')
const http = require('http')
const authToken = require('./api_token')

// load Data from api
const loadData = async (url) => {
  return new Promise((resolve) => {
    https.get(url, res => {
      res.setEncoding('utf8')
      let body = ''
      res.on('data', data => {
        body += data
      })
      res.on('end', () => resolve(body))
    })
  })
}

const sendToAPI = async (data) => {
  let httpOptions = {
    path: '/alerts?upsert=true',

    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
      'X-AUTH-TOKEN': authToken
    }
  }

  return new Promise((resolve) => {
    const req = http.request('http://0.0.0.0:3030',httpOptions, (res) => {
      console.info(':::::::::::::::::::::::::::::',res.statusCode)
      let body = ''
      res.on('data', (d) => body += d)
      res.on('end', () => resolve(body))
    })

    req.on('error',(error) => console.error('::::::::::::::::::ERROR',error))
    req.write(data)
    req.end()
  })
}

const run = async (intervallInSec) => {
  console.info(':::START ALERTS IMPORTER :::', 'INTERVALL:',intervallInSec)
  
  const start = Date.now()
  
  const data = await loadData(process.env.ALERTS_API_ENDPOINT)
  let result = await sendToAPI(data).then(res => JSON.parse(res))
  let timeout = start + (intervallInSec*1000) - Date.now()
  if(timeout<0) timeout = 0

  if (typeof result === 'object') {
    console.info(JSON.parse(data).length, 'alerts procceded in', (Date.now()-start), 'ms. ', 'added:', result.added.length, 'updated:', result.updated.length) 
  }

  console.info('next update in ', timeout/1000, 'seconds')
  setTimeout(() => run(intervallInSec), timeout)
}

module.exports = {run}
