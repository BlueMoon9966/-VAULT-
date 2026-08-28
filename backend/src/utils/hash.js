const bcrypt = require('bcrypt');
module.exports = { hash: (v) => bcrypt.hash(v, 10), compare: (v, h) => bcrypt.compare(v, h) };
