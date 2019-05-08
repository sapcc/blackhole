require('dotenv').config()
const { Client } = require('pg')
let clients 
try { clients  = require('/clients/credentials') } catch(e) {}

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
})

client.connect()


if(clients) {
  clients.forEach(client => console.info(client.name))
} else {
  console.info('::::::::::::::::::::::clients not found :(')
}

// CREATE ADMIN CLIENT CREDENTIALS
client.query(`INSERT INTO clients(api_key,secret,name,permissions,status) VALUES('${process.env.ADMIN_API_KEY}','${process.env.ADMIN_API_SECRET}','Api Admin','{"api_admin"}','active') ON CONFLICT(api_key) DO UPDATE SET secret='${process.env.ADMIN_API_SECRET}'`, (err, res) => {
  if(err) {
    if(err.code === '42P04') {
      console.info(err.message) 
    } else {
      console.log(err)
    }
  }
  client.end()
})

