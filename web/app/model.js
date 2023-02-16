var FACING_RIGHT = 0;
var FACING_FRONT = 1;
var FACING_LEFT = 2;
var FACING_BACK = 3;
function User(obj) {
  this.id = obj.id;
  this.position = obj.position;
  this.avatar = obj.avatar || "./images/character1.png";
  this.username = obj.username || "default_username";
  this.facing = obj.facing || FACING_FRONT;
  this.gait = obj.gait || "idle";
  this.action = obj.action || "none";
  this.target = obj.target || [0, 0];
  this.room = obj.room || "Pirate";
}
User.prototype.toJson = function (obj) {
  let data = {
    id: obj.id,
    position: obj.position,
    avatar: obj.avatar,
    username: obj.username,
    facing: obj.facing,
    gait: obj.gait,
    action: obj.action,
    target: [0, 0],
    room: obj.room,
  };
  return data;
};
function Room(obj) {
  this.name = obj.name || "default room name";
  this.url = obj.url || "";
  this.id = -1;
  this.people = obj.people || [];
  this.range = obj.range || [-300, 300];
  this.exits = obj.exits || [];
  this.leadsTo = obj.leadsTo || "";
  this.online_num = obj.online_num || null;
  this.weather = obj.weather || null;
  this.default = obj.default || null;
  this.objects = obj.objects || {};
}

Room.prototype.addUser = function (user) {
  this.people.push(user);
  user.room = this.name;
};

Room.prototype.removeUser = function (user) {
  index = this.people.indexOf(user);
  this.people.splice(index, 1);
  //user.room = default_room;
};
Room.prototype.addExit = function (pos) {
  if (Array.isArray(pos)) this.exits.push(pos[0], pos[1]);
};

Room.prototype.addleadsTo = function (room) {
  this.leadsTo = room;
};

var WORLD = {
  rooms: [],
  users: {},
  rooms_by_id: {},
  last_room_id: 0,

  createRoom: function (name, obj) {
    var room = new Room(obj);
    room.id = this.last_room_id++;
    this.rooms.push(room);
    this.rooms_by_id[name] = room;
    return room;
  },

  getRoom: function (name) {
    let room = this.rooms_by_id[name];
    return room;
  },

  createUser: function (obj) {
    var user = new User(obj);
    // this.users.push(user);
    if (this.rooms_by_id[user.room] != undefined)
      this.rooms_by_id[user.room].people.push(user);
    return user;
  },
  updateRoom: function (obj) {
    // for(val in obj ){
    this.rooms_by_id[obj.name] = obj;
    let users = [];
    obj.people.forEach((ele) => {
      // users.push(this.createUser(ele));
      users.push(ele);
    });
    this.rooms_by_id[obj.name].people = users;
    // }
    // obj.forEach(ele => {
    //   this.rooms_by_id[ele.name] = ele
    // });
  },
  getUser: function (id) {
    index = this.users.findIndex((x) => x.id === id);
    let user = this.users[index];
    return user;
  },
};

if (typeof window === "undefined") {
  module.exports = {
    WORLD,
    User,
    Room,
    FACING_BACK,
    FACING_FRONT,
    FACING_LEFT,
    FACING_RIGHT,
  };
}
