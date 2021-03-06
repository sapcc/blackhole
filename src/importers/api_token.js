const crypto = require('crypto')

let currentAuthToken

const generateToken = () => {
  const timestamp = Math.floor(Date.now()/1000+Math.random()*60*60*1 + 60)
  const signature = crypto.createHmac('sha256', `${process.env.IMPORTER_API_SECRET}`)
    .update(`${timestamp}`).digest('base64')

  currentAuthToken = `${process.env.IMPORTER_API_KEY || 'admin'}.${signature}.${timestamp}`

  const timeout = ((timestamp-60)*1000)-Date.now()
  setTimeout(() => generateToken(), timeout)
} 

generateToken()

module.exports = { currentToken: () => currentAuthToken }
