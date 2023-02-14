var uid = 0; // userid
var rid = 0; // roomid
var isJump = 120;
var dur = 120;
var offset = (60 * 60) / 40

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
      name: object.name ? object.name : "default room name",
    };
    return res;
  },
};

const World = {
  rooms: {},
  addRoom: function (name, url) {
    var room = Room.createRoom({
      name: "test room name",
      url: url,
    });
    this.rooms[name] = room;
    return room;
  },
};

const MyApp = {
  scale: 0.48,
  current_room: {},
  images: {},
  walk: [6, 7, 8],
  idle: [0],
  w: 60,
  h: 98,
  s: 3,
  canvas: Object,
  ctx: Object,
  my_user_name: "ttss",
  my_user_id: 0,
  init: function () {
    let user = User.createUser({
      name: "ttss",
      avatar: "./user.png",
      status: this.idle,
    });
    // let user2 = User.createUser({
    //   name: "ttss",
    //   avatar: "./user.png",
    //   status: this.idle,
    //   position: {
    //     _x: -900,
    //     _y: 236,
    //   },
    // });
    this.current_room = World.addRoom("test", "./background.jpg");
    this.current_room = World.addRoom("test1", "./background1.jpg");
    this.current_room.user_list.push(user);
    // this.current_room.user_list.push(user2);
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
  },
  // render: function(){
  //   this.basicRender()
  // },
  getImg: function (url) {
    if (this.images[url]) {
      return this.images[url];
    }
    var img = (this.images[url] = new Image());
    img.src = url;
    return img;
  },
  draw: function () {
    var container = this.canvas.parentNode;
    var rect = container.getBoundingClientRect();
    let image = this.getImg(this.current_room.url);
    this.canvas.height = rect.height;
    this.canvas.width = rect.width;
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.scale(this.scale, this.scale);
    this.ctx.drawImage(image, image.width / -2, image.height / -2);
    this.current_room.user_list.forEach((user) => {
      this.drawUser(user);
    });
  },
  drawUser: function (user) {
    let t = Math.floor(performance.now() * 0.001 * 8);
    let frame = user.status[t % user.status.length];
    let row = Math.floor(frame / 12);
    frame = frame % 12;
    let image = this.getImg(user.avatar);
    this.ctx.save();
    this.ctx.drawImage(
      image,
      0 + frame * this.w,
      2 + row * this.h,
      this.w,
      this.h,
      user.position._x,
      user.position._y,
      this.w * this.s,
      this.h * this.s
    );
    this.ctx.restore();
  },
};
MyApp.init();

function loop() {
  if (isJump < dur) {
    isJump++;
    console.log(Math.pow(isJump - 60, 2) / -300 + offset);
    let height = 239 - (Math.pow(isJump - 60, 2) / -40 + offset);
    console.log(height);
    MyApp.current_room.user_list[0].position._y = height;
  }
  MyApp.draw();
  requestAnimationFrame(loop);
}
loop();

document.onkeydown = function (e) {
  var keyNum = window.event ? e.keyCode : e.which;
  // if (isJump) return;
  if (isJump != dur) return;

  switch (keyNum) {
    case 13:
      alert("pause(enter)");
      break;
    case 37:
      console.log("left down");
      console.log(MyApp.current_room.user_list[0].position._x);
      MyApp.current_room.user_list[0].position._x -= 18;
      MyApp.current_room.user_list[0].facing = "FACE_TO_LEFT";
      MyApp.current_room.user_list[0].status = [5, 4, 3];
      break;
    case 38:
      console.log("up down");
      // isJump = true;
      isJump = 0;
      break;
    case 39:
      console.log("right down");
      MyApp.current_room.user_list[0].position._x += 18;
      MyApp.current_room.user_list[0].facing = "FACE_TO_right";
      MyApp.current_room.user_list[0].status = [6, 7, 8];
      break;
    case 40:
      console.log("down down");
      MyApp.current_room.user_list[0].position._y = 309;
      MyApp.current_room.user_list[0].facing = "FACE_TO_DOWN";
      MyApp.current_room.user_list[0].status = [25];
      MyApp.h = 89;
      break;
    case 32:
      console.log("space down");
      break;
  }
};

document.onkeyup = function (e) {
  var keyNum = window.event ? e.keyCode : e.which;
  // if (isJump) return;
  if (isJump != dur) {
    MyApp.current_room.user_list[0].position._y += isJump;
    return;
  }
  switch (keyNum) {
    case 37:
      console.log("left up");
      MyApp.current_room.user_list[0].status = [0];
      break;
    case 38:
      console.log("up up");
      break;
    case 39:
      console.log("right up");
      MyApp.current_room.user_list[0].status = [11];
      break;
    case 40:
      console.log("down up");
      MyApp.current_room.user_list[0].position._y = 239;
      MyApp.current_room.user_list[0].facing = "FACE_TO_LEFT";
      MyApp.current_room.user_list[0].status = [0];
      MyApp.h = 98;
      break;
    case 32:
      console.log("space down");
      break;
  }
};
