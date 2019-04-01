require('dotenv').config()
const { Client } = require('pg')

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: 'postgres'
})
client.connect()

client.query(`DROP DATABASE IF EXISTS ${process.env.PGDATABASE}`, (err, res) => {
  if(err) {
    console.error(err)
  }
  client.end()
})
