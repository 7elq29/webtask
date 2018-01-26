'use latest';
import request from 'request'; 


// generate a webtask using sandboxjs
function create_node(index, username, cb){
  request
  .get('https://wt-040caf2a92b9642a965256774f21f340-0.run.webtask.io/chatroom/login/'+username, function optionalCallback(err, httpResponse, body){
    if(httpResponse.statusCode==200) {
      var url = body.replace('?', '/?');   // the webtask does not work with out this step
      login(index, url,cb);  // initialize the webtask
    }else{
      console.log("Fail to create the chatroom");
    }
  });
}

// create <count> webtasks, recursively. 
function create_all(count, index, cb){
  if(index>=count) return;
  create_node(index, 'user'+(index+1), function(i, data){
    cb(i, data);
    create_all(count, index+1, cb);
  });
}

/**
 * Initialize the webtask
 */
function login(index, data, cb){
  var options = {
    uri: data,
    method: 'POST',
    body: {
      'url': data,
      'command': 'url'
    },
    json: true 
  };
  request(options, function(err, httpResponse, body){
    if(httpResponse.statusCode==200) {
      cb(index, data);
    }else{
      console.log("Fail to login the chatroom");
    }
  });
}


/**
 * join the chat room according to invitor_url
 */
function join(username, base_url, invitor_url, cb){
  var options = {
    uri: base_url,
    method: 'POST',
    body: {
      'invitor_url': invitor_url,
      'command': 'join'
    },
    json: true 
  };
  request(options, function(error, httpResponse, body){
    if(httpResponse.statusCode==200) {
      console.log('['+username+'] join the chatroom');
      cb();
    }
  });
}


/**
 * let all users join the chatroom
 */ 
function join_all(usernames, urls, index, cb){
  if(index==usernames.length) {
    cb();
    return;
  }
  var invitor_url = index==0?urls[urls.length-1]:urls[index-1];
  var base_url = urls[index];
  join(usernames[index], base_url, invitor_url, function(){
    join_all(usernames, urls, index+1, cb);
  });
}

function send_message(from_url, message, cb){
  var options = {
    uri: from_url,
    method: 'POST',
    body: {
      'command': 'post',
      'message': message
    },
    json: true 
  };
  request(options);
  
}


function test(){
  var size = 5;  // number of users
  var usernames=[], urls=[];  // the name of users and their link to the webtask
  for(var i=1;i<=size;i++){
    usernames.push('user'+i);
  }
  create_all(size, 0, function(index, data){
    urls[index] = data;
    console.log('[user'+(index+1)+'] Initialized.');
  });
  setTimeout(function(){
    join_all(usernames, urls, 1, function(){
      test_send_message(urls);
    });
  },20000);
}


function test_send_message(urls){
  send_message(urls[0], 'hello world from user1');
  send_message(urls[5], 'hello world from user6');
}

/**
* @param context {WebtaskContext}
*/
module.exports = function(context, cb) {
  test();
  cb(null, { hello: context.query.name || 'Anonymous' });
};
