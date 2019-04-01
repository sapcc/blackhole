exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('clients', {
    id: 'id',
    name: { type: 'varchar(100)' },
    api_key: { type: 'varchar(60)', unique: true, default: pgm.func('md5(random()::text || clock_timestamp()::text)::uuid')},
    secret: { type: 'varchar(60)', default: pgm.func('md5(random()::text)') },
    permissions: { type: 'text[]' },
    created_at: { type: 'timestamp', default: pgm.func('NOW()') },  
    updated_at: { type: 'timestamp', default: pgm.func('NOW()') },
    status: { type: 'varchar(50)', default: 'active' }
  })

  pgm.createIndex('clients', 'api_key')
  pgm.createIndex('clients', 'name')
  pgm.createIndex('clients', 'status')
  pgm.createIndex('clients', ['name','status'])
}

exports.down = (pgm) => {
  pgm.dropTable('clients', { ifExists: true })
}
