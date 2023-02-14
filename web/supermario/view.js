var isJump = 120;
var dur = 120;
var offset = (60 * 60) / 40
const View = {
  scale: 0.48,
  current_room: {},
  images: {},
  w: 60,
  h: 98,
  s: 3,
  my_user_name: "ttss",
  my_user_id: 0,
  init:function(){},
  getImg: function (url) {
    if (this.images[url]) {
      return this.images[url];
    }
    var img = (this.images[url] = new Image());
    img.src = url;
    return img;
  },
  draw: function (canvas, ctx, room) {
    var container = canvas.parentNode;
    var rect = container.getBoundingClientRect();
    let image = this.getImg(room.url);
    canvas.height = rect.height;
    canvas.width = rect.width;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(this.scale, this.scale);
    ctx.drawImage(image, image.width / -2, image.height / -2);
    room.user_list.forEach((user) => {
      this.drawUser(user, ctx);
    });
  },
  drawUser: function (user, ctx) {
    let t = Math.floor(performance.now() * 0.001 * 8);
    let frame = user.status[t % user.status.length];
    let row = Math.floor(frame / 12);
    frame = frame % 12;
    let image = this.getImg(user.avatar);
    ctx.save();
    ctx.drawImage(
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
    ctx.restore();
  },
};
