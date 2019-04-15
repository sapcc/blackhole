/*eslint no-console: ["error", { allow: ["info","warn", "error"] }] */

require('dotenv').config()
const https = require('https')
const { Pool } = require('pg')
const sql = require('sql');
const moment = require('moment')
const crypto = require('crypto')

const pool = new Pool()

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

// convert and prepare data for 
const prepareData = async (data) => {
  let alerts = JSON.parse(data)
  try {
    // prepare datafor insert
    const values = []
    alerts.forEach(alert => {
      if(!alert.fingerprint || !alert.startsAt) return
      const contentHash = crypto.createHash('md5')
      contentHash.update(JSON.stringify(alert))

      values.push({
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
    console.error(e)
    return Promise.reject(e) //console.error(e.stack)
  }
}

const doImport = async (alerts) => {
  const client = await pool.connect()

  let Alert = sql.define({
    name: 'alerts',
    columns: ['fingerprint','starts_at','ends_at','created_at','updated_at','label_names','label_values',
      'inhibited_by','silenced_by','state','payload']
  })


  let query = Alert.insert(alerts).toQuery()
  // add ON CONFLICT to the queryy. 
  // This query inserts or updates alerts based on fingerprint, created_at and a content hash of payload.
  query.text += ' ON CONFLICT(fingerprint,starts_at) DO UPDATE SET ends_at = excluded.ends_at, inhibited_by = excluded.inhibited_by, silenced_by = excluded.silenced_by, state = excluded.state, payload = excluded.payload, updated_at = NOW() WHERE MD5(alerts.payload::TEXT) != MD5(excluded.payload::TEXT) RETURNING *'
  
  const now = new Date() 
  const res = await client.query(query)

  //client.query('SELECT COUNT(*) FROM alerts').then(res => console.info(res.rows[0].count))
  // IMPORTANT!!!
  client.release()

  // sort modified alerts to added and updated based on created date
  const result = { added: [], updated: [] }
  res.rows.forEach( alert => {
    // console.log(alert.created_at,now)
    alert.created_at >= now ? result.added.push(alert.payload) : result.updated.push(alert.payload)
  })

  return Promise.resolve(result)
}

module.exports = async () => {
  console.info(':::IMPORT ALERTS:::')
  
  const time = Date.now()
  const data = await loadData(process.env.ALERTS_API_ENDPOINT)
  const alerts = await prepareData(data)
  const changes = await doImport(alerts)
 
  console.info(alerts.length, 'alerts procceded in', (Date.now()-time), 'ms. ', 'added:',changes.added.length, 'updated:', changes.updated.length) 
  return changes
}
