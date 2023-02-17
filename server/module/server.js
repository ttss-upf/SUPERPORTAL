module.exports = () => {
  var user_id = 0;
  const interval = 0.03;
  const redis = require("../plugins/redis");
  var cam_offset = 0;
  const { Model, World, User, Room } = require("../../web/app/model");
  const {
    lerp,
    clamp,
    isIntersect,
    isClose,
    isInteract,
  } = require("../plugins/util");

  const Server = {
    // contains all the connection {"username": {"connection": connection, "user": user}}
    connection_dict: Object,
    connection_id: 0,
    on_connect: function (connection, username) {
      console.log("on connect: ", username);
      if (!username || typeof username == "undefined") return;

      this.connection_dict[username].connection = connection;
      World.users[username] = this.connection_dict[username].user.room;
      let data = {
        type: "login",
        username: username,
        content: this.connection_dict[username].user,
      };
      // data used to update the userid of sender
      this.on_broadcast(data, connection, false, [username]);
      data.type = "joinedroom";
      // data used to informs other users
      this.on_broadcast(data, connection, true);
    },

    on_message: function (connection, msg) {
      if (msg.type != "utf8") return;

      data = JSON.parse(msg.utf8Data);
      if (data.type == "state") {
        World.updateRoom(data.content);
        // save {user:room_name} in the World, need this when log out.
        for (i = 0; i < data.content.people.length; i++) {
          World.users[data.content.people[i].username] = data.content.name;
        }
        // send the state to everyone who is online.
        this.on_broadcast(data, connection, false);
      } else {
        // it is only a text message or system message, so dont send it back to the sender.
        this.on_broadcast(data, connection, true);
      }
    },

    on_close: function (connection) {
      console.log("on close");
      for (val in this.connection_dict) {
        if (this.connection_dict[val].connection == connection) {
          // get the name of room where the user is currently
          let room_name = World.users[val];
          var data = {
            type: "leftroom",
            username: val,
          };
          // save the user's current state (redis.update_user) and also update the <World> on the server
          if (World.rooms_by_id[room_name] == "undefined") {
            break;
          }
          for (i = 0; i < World.rooms_by_id[room_name].people.length; i++) {
            if (World.rooms_by_id[room_name].people[i].username == val) {
              let user = World.rooms_by_id[room_name].people[i];
              redis.update_user(user.username, user);
              World.rooms_by_id[room_name].people.splice(i, 1);
            }
          }
          // delete the user's connection
          delete this.connection_dict[val];
          break;
        }
      }
      // boradcast the message to everyone in the world to inform the log out message.
      this.on_broadcast(data, null, false);
    },

    on_login: async function (req, res, next) {
      let isValid = false;
      if (!req.body || typeof req.body != "object") {
        throw new Error("Invalid information");
      }
      const user_info = req.body;
      if (this.connection_dict[user_info.username] != undefined) {
        res.send({
          status: 422,
          content: [],
          msg: "User aleady logged in",
        });
        return;
      }
      const user_list = (await redis.get("user_list")) || [];
      let user_num = 0;
      // for login
      user_list.forEach((user) => {
        if (user.username == user_info.username) {
          isValid = require("bcrypt").compareSync(
            user_info.password,
            user.password
          );
          if (isValid) {
            this.connection_dict[user.username] = { user: user };
            user = World.createUser(user);
            World.addUser(user);
            res.send({
              status: 200,
              content: user,
            });
          } else {
            res.send({
              status: 422,
              msg: "Invalid password",
            });
          }
        } else {
          user_num++;
        }
      });
      // for registeration
      if (user_num == user_list.length) {
        this.on_register(res, user_info);
      }
    },
    on_register: function (res, user_info) {
      user_info.id = user_id++;
      let user = World.createUser(user_info);
      World.addUser(user);

      this.connection_dict[user.username] = { user: user };
      res.send({
        status: 200,
        content: user_info,
        msg: "Register successfully",
      });
      user_info.password = require("bcrypt").hashSync(user_info.password, 10);
      redis.set("user_list", user_info, true);
    },

    // get data from database
    on_load: async function (key) {
      const value = await redis.get(key);
      if (!key) return;
      return value;
    },

    on_broadcast: function (
      data,
      connection,
      exclude_sender,
      receiver_list = []
    ) {
      if (data == undefined) {
        return;
      }
      if (exclude_sender) {
        // send data to everyone except the sender
        for (let val in this.connection_dict) {
          if (this.connection_dict[val].connection != connection) {
            this.connection_dict[val].connection.send(JSON.stringify(data));
          }
        }
      } else if (!exclude_sender && receiver_list.length != 0) {
        // send data to everyone in the receiver_list
        receiver_list.forEach((ele) => {
          if (this.connection_dict[ele].connection != undefined) {
            this.connection_dict[ele].connection.send(JSON.stringify(data));
          }
        });
      } else {
        // send data to everybody
        for (let val in this.connection_dict) {
          if (this.connection_dict[val].connection != undefined) {
            this.connection_dict[val].connection.send(JSON.stringify(data));
          }
        }
      }
    },

    on_left_room: function (user, room) {
      while (isIntersect(user.target, room.exits)) {
        if (isClose(user.position, room.exits[0])) {
          room.people.splice(room.people.indexOf(user), 1);
          user.room = room.leadsTo;
          room = World.rooms_by_id[room.leadsTo];
          room.people.push(user);
          World.users[user.username] = room.name;
        } else break;
      }
    },

    on_update: function () {
      var dt = 0.03;
      for (var i in World.rooms_by_id) {
        var room = World.rooms_by_id[i];

        let receiver_list = [];
        for (let i = 0; i < room.people.length; i++) {
          let user = room.people[i];
          receiver_list.push(user.username);
          Server.on_userinteract(room, user);

          user.target[0] = clamp(user.target[0], room.range[0], room.range[1]);
          var diff = user.target[0] - user.position;
          var delta = diff;
          if (delta > 0) delta = 30;
          else if (delta < 0) delta = -30;
          else delta = 0;
          if (Math.abs(diff) < 2) {
            delta = 0;
            user.position = user.target[0];
          } else user.position += delta * dt;

          //updating gait and action
          if (delta == 0) {
            // interaction
            // if (!interaction) user.gait = "idle";
            user.gait = "idle";
          } else {
            if (delta > 0) user.facing = Model.FACING_RIGHT;
            else user.facing = Model.FACING_LEFT;
            user.gait = "walking";
          }

          //update current_room when leaving
          Server.on_left_room(user, room);

          cam_offset = lerp(cam_offset, -user.position, 0.025);
        }
        let data = {
          content: room,
          type: "state",
        };
        if (receiver_list.length != 0) {
          Server.on_broadcast(data, null, false, receiver_list);
        }
      }
    },
    on_userinteract: function (room, user) {
      if (room.objects) {
        Object.values(room.objects).forEach((val) => {
          while (isInteract(user.target, val)) {
            if (user.position == user.target[0]) {
              console.log("you just interacted!");
              user.target = [];
              user.gait = val.reactionGait;
              user.facing = val.reactionFacing;
              user.action = val.reactionAction;
              // INTERACTION = true;
              //RENDERMSG = {content: "ineraction successful!"};
              break;
            } else break;
          }
        });
      }
    },
    // on_userinteract: function (room, user) {
    //   if (room.objects) {
    //     Object.values(room.objects).forEach((val) => {
    //       if(isInteract(user.target, val) && user.gait == "idle" && isInteract([user.position, 15], val)){
    //         console.log("you just interacted!");

    //       }
    //       // while (isInteract(user.target, val)) {
    //       //   if (user.position == user.target[0]) {
    //       //     user.target = [];
    //       //     user.gait = val.reactionGait;
    //       //     user.facing = val.reactionFacing;
    //       //     user.action = val.reactionAction;
    //       //     INTERACTION = true;
    //       //     //RENDERMSG = {content: "ineraction successful!"};
    //       //     break;
    //       //   } else break;
    //       // }
    //     });
    //   }
    // },
    start: async function () {
      let room_res = await Server.on_load("room_list");
      for (val in room_res) {
        World.updateRoom(room_res[val]);
      }
      setInterval(Server.on_update, interval * 1000);
    },
  };

  return Server;
};
