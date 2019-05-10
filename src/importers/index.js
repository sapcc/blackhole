const alertsImporter = require('./alerts')

// run Importers
alertsImporter.run(60)

if(process.env.NODE_ENV === 'production') {
  const app = require('express')()
  app.use('/system/readiness', (req,res) => res.sendStatus(200))
  app.use('/system/liveliness', (req,res) => res.sendStatus(200))
  app.listen(80)
}
