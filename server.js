'use strict';

const argv = require('yargs').argv,
      express = require('express'),
      path = require('path'),
      bodyParser = require('body-parser'),
      cp = require('child_process'),
      colours = require('colors'),
      config = require('./config'),
      log = s => console.log(s.blue.bold),
      testCmds = {
        mspec: [
          'Machine.Specifications.Runner.Console.0.9.1\\tools\\mspec-clr4.exe',
          (config.mSpecTestProjects || [])
            .map(proj => path.join(config.solutionRoot, proj, 'bin/Debug', proj + '.dll'))
         ],
       newman: [
          '', []
       ]
     },
     runTestP = name => {
       const cmd = testCmds[name];
       log('Starting ' + name);
       return new Promise(function(resolve, reject) {
         cp
           .spawn(cmd[0], cmd[1], {stdio: "inherit"})
           .on('exit', function(){
             log('Finished ' + name);
             resolve();
         });
       });
     },
     testRunners = config.runners.map(name => () => runTestP(name));

let running = false;
function runTests(){
  if (!running){
    running = true;
    testRunners
      .reduce((p, r) => p.then(r), Promise.resolve())
      .then(function() {
        log('All tests run');
        running = false;
      });
  }
}

express()
  .use(bodyParser.json())
  .post('/', function(req, res){
      if (req.body.action === 'build' &&
          req.body.solution === config.solutionName)
        runTests();
      res.sendStatus(200);
  })
  .listen(3000);
