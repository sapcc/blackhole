/*eslint no-console: ["error", { allow: ["info","warn", "error"] }] */

require('dotenv').config()
const axios = require('axios')
const tokenManager = require('./api_token')

// load Data from api
const loadData = async (url) => axios.get(url).then(response => response.data)
const API_ENDPOINT = 'http://' + (process.env.BLACKHOLE_SERVICE_HOST || 'localhost:3030') + '/alerts'

const sendToAPI = async (data) => (
  axios.post(
    API_ENDPOINT,
    data,
    {headers: { 'X-AUTH-TOKEN': tokenManager.currentToken() }}
  ).then(response => response.data)
)


const startImporter = async (intervallInSec) => {
  console.info(':::START ALERTS IMPORTER :::', 'INTERVALL:',intervallInSec)
  
  const start = Date.now() 
  const alerts = await loadData(process.env.ALERTS_API_ENDPOINT)
    .then(data => sendToAPI(data))
    .catch(e => console.error('::::::::::::::',e))

  let timeout = start + (intervallInSec*1000) - Date.now()
  if(timeout<0) timeout = 0

  if (typeof alerts === 'object') {
    console.info(alerts.added.length+alerts.updated.length, 'alerts procceded in', (Date.now()-start), 'ms. ', 'added:', alerts.added.length, 'updated:', alerts.updated.length) 
  }

  console.info('next update in ', timeout/1000, 'seconds')
  setTimeout(() => startImporter(intervallInSec).catch(e => console.error(e)), timeout)
}

const run = async (intervallInSec,immediate = true) => {
  if(immediate) startImporter(intervallInSec)
  else setTimeout(() => startImporter(intervallInSec), intervallInSec * 1000)
}

module.exports = {run}
