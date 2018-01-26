'use latest';
import express from 'express';
import Webtask from 'webtask-tools';
import bodyParser from 'body-parser';
import request from 'request';
import http from 'http';
var Sandbox = require('sandboxjs');

var token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IjIifQ.eyJqdGkiOiI1YjA3MTUxMGY3YWM0ZmExYWM5MTdiYWY5ZDdmOWE5ZCIsImlhdCI6MTUxNTU0NTI2NiwiY2EiOlsiOTAwNzMzNGRiMDhjNGQ2M2E0MTNjZGFmM2YzYjYxNGMiXSwiZGQiOjEsInRlbiI6Ii9ed3QtMDQwY2FmMmE5MmI5NjQyYTk2NTI1Njc3NGYyMWYzNDAtWzAtMV0kLyJ9.es87u83R3YrLNy_p1h77D4z1dJaKL_eT2n9-e3t7zgw";

// code of webtask, which is copied form node.js
var code = "'use latest';import express from 'express';import Webtask from 'webtask-tools';import bodyParser from 'body-parser';import request from 'request';import http from 'http';var _username = 'name_placeholder';const app = express();const TASK_NAME = 'node';app.use(bodyParser.json());  app.post('/', (req, res) => {  const command = req.body['command'];   const token = req.webtaskContext.token;  if(command == 'join'){    var invitor_url = req.body['invitor_url'];    join(invitor_url, token, function(httpstatus){      res.status(httpstatus).send();    });  }else if(command == 'accept'){    const url = req.body['next'];    const name = req.body['name'];    get_data('next', token, function(data){      set_data({        'next': url      }, token, function(){        res.status(200).send(data);      });    });  }else if(command == 'post'){    var message = req.body['message'];    sendMessage(message, token, _username);    res.status(200).send();  }else if(command == 'message'){    const message = req.body['message'];    const from = req.body['from'];    if(from != _username){      console.log('['+_username+'] '+from+' says: '+ message);      sendMessage(message, token, from);        res.status(200).send();  }else if(command == 'url'){    var url = req.body['url'];    set_data({      url: url,      next: url    }, token, function(){      res.status(200).send();    });  }else{    res.status(200).send('This is user '+_username+' url:'+_url);  }});function join(invitor_url, token, cb){  get_data('url', token, function(data){    var options = {      uri: invitor_url,      method: 'POST',      body: {        'command': 'accept',        'next': data,        'name': _username      },      json: true     };    request(options, function(err, httpResponse, body){      if(httpResponse.statusCode==200) {        set_data({          next: body        }, token, function(){          cb(httpResponse.statusCode);        });      }else{        console.log('['+_username+']Fail to join the chat room, err:'+httpResponse.statusCode);        cb(httpResponse.statusCode);      }    });  });}function sendMessage(message, token, from){ get_data('next', token, function(data){    var options = {      uri: data,      method: 'POST',      body: {        'command': 'message',        'message': message,        'from': from      },      json: true     };    request(options);  });}function get_all_data(token, cb){  var url = 'https://webtask.it.auth0.com/api/webtask/wt-040caf2a92b9642a965256774f21f340-0/'+TASK_NAME+'/data?key='+token;  var options = {    uri: url,    method: 'GET',    json: true   };  request(options, function(err, httpResponse, body){    if(httpResponse.statusCode==200) {      cb(JSON.parse(body['data']));    }else{      console.log(err);    }  });}function get_data(key, token, cb){  get_all_data(token, function(data){    cb(data[_username+'_'+key]);  });}function set_data(values, token, cb){  get_all_data(token, function(data){    for(var key in values){      data[_username+'_'+key] = values[key];    }    var options = {      uri: 'https://webtask.it.auth0.com/api/webtask/wt-040caf2a92b9642a965256774f21f340-0/'+TASK_NAME+'/data?key='+token,      method: 'PUT',      body: {        data: JSON.stringify(data)      },      json: true     };    request(options, function(err, httpResponse, body){      cb();    });  });}module.exports = Webtask.fromExpress(app);";

const app = express();
app.use(bodyParser.json());
var profile = Sandbox.fromToken(token);

app.get('/login/:_name', (req, res, next) => {
  const { _name } = req.params;
  var client = code.replace('name_placeholder', _name);
  profile.create(client, {secrets: {auth0:'rock'}}, function(err, webtask){
    res.status(200).send(webtask.url);
  });
}); 

module.exports = Webtask.fromExpress(app);


