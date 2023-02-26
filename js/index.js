console.log("connected");
var scene = null;
var renderer = null;
var camera = null;
var character = null;
var animation = {};

function init() {
  console.log("init");
  var context = GL.create({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  renderer = new RD.Renderer(context);
  document.body.appendChild(renderer.canvas);
  renderer.setDataFolder("data");
  renderer.autoload_assets = true;

  scene = new RD.Scene();

  camera = new RD.Camera();
  camera.perspective(60, gl.canvas.width / gl.canvas.height, 0.1, 1000);
  camera.lookAt([0, 80, 300], [0, 20, 0], [0, 1, 0]);

  var bg_color = [0.1, 0.1, 0.1, 1];
  var mat = new RD.Material({ textures: { color: "girl/girl.png" } });
  mat.register("girl");

  function loadAnimation( name, url )
	{
		var anim = animation[name] = new RD.SkeletalAnimation();
		anim.load(url);
		return anim;
	}
	loadAnimation("idle","data/girl/idle.skanim");
	loadAnimation("walking","data/girl/walking.skanim");
	loadAnimation("dance","data/girl/dance.skanim");

  var node = new RD.SceneNode();
  node.mesh = "cube";
  scene.root.addChild(node);

  var girl = new RD.SceneNode();
  girl.mesh = "girl/girl.wbin";
  girl.texture = "girl/girl.png";
  girl.shader = "phong_texture";
  girl.position = [3, 0, 0];
  girl.material = "girl";
  scene.root.addChild(girl);
  character = girl;

  context.ondraw = () => {
    renderer.clear(bg_color);
    renderer.render(scene, camera);
  };

  context.onupdate = (dt) => {

    character.skeleton = animation.idle.skeleton;
    scene.update(dt);
    var t = getTime();

    var delta = [0, 0, 0];
    var angle = 0;
    if (gl.keys["LEFT"]) delta = [1, 0, 0];
    if (gl.keys["RIGHT"]) delta = [-1, 0, 0];
    if (gl.keys["UP"]) angle = -65;
    if (gl.keys["DOWN"]) angle = 65;

    character.rotate(angle * DEG2RAD * dt, [0, 1, 0]);
    vec3.scale(delta, delta, dt * 5);
    animation.idle.assignTime( t * 0.001 * 1 );
    character.move(delta);
  };

  context.onmousemove = (e) => {
    if (e.dragging) {
      camera.orbit(e.deltax * -0.01, RD.UP);
    }
  };

  context.onmousewheel = (e) => {
    camera.moveLocal([0, 0, e.wheel < 0 ? 10 : -10]);
  };

  context.captureMouse(true);
  context.captureKeys();
  context.animate();
}

function v3(x, y, z) {
  return vec3.fromValues(x, y, z);
}

v = v3(1, 23, 3);
console.log(v);

function test() {
  //   console.log("test");
  //   var canvas = document.createElement("canvas");
  //   var ctx = canvas.getContext("webgl");
  //   var c = document.body.querySelector("canvas");
  //   c.remove();
  //   document.body.appendChild(canvas);
  //   ctx.clearColor(1, 0, 0, 1);
  //   ctx.clear(ctx.COLOR_BUFFER_BIT);
}
