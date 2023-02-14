module.exports = (app) => {
  var user_id = 0;
  const assert = require("http-assert");
  const redis = require("../plugins/redis");
  const { WORLD } = require("../../web/app/model");
  console.log("world", WORLD);
  const Server = {
    on_message: null,
    on_close: null,
    on_error: null,
    on_connect: null,
    on_login: null,
    user_list: [],
    connection_list: [],
    user_id: 0,
    init: function () {},

    on_connect: function (connection) {
      console.log("on connect");
      this.user_list.push(this.user_id++);
      console.log("news", WORLD);
      let data = {
        type: "login",
        user_id: this.user_id,
      };
      this.connection_list.push({
        connection: connection,
        user_id: this.user_id,
      });
      console.log("currently login user", this.user_id);
      // console.log();
      this.broadCast(data, connection, false, [this.user_id]);
      data.type = "joinedroom";
      this.broadCast(data, connection, true);
    },

    on_message: function (connection, msg) {
      console.log("receive message");
      if (msg.type != "utf8") return;
      data = JSON.parse(msg.utf8Data);
      // this.broadCast(data, connection, false, data.receiver_list);
      this.broadCast(data, connection, true);
      if (data.type == "state") {
        // console.log(data);
        redis.set("room_list", data.content, true);
      }
    },

    on_close: function (connection) {
      console.log("on close");
      this.connection_list.forEach((ele) => {
        if (ele.connection == connection) {
          this.user_list.splice(this.user_list.indexOf(ele.user_id), 1);
          let data = {
            type: "leftroom",
            user_id: ele.user_id,
            user_list: this.user_list,
          };
          this.broadCast(data, connection, true);
        }
      });
    },

    on_login: async function (req, res, next) {
      let isValid = false;
      const user_info = req.body;
      const user_list = (await redis.get("user_list")) || [];
      let user_num = 0;
      user_list.forEach((user) => {
        if (user.username == user_info.username) {
          isValid = require("bcrypt").compareSync(
            user_info.password,
            user.password
          );
        } else {
          user_num++;
        }
      });
      if (user_num == user_list.length) {
        user_info.uid = user_id++;
        user_info.password = require("bcrypt").hashSync(user_info.password, 10);
        redis.set("user_list", user_info, true); // pass object
        res.send({
          status: 200,
          content: user_info.uid,
          msg: "Register successfully",
        });
        return;
      }
      if (isValid) {
        res.send({
          status: 200,
          content: user_id++,
        });
      } else {
        res.send({
          status: 422,
          content: [],
          msg: "Invalid password",
        });
      }
      next();
    },

    on_load: async function (req, res, next) {
      const key = req.params.key;
      const value = await redis.get(key);
      res.send(value);
      next();
    },
    broadCast: function (data, connection, isAll, receiver_list) {
      if (isAll) {
        this.connection_list.forEach((ele) => {
          if (ele.connection != connection)
            ele.connection.sendUTF(JSON.stringify(data));
        });
      } else {
        this.connection_list.forEach((ele) => {
          if (receiver_list.includes(ele.user_id)) {
            ele.connection.sendUTF(JSON.stringify(data));
          }
        });
      }
    },
  };
  return Server;
};
