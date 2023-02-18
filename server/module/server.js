module.exports = () => {
  var user_id = 0;
  const interval = 0.03;
  const redis = require("../plugins/redis");
  var cam_offset = 0;
  // const { Model, World, User, Room } = require("../../www/p2/app/model");
  const { Model, World, User, Room } = require("../../web/app/model");
  const {
    lerp,
    clamp,
    isIntersect,
    isClose,
    isInteract,
    findKey,
  } = require("../plugins/util");

  const Server = {
    // contains all the connection {"username": {"connection": connection, "user": user}}
    connection_dict: Object,
    connection_id: 0,

    on_login: async function (req, res, next) {
      let isValid = false;
      if (!req.body || typeof req.body != "object") {
        throw new Error("Invalid information");
      }
      const user_info = req.body;
      // too check if user already logged in the world.
      if (this.connection_dict[user_info.username] != undefined) {
        res.send({
          status: 422,
          content: [],
          msg: "User aleady logged in",
        });
        return;
      }
      // get data from database
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
      // for sign in
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

    on_connect: function (connection, username) {
      console.log("on connect: ", username);
      if (!username || typeof username == "undefined") return;
      if (typeof this.connection_dict[username] == "undefined") return;

      // update connection_dict and World.users by username
      this.connection_dict[username].connection = connection;
      World.users[username] = this.connection_dict[username].user.room;

      // data used to update the userid of sender
      let data = {
        type: "login",
        username: username,
        content: this.connection_dict[username].user,
      };
      this.on_broadcast(data, connection, false, [username]);
      data.type = "joinedroom";

      console.log("World.users", World.users);

      // send notification to everyone in the target room
      receiver_list = findKey(
        World.users,
        this.connection_dict[username].user.room
      );
      this.on_broadcast(data, connection, false, receiver_list);
    },

    on_message: function (connection, msg) {
      if (msg.type != "utf8") return;
      data = JSON.parse(msg.utf8Data);
      this.on_handle_message(connection, data);
    },

    on_close: function (connection) {
      console.log("on close");
      for (user_name in this.connection_dict) {
        if (this.connection_dict[user_name].connection == connection) {
          // get the name of room which the user is in.
          var logout_from_room = World.users[user_name];
          if (typeof World.rooms_by_id[logout_from_room] == "undefined") {
            return;
          }
          var data = {
            type: "leftroom",
            content: this.connection_dict[user_name].user,
          };

          this.on_remove_user_from_world(logout_from_room, user_name);
          break;
        }
      }

      // boradcast the message to everyone in the world to inform the log out message.
      console.log("World.users", World.users);
      receiver_list = findKey(World.users, logout_from_room);
      this.on_broadcast(data, connection, false, receiver_list);
    },

    on_handle_message: function (connection, data) {
      switch (data.type) {
        case "state":
          World.updateRoom(data.content);
          // save {user:room_name} in the World.users, need this when log out.
          for (i = 0; i < data.content.people.length; i++) {
            World.users[data.content.people[i].username] = data.content.name;
          }
          // send the state to everyone who is online.
          this.on_broadcast(data, connection, false);
          break;

        case "text":
          // it is only a text message or system message, so dont send it back to the sender.
          var sender = data.username;
          var room_name = World.users[sender];
          receiver_list = findKey(World.users, room_name);
          receiver_list.splice(receiver_list.indexOf(sender), 1);
          this.on_delete_far_receiver(receiver_list, room_name, sender);
          break;

        case "newroom":
          // set path from old room to new room
          new_room = data.content;
          linked_room_name = Object.keys(new_room.exits)[0];
          linked_room = World.rooms_by_id[linked_room_name];
          if(linked_room.leadsTo.length >= 2){
            return;
          }
          linked_room.leadsTo[1] = new_room.name;
          exits_coordinate = Model.ROOMS[linked_room_name].exits_coordinate[1];
          linked_room.exits[new_room.name] = exits_coordinate;
          // set path from new room to old room
          World.updateRoom(new_room);
          console.log("current World", World.rooms_by_id);
          break;

        default:
          // system message, do nothing
          break;
      }

      if (receiver_list.length != 0) {
        this.on_broadcast(data, connection, false, receiver_list);
      }
    },

    on_delete_far_receiver: function (receiver_list, room_name, sender) {
      for (i = 0; i < receiver_list.length; i++) {
        var receiver = receiver_list[i];
        if (
          Math.abs(
            World.rooms_by_id[room_name].people.find(
              (ele) => ele.username == receiver
            ).position -
              World.rooms_by_id[room_name].people.find(
                (ele) => ele.username == sender
              ).position
          ) > 300
        ) {
          receiver_list.splice(i, 1);
        }
      }
    },

    on_remove_user_from_world: function (logout_from_room, user_name) {
      for (i = 0; i < World.rooms_by_id[logout_from_room].people.length; i++) {
        if (
          World.rooms_by_id[logout_from_room].people[i].username == user_name
        ) {
          let user = World.rooms_by_id[logout_from_room].people[i];
          redis.update_user(user.username, user);
          World.rooms_by_id[user.room].people.splice(i, 1);
          delete this.connection_dict[user.username];
          delete World.users[user.username];
          break;
        }
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
          Server.on_calculate_action(room, user, dt);
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

    on_left_room: function (user, old_room) {
      for (destination_name in old_room.exits) {
        if (
          isIntersect(user.target, old_room.exits[destination_name]) &&
          isClose(user.position, old_room.exits[destination_name][0])
        ) {
          var data = {
            type: "leftroom",
            content: user,
          };
          receiver_list = findKey(World.users, user.room);
          old_room.people.splice(old_room.people.indexOf(user), 1);
          this.on_broadcast(data, null, false, receiver_list);
          user.room = destination_name;
          destination_room = World.rooms_by_id[destination_name];
          destination_room.people.push(user);
          data = {
            type: "joinedroom",
            content: user,
          };
          World.users[user.username] = destination_room.name;
          receiver_list = findKey(World.users, destination_room.name);
          this.on_broadcast(data, null, false, receiver_list);
        }
      }
    },

    on_calculate_action: function (room, user, dt) {
      user.target[0] = clamp(user.target[0], room.range[0], room.range[1]);
      var diff = user.target[0] - user.position;
      var delta = diff;
      if (delta > 0) delta = 30;
      else if (delta < 0) delta = -30;
      else delta = 0;
      if (Math.abs(diff) < 2) {
        delta = 0;
        user.position = user.target[0];
      } else {
        user.position += delta * dt;
      }

      //updating gait and action
      if (delta == 0) {
        // interaction
        // if (!interaction) user.gait = "idle";
        user.gait = "idle";
      } else {
        if (delta > 0) user.facing = Model.FACING_RIGHT;
        else user.facing = Model.FACING_LEFT;
        user.gait = "walking";
        user.action = "none";
      }
    },

    on_userinteract: function (room, user) {
      if (room.objects) {
        Object.values(room.objects).forEach((val) => {
          while (isInteract(user.target, val)) {
            if (user.position == user.target[0]) {
              user.target = [user.position, 0];
              user.gait = val.reactionGait;
              user.facing = val.reactionFacing;
              user.action = val.reactionAction;
              break;
            } else {
              break;
            }
          }
        });
      }
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
          if (typeof this.connection_dict[ele].connection != "undefined") {
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

    start: async function () {
      let room_res = await Server.on_load("room_list");
      for (val in room_res) {
        World.updateRoom(room_res[val]);
      }
      setInterval(Server.on_update, interval * 1000);
    },

    on_test: function () {},
  };

  return Server;
};
