var uid = 0; // userid
var rid = 0; // roomid
var walk = [6, 7, 8]
var idle = [0]
const User = {
  id: uid++,
  name: "",
  avatar: "",
  position: {},
  facing: "",
  status: [],

  createUser: function (object) {
    let res = {
      id: this.userid,
      status: object.status ? object.status : idle,
      name: object.name ? object.name : "default user name",
      facing: object.facing ? object.facing : "FACE_TO_RIGHT",
      avatar: object.avatar ? object.avatar : "default avatar",
      position: object.position ? object.position : { _x: -300, _y: 239 },
    };
    return res;
  },
};

const Room = {
  id: rid++,
  name: "default name",
  user_list: [],
  url: "",
  online_num: 0,

  createRoom: function (object) {
    let res = {
      id: this.id,
      user_list: [],
      online_num: this.online_num,
      url: object.url ? object.url : "./user.png",
    //   name: object.name ? object.name : "default room name",
    };
    return res;
  },
};
const World = {
  rooms: {},
  addRoom: function (name, object) {
    let room = Room.createRoom(object);
    this.rooms[name] = room;
    return room;
  },
  getRoom: function(name){
    let room = this.rooms[name];
    return room;
  }
};
if (typeof window === 'undefined') {
  module.exports = { World, User, Room };
}
