/* eslint-disable no-unused-vars */

const { Pool } = require('pg')

class Service {
  constructor (options) {
    this.pool = new Pool()
    this.options = options || {};
  }

  async find (params) {
    const client = await this.pool.connect()
    try {
      //const res = await client.query({text: 'SELECT * FROM alerts WHERE ends_at > NOW()'})
      const res = await client.query({text: 'SELECT * FROM alerts '})
      client.release()
      return res.rows
    } catch(e) { 
      return Promise.reject(e.message) //console.error(e.stack)
    }
  }

  async get (id, params) {
    return {
      id, text: `A new message with ID: ${id}!`
    };
  }

  async create (data, params) {
    if (Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
  }

  async update (id, data, params) {
    return data;
  }

  async patch (id, data, params) {
    return data;
  }

  async remove (id, params) {
    return { id };
  }
}

module.exports = function (options) {
  return new Service(options);
};

module.exports.Service = Service;
