const redis = require('redis');
const manipulaLista = require('./manipula-lista');
const allowlist = redis.createClient({ predix: 'allowlist-refresh-token:' })

module.exports = manipulaLista(allowlist);
