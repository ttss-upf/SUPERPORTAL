const { log } = require("console");
var http = require("http");
var url = require("url");
// var ws = new WebSocket("http://localhost:3000");
var server = http.createServer(function (request, response) {
  console.log("REQUEST: " + request.url);
  var url_info = url.parse(request.url, true); //all the request info is here
  var pathname = url_info.pathname; //the address
  var params = url_info.query; //the parameters
  response.end("server connecting"); //send a response
});

server.listen(3000, function () {
  // console.log(url_info, pathname, params)
  console.log("Server ready!");
});

var WebSocketServer = require("websocket").server;
var userId = 0;
wsServer = new WebSocketServer({
  // create the server
  httpServer: server, //if we already have our HTTPServer in server variable...
});
wsServer.on("request", function (request) {
  log(request.resourceURL.pathname.slice(1))
  var connection = request.accept(null, request.origin);
  connection.groupName = request.resourceURL.pathname.slice(1)
  userId++;

  console.log("NEW WEBSOCKET USER!!!");
  connection.send(userId);

  connection.on("message", function (message) {
    console.log(message);
    if (message.type === "utf8") {
      data = JSON.parse(message.utf8Data);
      console.log("NEW MSG: " + data.content); // process WebSocket message
      let res = {
        content: data.content,
        type: "text",
        author_id: data.senderId,
      };
      wsServer.connections.forEach((conn) => {
        if (conn != connection && conn.groupName == connection.groupName) {
          conn.sendUTF(JSON.stringify(res));
        }
      });
    }
  });

  connection.on("close", function (connection) {
    console.log("USER IS GONE"); // close user connection
  });
});
