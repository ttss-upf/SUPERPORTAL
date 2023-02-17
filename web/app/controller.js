var MYAPP = {
  mouse_pos: [0, 0],
  current_room: null,
  clickableCanvas: null,
  url: "http://localhost:9022/",
  init: async function () {
    this.my_user = MYCHAT.myspace.my_user;
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

  OnUserSpeak: function (msg) {
    this.my_user.action = "talking";
  },

  onMouse: function (e) {
    if (e.type == "mousedown") {
      var rect = this.canvas.getBoundingClientRect();
      this.mouse_pos[0] = e.clientX - rect.left;
      this.mouse_pos[1] = e.clientY - rect.top;
      var localmouse = View.canvasToWorld(this.mouse_pos);
      this.my_user.target[0] = localmouse[0];
      this.my_user.target[1] = localmouse[1];
      this.current_room.people.forEach((user) => {
        if (user.username == this.my_user.username) {
          user.target = this.my_user.target;
        }
      });
      data = {
        type: "state",
        content: this.current_room,
      };
      MYCHAT.server.send(JSON.stringify(data));
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