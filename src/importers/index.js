const alertsImporter = require('./alerts')

module.exports = () => {
  alertsImporter.run(60)
}
