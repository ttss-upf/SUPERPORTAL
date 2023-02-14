module.exports = (app, httpServer) => {
  const WebSocketServer = new require("websocket").server;
  const server = require("./server")(app);
  const wsServer = new WebSocketServer({
    httpServer: httpServer,
  });
  wsServer.on("request", function (request) {
    var connection = request.accept(null, request.origin);
    // connect
    server.on_connect(connection);
    // message
    connection.on("message", (msg) => {
      server.on_message(connection, msg);
    });
    // disconnect
    connection.on("close", () => {
      server.on_close(connection);
    });
  });
};
