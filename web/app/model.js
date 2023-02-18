var STATIC_RESOURCE_ROOT = "../images/";
// var STATIC_RESOURCE_ROOT =  "./p2/images/"
var Model = {
  ROOM_DEFAULT_BACKGROUND: STATIC_RESOURCE_ROOT + "pirate_island.png",
  CHARACTER_DEFAULT_AVATAR: STATIC_RESOURCE_ROOT + "character1.png",

  // user info
  CHARACTER_DEFAULT_NAME: "DEFAULT USERNAME",
  CHARACTER_DEFAULT_ROOM: "Pirate",
  CHARACTER_DEFAULT_POSITION: 0,
  // room info
  ROOM_DEFAULT_NAME: "DEFAULT ROOMRNAME",
  ROOM_DEFAULT_RANGE: [-300, 300],
  ROOM_DEFAULT_LEADSTO: [],
  ROOM_DEFAULT_OBJECT: {},
  ROOM_DEFAULT_WEATHER: "snow",
  ROOM_DEFAULT_WELCOME_MSG: "welcome",
  ROOM_ISDEFAULT: "false",
  FACING_RIGHT: 0,
  FACING_FRONT: 1,
  FACING_LEFT: 2,
  FACING_BACK: 3,
};

function User(obj) {
  this.id = obj.id;
  this.position = obj.position || Model.CHARACTER_DEFAULT_POSITION;
  this.avatar = obj.avatar || Model.CHARACTER_DEFAULT_AVATAR;
  this.username = obj.username || Model.CHARACTER_DEFAULT_NAME;
  this.facing = obj.facing || Model.FACING_FRONT;
  this.gait = obj.gait || "idle";
  this.action = obj.action || "none";
  this.target = obj.target || [0, 0];
  this.room = obj.room || Model.CHARACTER_DEFAULT_ROOM;
}

function Room(obj) {
  this.name = obj.name || Model.ROOM_DEFAULT_NAME;
  this.url = obj.url || Model.ROOM_DEFAULT_BACKGModel.ROUND;
  this.welcome_msg = obj.welcome_msg || Model.ROOM_DEFAULT_WELCOME_MSG;
  this.id = -1;
  this.people = obj.people || [];
  this.range = obj.range || Model.ROOM_DEFAULT_RANGE;
  this.exits = obj.exits || Model.ROOM_DEFAULT_EXITS;
  this.leadsTo = obj.leadsTo || Model.ROOM_DEFAULT_LEADSTO;
  this.online_num = obj.online_num || 0;
  this.weather = obj.weather || Model.ROOM_DEFAULT_WEATHER;
  this.default = obj.default || Model.ROOM_ISDEFAULT;
  this.objects = obj.objects || Model.ROOM_DEFAULT_OBJECT;
}

var World = {
  users: {},
  rooms_by_id: {},
  last_room_id: 0,
  createRoom: function (obj) {
    var room = new Room(obj);
    return room;
  },

  addRoom: function (obj) {
    obj.id = this.last_room_id++;
    this.rooms_by_id[obj.name] = obj;
    return this.rooms_by_id[obj.name];
  },

  getRoom: function (name) {
    let room = this.rooms_by_id[name];
    return room;
  },

  updateRoom: function (obj) {
    if (typeof obj != "object") return;
    this.rooms_by_id[obj.name] = obj;
    return this.rooms_by_id;
  },
  createUser: function (obj) {
    var user = new User(obj);
    return user;
  },
  addUser: function (user) {
    if (this.rooms_by_id[user.room] != undefined)
      this.rooms_by_id[user.room].people.push(user);
    return user;
  },

  getUser: function (id) {
    index = this.users.findIndex((x) => x.id === id);
    let user = this.users[index];
    return user;
  },
};

if (typeof window === "undefined") {
  module.exports = {
    Model,
    World,
    User,
    Room,
  };
}
