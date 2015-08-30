var req = require('request'),
    argv = require('yargs').argv;

req.post('http://localhost:3000', { json: true, body: argv });
