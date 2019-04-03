exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('alerts',{
    id: 'id',
    fingerprint: {type: 'varchar(100)'},
    starts_at: {type: 'timestamp'},
    ends_at: {type: 'timestamp'},
    created_at: {type: 'timestamp', default: pgm.func('NOW()')},
    updated_at: {type: 'timestamp', default: pgm.func('NOW()')},
    label_names: {type: 'text[]'},
    label_values: {type: 'text[]'},
    inhibited_by: {type: 'text[]'},
    silenced_by: {type: 'text[]'},
    state: {type: 'varchar(20)'},
    payload: {type: 'jsonb'}
  })

  pgm.createIndex('alerts', ['fingerprint','starts_at'], {unique: true})
  pgm.createIndex('alerts', ['fingerprint','starts_at','ends_at'])
  pgm.createIndex('alerts', ['starts_at','ends_at'])
  pgm.createIndex('alerts', 'label_names', {method: 'gin'})
  pgm.createIndex('alerts', 'label_values', {method: 'gin'})
  pgm.createIndex('alerts', 'silenced_by', {method: 'gin'})
  pgm.createIndex('alerts', 'inhibited_by', {method: 'gin'})
  pgm.createIndex('alerts', 'state')
}

exports.down = (pgm) => {
  pgm.dropTable('alerts')
}
