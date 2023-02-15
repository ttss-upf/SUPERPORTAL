var View = {
  canvas: null,
  ctx: null,
  cam_offset: 0,
  scale: 2,
  particles: [],
  angle: 0,
  init: function (canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    if (this.canvas.getContext) {
      this.canvas_w = this.canvas.parentNode.getBoundingClientRect().width;
      this.canvas_h = this.canvas.parentNode.getBoundingClientRect().height;

      // 產生雨滴
      var maxParts = 50;
      for (var a = 0; a < maxParts; a++) {
        this.particles.push({
          x: Math.random() * this.canvas_w,
          y: Math.random() * this.canvas_h,
          l: Math.random() * 1,
          xs: -4 + Math.random() * 4 + 2,
          ys: Math.random() * 10 + 10,
          r: Math.random() * 4 + 1, //radius
          d: Math.random() * maxParts, //density
        });
      }
    }
  },

  draw: function (current_room) {
    var parent = this.canvas.parentNode;
    var rect = parent.getBoundingClientRect();
    this.canvas.width = rect.width-400;
    this.canvas.height = 0.97*rect.height;
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2); // now the (0,0) is in the center of the canvas
    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(this.cam_offset, 0);

    if (current_room) this.drawRoom(current_room);

    //center point
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(-1, -1, 2, 2);
    this.ctx.restore();
    // 繪出maxParts個雨滴
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    // for (var c = 0; c < this.particles.length; c++) {
    //   var p = this.particles[c];
    //   this.ctx.beginPath();

    //   // 初始位置
    //   this.ctx.moveTo(p.x, p.y);

    //   // 畫線
    //   this.ctx.lineTo(p.x + p.l * p.xs, p.y + p.l * p.ys);
    //   this.ctx.stroke();
    // }

    // // 移動線(雨滴)func
    // this.move();
    this.ctx.beginPath();
		for(var i = 0; i < this.particles.length; i++)
		{
			var p = this.particles[i];
			this.ctx.moveTo(p.x, p.y);
			this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
		}
		this.ctx.fill();
		this.update();
  },

  move: function () {
    for (var b = 0; b < this.particles.length; b++) {
      var p = this.particles[b];
      p.x += p.xs;
      p.y += p.ys;

      // if 雨滴超出螢幕
      if (p.x > this.canvas_w || p.y > this.canvas_h) {
        // 重新設定x位置
        p.x = Math.random() * this.canvas_w;
        // 移到螢幕之上
        p.y = -20;
      }
    }
  },

  update: function () {
    this.angle += 0.01;
    for (var i = 0; i < this.particles.length; i++) {
      var p = this.particles[i];
      //Updating X and Y coordinates
      //We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
      //Every particle has its own density which can be used to make the downward movement different for each flake
      //Lets make it more random by adding in the radius
      p.y += Math.cos(this.angle + p.d) + 1 + p.r / 2;
      p.x += Math.sin(this.angle) * 2;

      //Sending flakes back from the top when it exits
      //Lets make it a bit more organic and let flakes enter from the left and right also.
      if (p.x > this.canvas_w + 5 || p.x < -5 || p.y > this.canvas_h) {
        if (i % 3 > 0) {
          //66.67% of the flakes
          this.particles[i] = {
            x: Math.random() * this.canvas_w,
            y: -10,
            r: p.r,
            d: p.d,
          };
        } else {
          //If the flake is exitting from the right
          if (Math.sin(this.angle) > 0) {
            //Enter from the left
            this.particles[i] = {
              x: -5,
              y: Math.random() * this.canvas_h,
              r: p.r,
              d: p.d,
            };
          } else {
            //Enter from the right
            this.particles[i] = {
              x: this.canvas_w + 5,
              y: Math.random() * this.canvas_h,
              r: p.r,
              d: p.d,
            };
          }
        }
      }
    }
  },
  canvasToWorld: function (pos) {
    return [
      (pos[0] - this.canvas.width / 2) / this.scale - this.cam_offset,
      (pos[1] - this.canvas.height / 2) / this.scale,
    ];
  },

  worldToCanvas: function (pos) {
    return [
      (pos[0] + this.canva.width / 2) * this.scale + this.cam_offset,
      (pos[1] + this.canva.height / 2) * this.scale,
    ];
  },

  drawRoom: function (current_room) {
    //draw background
    img = this.getImage(current_room.url);
    this.ctx.drawImage(img, -img.width / 2, -img.height / 2);

    //draw users
    for (var i = 0; i < current_room.people.length; ++i) {
      var user = current_room.people[i];
      this.drawUser(user);
    }
    //draw target
    radius = 2;
    this.ctx.beginPath();
    if (!user) {
      user = {};
      user.target = [0, 0];
    }
    this.ctx.arc(user.target[0], user.target[1], radius, 2 * Math.PI, false);
    //console.log("target coordinates" + user.target);
    this.ctx.fillStyle = "yellow";
    this.ctx.fill();

    //draw exits
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(current_room.exits[0], current_room.exits[1], 5, 5);

    //draw interactive objects
    if (current_room.objects){
      Object.values(current_room.objects).forEach(val => {
        centroid = val.centroid;
        size = val.size;
        switch (size) {
          case "small":
            size = 10;
            break;
          case "medium":
            size = 25;
            break;
          case "big":
            size = 50;
            break;
        }
        this.ctx.beginPath();
        this.ctx.arc(centroid[0], centroid[1], size, 0, 2 * Math.PI);
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = 'pink';
        this.ctx.stroke();
        this.ctx.closePath();
      });
    }
  },

  gait_animations: {
    idle: [0],
    walking: [2, 3, 4, 5, 6, 7, 8, 9],
    jumping: [1, 11, 12, 11, 1],
  },

  action_animations: {
    talking: [0, 1],
    //crouchdown: [10, 11],
    crouchdown: [11],
    //crouchup: [12, 13],
    //crouchup: [13],
    none: [0],
    sit: [13],
  },

  drawBubble: function (x, y, msg) {
    //thoughts: we should limit number of characters in user's input to limit the size of the bubble.
    text = msg.content;
    username = msg.username;
    this.ctx.font = "8px Helvetica";
    this.ctx.fillStyle = "white";
    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = "1";
    w = this.ctx.measureText(text).width + 20;
    h = 15;
    radius = 5;

    //set bubble animation
    // var bubble_anim = makeArr(0, this.canvas.height + h, 60);
    // var time = performance.now() * 0.001;
    // y += -bubble_anim[Math.floor(time)*10];

    var r = x + w;
    var b = y + h;

    //draw bubble
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(r - radius, y);
    this.ctx.quadraticCurveTo(r, y, r, y + radius);
    this.ctx.lineTo(r, y + h - radius);
    this.ctx.quadraticCurveTo(r, b, r - radius, b);
    this.ctx.lineTo(x + radius, b);
    this.ctx.quadraticCurveTo(x, b, x, b - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.fillStyle = "#000";
    this.ctx.fillText(username + text, x + 10, y + 10);
  
},


  drawUser: function (user) {
    var msg = {
      content: "hello test testtest test test test test test",
      username: user.name,
    }
    if (!user.avatar) return;

    var gait_anim = this.gait_animations[user.gait];
    var action_anim = this.action_animations[user.action];
    if (!gait_anim) return;
    if (!action_anim) return;

    var time = performance.now() * 0.001;
    var img = this.getImage(user.avatar);
    var gait_frame = gait_anim[Math.floor(time * 10) % gait_anim.length];
    var action_frame = action_anim[Math.floor(time * 10) % action_anim.length];
    var facing = user.facing;

    if (user.action == "crouchdown" || user.action == "crouchup")
      {
        this.ctx.drawImage( img, action_frame * 32, facing * 64, 32, 64, user.position - 16, -28, 32, 64 );
      }
    //must fix this to limit frames to 2
    else if (user.action == "talking" && user.gait == "idle") 
      { 
        this.ctx.drawImage( img, action_frame * 32, facing * 64, 32, 64, user.position - 16, -28, 32, 64 );
        //this.drawBubble(user.position, -50, msg);
      } 
    else if (user.gait) 
      { 
        this.ctx.drawImage( img, gait_frame * 32, facing * 64, 32, 64, user.position - 16, -28, 32, 64 );
        this.drawBubble(user.position, -50, msg);
        //this.ctx.font = "6px Helvetica";
        //this.ctx.fillText(user.name, user.position - 10, 50);
      } 
    else if (user.action == "talking" && user.gait == "walking")
      this.ctx.drawImage( img, gait_frame * 32, facing * 64, 32, 64, user.position - 16, -28, 32, 64 );
    // remove talking and return talking onUserArrive
  },

  getImage: function (url) {
    if (imgs[url]) return imgs[url];
  
    var img = (imgs[url] = new Image());
    img.src = url;
    return img;
  }
};

