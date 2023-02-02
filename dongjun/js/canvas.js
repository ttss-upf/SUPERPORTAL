var canvas = document.querySelector("canvas");
var last = performance.now();
var keys = {};
var mouse_pos = [0,0];
var mouse_buttons = 0;
var imgs ={};


function loop() 
{
    draw();
    var now = performance.now();
    var elapsed_time = (now - last)/1000;
    last = now;
    update (elapsed_time);
    requestAnimationFrame( loop );
}

loop();


function draw ()
{
    
    var parent = canvas.parentNode;
    var rect = parent.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    var ctx = canvas.getContext('2d');
    MYAPP.draw( ctx );
}

function getImage( url )
{
    if(imgs[url])
        return imgs[url];
    
    var img = imgs[url] = new Image();
    img.src = url;
    return img;
}

function update(dt)
{
    MYAPP.update(dt);
}

function onMouse ( e ) 
{
    var rect = canvas.getBoundingClientRect();
    var canvasx = mouse_pos[0] = e.clientX - rect.left;
    var canvasy = mouse_pos[1] = e.clientY - rect.top;
    mouse_buttons = e.buttons;
    MYAPP.onMouse( e )
}

document.body.addEventListener("mousedown", onMouse);
document.body.addEventListener("mousemove", onMouse);
document.body.addEventListener("mouseup", onMouse);

function onKeyDown ( e )
{
    keys[e.key] = true;
    MYAPP.onKey(e);
};

function onKeyUp ( e )
{
    keys[e.key] = false;
    MYAPP.onKey(e);
}

document.body.addEventListener("keydown", onKeyDown);
document.body.addEventListener("keyup", onKeyUp)

MYAPP.init();