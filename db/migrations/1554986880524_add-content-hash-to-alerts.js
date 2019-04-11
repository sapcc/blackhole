exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumns('alerts',{
    'content_hash': { type: 'varchar(50)' }
  })

  pgm.addIndex('alerts','content_hash')
}

exports.down = (pgm) => {
  pgm.dropIndex('alerts', 'content_hash')
  pgm.dropColumns('alerts', 'content_hash')

}
