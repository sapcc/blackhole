
require('dotenv').config()
const { Client } = require('pg')
const crypto = require('crypto')

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
})

async function main() {
  await client.connect()
  const res = await client.query({text: 'SELECT *,permissions FROM clients WHERE $1::text = ANY(permissions)', values: ['api_admin']})
  const apiClient = res.rows[0]
  const timestamp = Math.floor(Date.now()/1000+4000)  
  const signature = crypto.createHmac('sha256',apiClient.secret).update(`${timestamp}`).digest('base64')

  console.log(`${apiClient.api_key}.${signature}.${timestamp}`) 
  await client.end()
}

main()


