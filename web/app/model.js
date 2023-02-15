function User(obj) {
  this.position = obj.position || 0;
  this.avatar = obj.avatar || "./images/character1.png";
  this.name = obj.username || "default_username";
  this.facing = obj.facing || FACING_FRONT;
  this.gait = "idle";
  this.action = "none";
  this.target = [0, 0];
  this.room = obj.room || "Pirate";
}

function Room(obj) {
  this.name = obj.name || 'default room name';
  this.url = obj.url || '';
  this.welcome_msg = obj.welcome_msg || "";
  this.id = -1;
  this.people = obj.people || [];
  this.range = obj.range || [-300, 300];
  this.exits = obj.exits || [];
  this.leadsTo = obj.leadsTo || "";
  this.online_num = obj.online_num || null;
  this.weather = obj.weather || null;
  this.default = obj.default || null;
  this.objects = obj.objects || null;
}

Room.prototype.addUser = function (user) {
  this.people.push(user);
  //user.room = this;
  user.room = this.name;
};

(Room.prototype.removeUser = function (user) {
  index = this.people.indexOf(user);
  this.people.splice(index, 1);
  //user.room = default_room;
}),
  (Room.prototype.addExit = function (pos) {
    if (Array.isArray(pos)) this.exits.push(pos[0], pos[1]);
  });

Room.prototype.addleadsTo = function (room) {
  this.leadsTo = room;
};

var WORLD = {
  rooms: [],
  users: [],
  rooms_by_id: {},
  last_room_id: 0,

  createRoom: function (name, obj) 
  {
    var room = new Room(obj);
    room.id = this.last_room_id++;
    this.rooms.push(room);
    this.rooms_by_id[name] = room;
    return room;
  },

  getRoom: function(name)
  {
    let room = this.rooms_by_id[name];
    return room;
  },

  createUser: function (obj) 
  {
    var user = new User(obj);
    //add user_id from server data;
    this.users.push(user);
    return user;
  },

  getUser: function (id)
  {
    index = this.users.findIndex(x => x.id === id);
    let user = this.users[index];
    return user;
  },
};

if (typeof window === "undefined") {
  module.exports = { WORLD };
}
