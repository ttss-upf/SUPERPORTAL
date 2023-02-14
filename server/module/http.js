module.exports = (app, port) => {
  const server = require("./server")(app);
  app.get("/1", (req, res, next) => {
    return res.send("Server connected using port " + port);
  });
  app.post("/login", async (req, res, next) => {
    await server.on_login(req, res, next);
  });

  app.post("/save", async (req, res, next) => {
    const data = req.body;
    await redis.set(data.key, data.value);
    res.send(true);
    next();
  });

  app.get("/load/:key", async (req, res, next) => {
    await server.on_load(req, res, next);
  });

  // 错误处理函数
  app.use((error, req, res, next) => {
    //发送使用assert语句传入的状态码和错误提示信息
    console.log(error);
    res.status(error.statusCode).send({
      message: error.message,
    });
  });
};
