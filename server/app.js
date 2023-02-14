const port = 9022;
const http = require("http");
const express = require("express");
const app = express();
const httpServer = http.createServer(app);

// app.set('secret', 'secreykey')

app.use(require("cors")());
app.use(express.json());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(express.static("../web"));
require("./module/websocket")(app, httpServer);
require("./module/http")(app, port);


httpServer.listen(port, () => {
  console.log("Listening on: http://localhost:" + port);
});
