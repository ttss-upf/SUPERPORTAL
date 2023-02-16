var INTERACTION = false;

var mouse_pos = [0, 0];

var MYAPP = {
  current_room: null,
  clickableCanvas: null,
  url: "http://localhost:9022/",
  init: async function () {
    var that = this;
    this.my_user = mychat.myspace.my_user;
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
    if (this.current_room) View.draw(this.current_room);
  },


  // onUserInteract: function () {
  //   if (this.current_room.objects) {
  //     Object.values(this.current_room.objects).forEach((val) => {
  //       while (isInteract(this.my_user.target, val)) {
  //         if (this.my_user.position == this.my_user.target[0]) {
  //           console.log("you just interacted!");
  //           this.my_user.target = [];
  //           this.my_user.gait = val.reactionGait;
  //           this.my_user.facing = val.reactionFacing;
  //           this.my_user.action = val.reactionAction;
  //           return this.my_user.gait;
  //           break;
  //         } else break;
  //       }
  //     });
  //   }
  // },

  OnUserSpeak: function (msg) {
    this.my_user.action = "talking";
    //return msg; // we just testing, but we should receive msgs differently.
  },

  onMouse: function (e) {
    if (e.type == "mousedown") {
      console.log(this.my_user);
      console.log("mouse position", mouse_pos);
      var rect = this.canvas.getBoundingClientRect();
      mouse_pos[0] = e.clientX - rect.left;
      mouse_pos[1] = e.clientY - rect.top;
      var localmouse = View.canvasToWorld(mouse_pos);
      this.my_user.target[0] = localmouse[0];
      this.my_user.target[1] = localmouse[1];
      console.log("my target", this.my_user.target);
      this.current_room.people.forEach((user) => {
        if (user.username == this.my_user.username) {
          user.target = this.my_user.target
        }
      });
      data = {
        type: "state",
        content: this.current_room,
      };
      console.log("data", data);
      mychat.server.send(JSON.stringify(data));
    }
  },

  onKey: function (e) {
    if (e.key == "Control") {
      if (this.my_user.action == "crouchdown") this.my_user.action = "none";
      else this.my_user.action = "crouchdown";
    }
  },
};

function loop() {

  MYAPP.draw();
  requestAnimationFrame(loop);
}

loop();

if (typeof window === "undefined") {
  module.exports = { WORLD };
}
