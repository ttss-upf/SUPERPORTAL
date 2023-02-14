var FACING_RIGHT = 0;
var FACING_FRONT = 1;
var FACING_LEFT = 2;
var FACING_BACK = 3;

var last = performance.now();
var keys = {};
var mouse_pos = [0, 0];
var mouse_buttons = 0;
var imgs = {};

var MYAPP = {
  current_room: null,
  clickableCanvas: null,
  url: "http://localhost:9022/",
  init: function () {
    var that = this;
    this.fetchData().then(() => {
      console.log(WORLD);
      that.current_room = WORLD.getRoom("Pirate");
      console.log(that.current_room);
      //that.my_user = new User();
      if (mychat.myspace.my_user)
      {
        that.my_user = mychat.myspace.my_user;
        that.current_room.addUser(that.my_user);
      }
    });
    this.clickableCanvas = document.querySelector("#Universe");
    this.clickableCanvas.addEventListener("mousedown", this.onMouse.bind(this));
    this.clickableCanvas.addEventListener("mousemove", this.onMouse.bind(this));
    this.clickableCanvas.addEventListener("mouseup", this.onMouse.bind(this));
    document.body.addEventListener("keydown", this.onKey.bind(this));
    document.body.addEventListener("keyup", this.onKey.bind(this));
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    View.init(this.canvas, this.ctx);
  },

  draw: function () {
    if (this.current_room)
      View.draw(this.current_room);
  },

  fetchData: async function () {
    await fetch(this.url + "load/room_list")
      .then((response) => response.json())
      .then((data) => {
        for (var ele in data) {
          WORLD.createRoom(data[ele].name, data[ele]);
        }
      });
    // await fetch(this.url + "load/user_list")
    //   .then((response) => response.json())
    //   .then((data) => {
    //     for (var ele in data) {
    //       WORLD.createUser(data[ele]);
    //     }
    //   });
  },

  //function that should be used to modify the state of my application
  update: function (dt) {
    if (this.my_user) {
      //var room = this.my_user.room;
      var room = this.current_room;
      this.my_user.target[0] = clamp( this.my_user.target[0], room.range[0], room.range[1] );
      var diff = this.my_user.target[0] - this.my_user.position;
      var delta = diff;
      if (delta > 0) delta = 30;
      else if (delta < 0) delta = -30;
      else delta = 0;
      if (Math.abs(diff) < 1) {
        delta = 0;
        this.my_user.position = this.my_user.target[0];
      } else this.my_user.position += delta * dt;

      if (delta == 0) this.my_user.gait = "idle";
      else {
        if (delta > 0) this.my_user.facing = FACING_RIGHT;
        else this.my_user.facing = FACING_LEFT;
        this.my_user.gait = "walking";
      }

      while (isIntersect(this.my_user.target, this.current_room.exits)) 
        {
          if (isClose(this.my_user.position, this.current_room.exits[0]))
          {
            this.current_room.removeUser(this.my_user);
            index = WORLD.rooms.findIndex(x => x.name === this.current_room.leadsTo);
            this.current_room = WORLD.rooms[index];
            this.my_user.room = this.current_room.name;
            this.current_room.addUser(this.my_user);
          }
          else
            break;
        }

      //this.cam_offset = -this.my_user.position;
      this.cam_offset = lerp(this.cam_offset, -this.my_user.position, 0.025);
    }
    if (keys["ArrowLeft"]) this.cam_offset += dt * 50;
    if (keys["ArrowRight"]) this.cam_offset -= dt * 50;
  },

  onMouse: function (e) {
    if (e.type == "mousedown") 
      {
        console.log(mouse_pos);
        var rect = this.canvas.getBoundingClientRect();
        mouse_pos[0] = e.clientX - rect.left;
        mouse_pos[1] = e.clientY - rect.top;
        var localmouse = View.canvasToWorld(mouse_pos);
        this.my_user.target[0] = localmouse[0];
        this.my_user.target[1] = localmouse[1];
      } 
    else if (e.type == "mousemove") 
      {
      } 
    else 
      {
      }
  },

  onKey: function (e) {
    if (e.key == "Control") {
      if (this.my_user.action == "crouchdown") 
        this.my_user.action = "none";
      else this.my_user.action = "crouchdown";
    }

    //if (e.key == "Escape")
    //this.current_room.removeUser (this.my_user);
    //this.current_room = Beach;
    //this.my_user.room = "Beach";
    //this.current_room.addUser(this.my_user);
  },
};

//MYAPP.init();

function loop() {
  var now = performance.now();
  var elapsed_time = (now - last) / 1000;
  last = now;
  MYAPP.update(elapsed_time);
  MYAPP.draw();
  requestAnimationFrame(loop);
}

loop();

if (typeof window === "undefined") {
  module.exports = { WORLD };
}
