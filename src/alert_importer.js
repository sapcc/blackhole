/*eslint no-console: ["error", { allow: ["info","warn", "error"] }] */

require('dotenv').config()
const { Pool } = require('pg')
const sql = require('sql');
const https = require('https')
const moment = require('moment')

const pool = new Pool()

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

const importData = async (data) => {
  let alerts = JSON.parse(data)
  const client = await pool.connect()
  try {
    // client.query('DELETE FROM alerts')
    // prepare datafor insert
    const values = []
    alerts.forEach(alert => {
      if(!alert.fingerprint || !alert.startsAt) return
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

    let Alert = sql.define({
      name: 'alerts',
      columns: ['fingerprint','starts_at','ends_at','label_names','label_values','inhibited_by','silenced_by','state','payload']
    })

    let query = Alert.insert(values).toQuery();
    query.text = query.text + ' ON CONFLICT (fingerprint,starts_at) DO UPDATE SET ends_at = excluded.ends_at, inhibited_by = excluded.inhibited_by, silenced_by = excluded.silenced_by, state = excluded.state, payload = excluded.payload'

    //  console.log(query.text)
    const res = await client.query(query)
    //console.log(res.rowCount)
    client.release()
    //console.log('released')
    return Promise.resolve(res.rowCount)
  } catch(e) {
    return Promise.reject(e.message) //console.error(e.stack)
  }
}

const main = async () => {
  const url = 'https://alertmanager.eu-de-1.cloud.sap/api/v2/alerts'
  try {
    const time = Date.now()
    const data = await loadData(url)
    //console.log(data)

    const rowCount = await importData(data)
    console.info(rowCount, 'alerts inserted in', (Date.now()-time), 'ms')
  } catch(e) {
    console.error(e)
  }
}

main()
setInterval(main,60*1000)
