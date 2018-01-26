# webtask

This is a peer to peer chatroom based on Webtask. Users can login their account and create node.js and chat to others without using a database. The steps to start a chat includes,

1. Initialize your node (app).
2. Join the chatroom accoding to the link that an invitor sent you.
3. Send message to others.

The nodes organzied as a directed circle, once a new people join the chat room, he/she is added to the circle. I use Sandboxjs(https://webtask.io/docs/sandboxjs) to generate a Webtask dynamicly(a copy of node.js), which means a user can send a request to chatroom.js and get a link to his node(webtask). Another approach without using sandboxjs is copy node.js a lot of times. Both of them have some weakness.

*  Copy node.js multiple times makes it very hard to test and looks stupid.
*  Sandboxjs has a lot of limits. It seems I cannot change any variables in the webtask genertated by sandboxjs(cannot change the variables in context either), which forces me to use storage webservices(https://webtask.io/docs/webtask_storage) and create a database, which violate my design. Cannot use RESTful API in the webtask generated by sandboxjs.

In order to run a test case, I still choose to use Sandboxjs to generate the node.js

There are three files in use, 
* 'node.js' is the chat application. It is not used directly, but generated by 'chatroom.js'.
* 'chatroom.js' offers an interface to generate a webtask, whose code is the same as node.js.
* 'test.js' is a simple test case.

The following is the detail of the logic,
1. A new user ask chatroom.js to initialize a node.
2. Given a link of invitor, the new user send a 'accept' request to the invitor. 
3. The invitor set the new user as his next node in the linked circle, and send back its original next.
4. The new user set the original next as its next.
5. The new user send message to its next node, and the next node do the same actions, and so on.

The time cost of send a message is O(n), but can be improved to O(log(n)) by adding randoms links to a node besides 'next'. Using Sandboxjs makes this implementation complicated so I didn't implement that.



