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

client.query(`CREATE DATABASE ${process.env.PGDATABASE}`, (err, res) => {
  if(err) {
    if(err.code === '42P04') {
      console.error(err.message)
    } else {
      console.log(err)
    }
  }
  client.end()
})
