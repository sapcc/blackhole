const alertsImporter = require('./alerts')

const immediate = process.env.NODE_ENV === 'production' ? true : false
// run Importers
alertsImporter.run(60, immediate)
