require('dotenv').config()
const { Client } = require('pg')
let clientCredentials = require('../config/defaultClients/credentials') 

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
})

if(clientCredentials) {
  const queries = Object.values(clientCredentials).map( cred => { 
    return client.query('INSERT INTO clients(api_key,secret,name,permissions,status) VALUES($1,$2,$3,$4,$5) ON CONFLICT(api_key) \
      DO UPDATE SET secret=$2, name=$3, permissions=$4, status=$5',[cred.key,cred.secret,cred.name,cred.permissions,cred.status])
  })

  client.connect()
  Promise.all(queries).then(() => client.end()).catch(err => {
    if(err.code === '42P04') console.info(err.message)
    else console.error(err) 
  })
}
