require('dotenv').config()
const https = require('https')
const { Pool } = require('pg')
const sql = require('sql');
const moment = require('moment')
const crypto = require('crypto')

const pool = new Pool()

// load Data from api
const loadData = async (url) => {
  return new Promise((resolve,reject) => {
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

// convert and prepare data for 
const prepareData = async (data) => {
  let alerts = JSON.parse(data)
  try {
    // client.query('DELETE FROM alerts')
    // prepare datafor insert
    const values = []
    alerts.forEach(alert => {
      if(!alert.fingerprint || !alert.startsAt) return
      const contentHash = crypto.createHash('md5')
      contentHash.update(JSON.stringify(alert))

      values.push({
        'content_hash': contentHash.digest('hex'),
        'fingerprint': alert.fingerprint, 
        'starts_at': moment(alert.startsAt), 
        'ends_at': moment(alert.endsAt), 
        'label_names': Object.keys(alert.labels), 
        'label_values': Object.values(alert.labels),
        'inhibited_by': alert.status.inhibitedBy, 
        'silenced_by': alert.status.silencedBy, 
        'state': alert.status.state,
        'payload': alert
      })
    })

    //console.log('released')
    return Promise.resolve(values)
    } catch(e) { 
      console.log(e)
    return Promise.reject(e) //console.error(e.stack)
  }
}

const doImport = async (alerts) => {
  const client = await pool.connect()

  let Alert = sql.define({
    name: 'alerts',
    columns: ['content_hash','fingerprint','starts_at','ends_at','label_names','label_values',
              'inhibited_by','silenced_by','state','payload']
  })


  let query = Alert.insert(alerts).toQuery()
  query.text += ' ON CONFLICT(fingerprint,starts_at) DO NOTHING RETURNING *'
  //console.log('::::::::::::',query.text)

  const res = await client.query(query)
  console.log(res.rowCount)
}

module.exports = async () => {
  console.log(':::IMPORT ALERTS:::')
  
  const time = Date.now()
  const data = await loadData(process.env.ALERTS_API_ENDPOINT)
  const alerts = await prepareData(data)
  await doImport(alerts)
 
  console.log(alerts.length, 'alerts imported in', (Date.now()-time), 'ms') 
}
