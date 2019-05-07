/*eslint no-console: ["error", { allow: ["info","warn", "error"] }] */
const { Pool } = require('pg')
const pgSql = require('sql');
const crypto = require('crypto')
const moment = require('moment')

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Alert:
 *       type: object
 *       properties:
 *         annotations:
 *           type: string
 *           format: date-time
 *         startsAt:
 *           type: string
 *           format: date-time
 *         endsAt:
 *           type: timestamp
 *         labels:
 *           type: object
 *         generatorURL:
 *           type: string
 *         status:
 *           type: object
 *           description: a valid **JSON** string
 *         receivers:
 *           type: array
 *         fingerprint:
 *           type: string
 *       example:
 *         annotations: {"description": "some description", "summary": "some summary"}
 *         startsAt: "2019-03-20T09:46:15.299542732Z"
 *         endsAt: "2019-04-04T11:43:15.299542732Z"
 *         labels: {"alertname": "KubernetesSchedulerScrapeMissing","cluster": "s-na-us-3"}
 *         generatorURL: "https://prometheus-scaleout.na-us-3.cloud.sap/graph?g0.expr=absent%28up%7Bjob%3D%22kube-system%2Fscheduler%22%7D%29&g0.tab=1"
 *         status: {"state": "active", "silencedBy": [], "inhibitedBy": null}
 *         receivers: []
 *         fingerprint: "00b6517a0f7f1586"
 *
 */
class Service {
  constructor (options) {
    this.pool = new Pool()
    this.options = options || {}
  }

  /**
   * @swagger
   * /alerts:
   *   get:
   *     description: Retrieve a list of alerts. Returns current alerts if no query parameter is provided.
   *     summary: GET /alerts
   *     tags:
   *       - alerts
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: query
   *         name: date_start
   *         description: get alerts started at data_start
   *         schema:
   *           type: string
   *           format: date-time
   *           example: '?data_start=2019-03-04T09:46:15'
   *       - in: query
   *         name: data_end
   *         description:  get alerts ended at data_end
   *         schema:
   *           type: string
   *           format: date-time
   *           example: '?data_end=2019-03-06'
   *       - in: query
   *         name: ANY LABEL
   *         description: filter by label. Multiple label filters are combined by AND
   *         schema:
   *           type: string
   *           example: '?alertname=Test&region=eu-de-1'
   *       -
   *         $ref: '#/components/parameters/page'
   *       -
   *         $ref: '#/components/parameters/per_page'
   *       - in: query
   *         name: include_metadata
   *         schema:
   *           type: bool
   *           default: true
   *           example: '?include_metadata=true'
   *
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 _metadata:
   *                   $ref: '#/components/schemas/Metadata'
   *                 alerts:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Alert'
   *
   *         headers:
   *           Link:
   *             description: pagination links
   *             schema:
   *               type: string
   *               example:
   *                 '<https://blackhole-api.cloud.sap/alerts?per_page=20&page=5>; rel="next",
   *                  <https://blackhole-api.cloud.sap/alerts?per_page=20&page=10>; rel="last",
   *                  <https://blackhole-api.cloud.sap/alerts?per_page=20&page=1>; rel="first",
   *                  <https://blackhole-api.cloud.sap/alerts?per_page=20&page=4>; rel="prev"'
   *
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/UnexpectedError'
   */
  async find (params) {
    let {include_metadata,per_page,page,date_start,date_end, ...labels} = params.query

    if(!per_page || per_page > 1000) per_page = 1000
    if(per_page < 1) per_page = 1
    if(!page || page <= 0) page = 1

    const offset = (page-1) * per_page
    const includeMetadata = include_metadata !== 'false'
    const dateStart = date_start && moment(date_start)
    const dateEnd = date_end && moment(date_end)

    const client = await this.pool.connect()
    try {
      // build sql query
      let query = {text: 'SELECT * FROM alerts', values: []}

      // add time range constrains
      if(dateStart && !dateEnd) {
        query.text += ' WHERE starts_at >= $1'
        query.values = [dateStart]
      } else if(!dateStart && dateEnd) {
        query.text += ' WHERE ends_at <= $1'
        query.value = [dateEnd]
      } else if (dateStart && dateEnd) {
        query.text += ' WHERE starts_at >= $1 AND ends_at <= $2'
        query.values = [dateStart, dateEnd]
      } else {
        query.text += ' WHERE ends_at > NOW()'
      }

      // add labels filter
      if(labels) {
        Object.keys(labels).forEach((label) => {
          query.text += ` AND payload -> 'labels' ->> $${query.values.length+1} = $${query.values.length+2} `
          query.values.push(label,labels[label])
        })
      }

      // add offset and limit
      query.text += ` LIMIT $${query.values.length+1} OFFSET $${query.values.length+2}`
      query.values.push(per_page,offset)

      // console.log(query.text)

      // Load alerts
      const res = await client.query(query)
      const alerts = res.rows.map(row => row.payload)
      // release client back to the pool
      client.release()

      if(includeMetadata) {
        // get total count of alerts
        const totalRes = await client.query('SELECT COUNT(*) FROM alerts')
        const total = (totalRes.rows[0] || {}).count

        return {
          _metadata: {
            page: page,
            per_page: per_page,
            page_count: Math.ceil(total/per_page),
            total_count: total,
            links: [

            ]
          },
          alerts
        }
      } else {
        return alerts
      }
    } catch(e) {
      return Promise.reject(e) //console.error(e.stack)
    }
  }

  async get (id/*, params*/) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  /**
   * @swagger
   * /alerts:
   *   post:
   *     description: Creates or updates one or a bulk of alerts.
   *     summary: POST /alerts
   *     tags:
   *       - alerts
   *     produces:
   *       - application/json
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: array
   *             items:
   *               $ref: '#/components/schemas/Alert'
   *     responses:
   *       201:
   *         description: Created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 added:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Alert'
   *                 updated:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Alert'
   *
   *         headers:
   *           Link:
   *             description: pagination links
   *             schema:
   *               type: string
   *               example:
   *                 '<https://blackhole-api.cloud.sap/alerts?per_page=20&page=5>; rel="next",
   *                  <https://blackhole-api.cloud.sap/alerts?per_page=20&page=10>; rel="last",
   *                  <https://blackhole-api.cloud.sap/alerts?per_page=20&page=1>; rel="first",
   *                  <https://blackhole-api.cloud.sap/alerts?per_page=20&page=4>; rel="prev"'
   *
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       500:
   *         $ref: '#/components/responses/UnexpectedError'
   */
  // acts as UPSERT (UPDATE OR INSERT)
  // It returns allways a hash of added and updated arrays
  async create (data) {
    // prepare data to fit the database structure
    let alerts = await this.prepareData(data)
    if(!alerts || alerts.length === 0) return []
    // create sql query and insert alerts 
    const sql = await this.createSqlQuery()
    const query = sql.insert(alerts).toQuery()
    
    query.text += ' ON CONFLICT(fingerprint,starts_at) DO UPDATE SET ends_at = excluded.ends_at, inhibited_by = excluded.inhibited_by, silenced_by = excluded.silenced_by, state = excluded.state, payload = excluded.payload, updated_at = NOW() WHERE MD5(alerts.payload::TEXT) != MD5(excluded.payload::TEXT) RETURNING *'
      
    const now = new Date() 
    const res = await this.executeSqlQuery(query)
    // sort modified alerts to added and updated based on created date
    const result = { added: [], updated: [] }
    res.rows.forEach( alert => {
      // console.log(alert.created_at,now)
      alert.created_at >= now ? result.added.push(alert.payload) : result.updated.push(alert.payload)
    })

    return result 
  }
  
  // ######################### HELPER FUNCTIONS ######################
  async executeSqlQuery(query) {
    // reserve a client from the pool
    const client = await this.pool.connect()
    const res = await client.query(query)
    // IMPORTANT!!! release client back to the pool
    client.release()
    return res
  }
  async createSqlQuery () {
    return pgSql.define({
      name: 'alerts',
      columns: [
        'fingerprint','starts_at','ends_at','created_at','updated_at','label_names',
        'label_values','inhibited_by','silenced_by','state','payload'
      ]
    })
  }
  // convert and prepare data for 
  async prepareData (data) {
    let alerts = (typeof data === 'string') ? JSON.parse(data) : data
    if(!Array.isArray(alerts)) alerts = [alerts]

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
      return values
    } catch(e) { return Promise.reject(e) } 
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
