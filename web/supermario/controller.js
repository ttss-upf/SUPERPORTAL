const MyApp = {
  // canvas: Object,
  // ctx: Object,
  my_user_name: "ttss",
  my_user_id: 0,
  current_room: undefined,
  url: "http://localhost:9022/",
  init: async function (name) {
    View.init();
    var that = this;
    this.fetchData().then(() => {
      console.log(World);
      that.current_room = World.getRoom(name);
      console.log(that.current_room);
      // console.log(this.current_room);
      // let user = User.createUser({
      //   name: "ttss",
      //   avatar: "./user.png",
      //   status: this.idle,
      // });
      that.canvas = document.querySelector("canvas");
      that.ctx = this.canvas.getContext("2d");
    });
  },
  draw: function () {
    // var canvas = document.querySelector("canvas");
    // var ctx = canvas.getContext("2d");
    View.draw(this.canvas, this.ctx, this.current_room);
  },
  fetchData: async function () {
    await fetch(this.url + "load/rooms")
      .then((response) => response.json())
      .then((data) => {
        for (var ele in data) {
          World.addRoom(ele, data[ele]);
        }
      });
  },

  start: async function (name) {
    await this.init(name);
    loop();
  },
  test: function(){
    console.log(123);
  },
};

function loop() {
  if (MyApp.current_room != undefined) {
    if (isJump < dur) {
      isJump++;
      console.log(Math.pow(isJump - 60, 2) / -300 + offset);
      let height = 239 - (Math.pow(isJump - 60, 2) / -40 + offset);
      console.log(height);
      MyApp.current_room.user_list[0].position._y = height;
    }
    MyApp.draw();
  }
  requestAnimationFrame(loop);
}

MyApp.start("test");

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

