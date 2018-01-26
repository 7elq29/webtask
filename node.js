'use latest';
import express from 'express';
import Webtask from 'webtask-tools';
import bodyParser from 'body-parser';
import request from 'request';
import http from 'http';

var _username = 'name_placeholder';  

const app = express();
const TASK_NAME = 'node';
app.use(bodyParser.json());
  
/**
 * Not use RESTful API because Sandboxjs doesn't support that.
 * 
 * A node is both a client and a server that can receive messages from other nodes and send messages.
 * Nodes are linked as a circle. Each node maintains a link to the next node.
 **/
app.post('/', (req, res) => {
  const command = req.body['command']; 
  const token = req.webtaskContext.token;
  /**
   * Join the chatroom according to a link given by invitor.
   */
  if(command == 'join'){  
    var invitor_url = req.body['invitor_url'];
    join(invitor_url, token, function(httpstatus){
      res.status(httpstatus).send();
    });
  /**
   * Accept a join request.
   */ 
  }else if(command == 'accept'){
    const url = req.body['next'];   // next node in the circle
    const name = req.body['name'];
    get_data('next', token, function(data){  // get the current next 
      set_data({
        'next': url  // update next to the link of new node
      }, token, function(){
        res.status(200).send(data); // return the original next 
      });
    });
  /**
   * Post a message
   */ 
  }else if(command == 'post'){
    var message = req.body['message'];
    sendMessage(message, token, _username);
    res.status(200).send();
  /**
   * Receive a message
   */ 
  }else if(command == 'message'){
    const message = req.body['message'];
    const from = req.body['from']; // origin of the message
    if(from != _username){  // if the message is sent by this node, stop
      console.log('['+_username+'] '+from+' says: '+ message);
      sendMessage(message, token, from);
    }
    res.status(200).send();
  /**
   * Initialize a new client
   */
  }else if(command == 'url'){
    var url = req.body['url']; // link of the node
    set_data({
      url: url,
      next: url   // set next to itself
    }, token, function(){
      res.status(200).send();
    });
  }else{
    res.status(200).send('This is user '+_username+' url:'+_url);
  }
});

function join(invitor_url, token, cb){
  get_data('url', token, function(data){ 
    var options = {
      uri: invitor_url,   // send a join request to invitor
      method: 'POST',
      body: {
        'command': 'accept',
        'next': data,
        'name': _username
      },
      json: true 
    };
    request(options, function(err, httpResponse, body){
      if(httpResponse.statusCode==200) {
        set_data({
          next: body  // set next to the next of invitor
        }, token, function(){
          cb(httpResponse.statusCode);
        });
      }else{
        console.log('['+_username+']Fail to join the chat room, err:'+httpResponse.statusCode);
        cb(httpResponse.statusCode);
      }
    });
  });
}

function sendMessage(message, token, from){
  get_data('next', token, function(data){
    var options = {
      uri: data,
      method: 'POST',
      body: {
        'command': 'message',
        'message': message,
        'from': from
      },
      json: true 
    };
    request(options);
  });
}

// read data using storage webservice
function get_data(key, token, cb){
  get_all_data(token, function(data){
    cb(data[_username+'_'+key]);
  });
}

// write data using storage webservice
function set_data(values, token, cb){
  get_all_data(token, function(data){
    for(var key in values){
      data[_username+'_'+key] = values[key];
    }
    var options = {
      uri: 'https://webtask.it.auth0.com/api/webtask/wt-040caf2a92b9642a965256774f21f340-0/'+TASK_NAME+'/data?key='+token,
      method: 'PUT',
      body: {
        data: JSON.stringify(data)
      },
      json: true 
    };
    request(options, function(err, httpResponse, body){
      cb();
    });
  });
}

// read all the data in the storage
function get_all_data(token, cb){
  var url = 'https://webtask.it.auth0.com/api/webtask/wt-040caf2a92b9642a965256774f21f340-0/'+TASK_NAME+'/data?key='+token;
  var options = {
    uri: url,
    method: 'GET',
    json: true 
  };
  request(options, function(err, httpResponse, body){
    if(httpResponse.statusCode==200) {
      cb(JSON.parse(body['data']));
    }else{
      console.log(err);
    }
  });
}

module.exports = Webtask.fromExpress(app);
