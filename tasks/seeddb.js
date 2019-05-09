require('dotenv').config()
const { Client } = require('pg')
let clientCredentials
try { clientCredentials  = require('/clients/credentials') } catch(e) {}

const client = new Client({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE
})

if(clientCredentials) {
  client.connect()

  for(let cred of Object.values(clientCredentials)) {
    console.info('>>>>>Create Credentials for ',cred.name)

    client.query({
      text: 'INSERT INTO clients(api_key,secret,name,permissions,status) VALUES($1,$2,$3,$4,$5) ON CONFLICT(api_key) DO UPDATE SET secret=$2, name=$3, permissions=$4, status=$5',
      values: [cred.key,cred.secret,cred.name,cred.permissions,cred.status]
    }, (err) => {
      if(err) {
        if(err.code === '42P04') console.info(err.message)
        else console.error(err)
      }
    })
  }
  client.end()
} else {
  console.info('>>>>>client credentials not found :(')
}


//// CREATE ADMIN CLIENT CREDENTIALS
//client.query(`INSERT INTO clients(api_key,secret,name,permissions,status) VALUES('${process.env.ADMIN_API_KEY}','${process.env.ADMIN_API_SECRET}','Api Admin','{"api_admin"}','active') ON CONFLICT(api_key) DO UPDATE SET secret='${process.env.ADMIN_API_SECRET}'`, (err, res) => {
//  if(err) {
//    if(err.code === '42P04') {
//      console.info(err.message) 
//    } else {
//      console.log(err)
//    }
//  }
//  client.end()
//})

