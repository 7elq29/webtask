
import express from 'express';
import Webtask from 'webtask-tools';
import bodyParser from 'body-parser';
import request from 'request';
import http from 'http';

var _last,_next;
var name = 'chatroom';
const base_url = 'https://wt-040caf2a92b9642a965256774f21f340-0.run.webtask.io/';

function register(){
  const app = express();
  app.use(bodyParser.json());
  _last = name;
  _next = name;
  
  app.get('/login/:_name', (req, res, next) => {
    const { _name } = req.params;
    res.status(200).send(_name);
  }); 
  
  app.get('/join/:_name', (req, res) => {
    const { _name } = req.params;
    join(_name);
    res.status(200).send(_name);
  });
  
  app.get('/accept/:_name', (req, res) => {
    const { _name } = req.params;
    var n = _next;
    _next = _name;
    console.log('['+name+']Next node in the chain: '+_next); 
    res.status(200).send(n);
  });
  
  app.post('/post', (req, res) => {
    var message = req.body['message'];
    sendMessage(message);
    res.status(200).send();
  });
  
  app.post('/message', (req, res) => {
    const message = req.body['message'];
    const from = req.body['from'];
    console.log('['+name+'] print message:'+ message + ',from:'+from);
    res.status(200).send();
  });
  
  return app;
}


function join(invitor){
  request
  .get(base_url+invitor+'/accept/'+name)
  .on('response', function(response) { 
    if(response.statusCode==200) {
      _last = invitor;
      response.on('data', function(data) {
        _next = data; 
        console.log('['+name+']Joined chat room, next node in the chain is '+_next);
      });
      
    }else{
      console.log('['+name+']Fail to join the chat room, err:'+response.statusCode);
    }
  });
}

function sendMessage(message){
  console.log('['+name+'] message:'+message+', from:'+name);
  var  url = base_url+_next+'/message';
  console.log('['+name+'] send message to '+ url);
  var options = {
    uri: url,
    method: 'POST',
    body: {
      'message': message,
      'from': name
    },
    json: true 
  };
  request(options);
}



module.export = register();