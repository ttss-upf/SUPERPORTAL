var FACING_RIGHT = 0;
var FACING_FRONT = 1;
var FACING_LEFT = 2;
var FACING_BACK = 3;
var TEXTAREA = document.querySelector("textarea"); 

function clamp (v, min, max)
{
    return ( v < min ? min : (v > max ? max : v));
}

function lerp (a, b, f)
{
    return a * (1-f) + b * f;
}

function makeArr (startValue, stopValue, cardinality)
{
    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
      arr.push(startValue + (step * i));
    }
    return arr;
}

function isIntersect(click, exit) 
{
    if ( Math.abs( Math.abs(click[0]) - Math.abs(exit[0]) ) <= 10 && Math.abs ( Math.abs(click[1]) - Math.abs(exit[1]) ) <= 10 ) 
        return true;
}

function User() {
    this.position = 0;
    this.avatar = "./image/character1.png";
    this.name = "username";
    this.facing = FACING_FRONT;
    this.gait = "idle";
    this.action = "none";
    this.target = [0,0];
}

function Room( name ) {
    this.name = name;
    this.url = null;
    this.id = -1;
    this.people = [];
    this.range = [-300, 300]
    this.exits = [];
}

Room.prototype.addUser = function( user )
{
    this.people.push( user );
    //user.room = this;
    user.room = this.name;
}

Room.prototype.removeUser = function ( user )
{
    index = this.people.indexOf ( user );
    this.people.splice ( index, 1 );
    //user.room = default_room;
},

Room.prototype.addExit = function ( pos )
{
    if(Array.isArray(pos))
        this.exits.push( pos[0], pos[1] )
}

Room.prototype.addleadsTo = function ( room )
{
    this.leadsTo = room;
}

var WORLD = {
    rooms: [],
    rooms_by_id: {},
    last_id:0,

    createRoom: function(name, url)
    {
        var room = new Room(name);
        room.id = this.last_id++;
        room.url = url;

        this.rooms.push(room);
        this.rooms_by_id[name]=room;
        return room;
    },
}


var MYAPP = {

    current_room: null,
    cam_offset: 0,
    scale: 2,

    init: function()
    {
        //create room
        Pirate = WORLD.createRoom("Pirate","./image/pirate_island.png");
        Beach = WORLD.createRoom("Beach","./image/beach_night.png" );
        //create and add exit
        exit = [-285,80];
        Beach.addExit(exit);
        Beach.addleadsTo ("Pirate");

        exit = [-30, -60];
        Pirate.addExit(exit);
        Pirate.addleadsTo ("Beach");

        //this.current_room = Beach;
        this.current_room = Pirate;
        this.my_user = new User();
        this.current_room.addUser(this.my_user);

    },

    draw: function( ctx )
    {
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.save();
        ctx.translate(canvas.width/2, canvas.height/2); // now the (0,0) is in the center of the canvas
        ctx.scale(this.scale,this.scale);
        ctx.translate(this.cam_offset, 0);
        
        if (this.current_room)
            this.drawRoom(ctx, this.current_room)
            
        //center point
        ctx.fillStyle = "red";
        ctx.fillRect(-1,-1,2,2);
        ctx.restore();
        
    },

    canvasToWorld: function (pos)
    {
        return [(pos[0] - canvas.width/2) / this.scale - this.cam_offset, (pos[1] - canvas.height / 2) / this.scale];
    },

    worldToCanvas: function (pos)
    {
        return [(pos[0] + canvas.width/2) * this.scale + this.cam_offset, (pos[1] + canvas.height / 2) * this.scale];
    },

    drawRoom: function ( ctx, room)
    {   
        //draw background
        img=getImage(room.url);
        ctx.drawImage(img, -img.width/2, -img.height/2); 
        

        //draw users
        for (var i = 0; i < room.people.length; ++i)
        {
            var user = room.people[i];
            this.drawUser ( ctx, user);
        }
        //draw target
        radius = 2;
        ctx.beginPath();
        if (!user)
            { 
            user = {};
            user.target = [0,0];
            }
        ctx.arc(user.target[0], user.target[1], radius, 2 * Math.PI, false);
        //console.log("target coordinates" + user.target);
        ctx.fillStyle = "yellow";
        ctx.fill();

        //draw exits
        ctx.fillStyle = "red";
        ctx.fillRect(this.current_room.exits[0],this.current_room.exits[1],5,5);
    },


    gait_animations: {
        idle: [0],
        walking: [2, 3, 4, 5, 6, 7, 8, 9],
    },

    action_animations: {
        talking: [0,1],
        //crouchdown: [10, 11],
        crouchdown: [11],
        //crouchup: [12, 13],
        //crouchup: [13],
        none: [0],
        sit: [13],
    },

    drawBubble: function(ctx, x, y, text)
    {
        //thoughts: we should limit number of characters in user's input to limit the size of the bubble.
        ctx.font = "8px Helvetica";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = "1";
        w = ctx.measureText(text).width + 20;
        h = 15;
        radius = 5;

        //set bubble animation
        var bubble_anim = makeArr(0, canvas.height + h, 60);
        var time = performance.now()*0.001;
        y += -bubble_anim [Math.floor(time)];

        var r = x + w;
        var b = y + h;
    
        //draw bubble
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(r - radius, y);
        ctx.quadraticCurveTo(r, y, r, y + radius);
        ctx.lineTo(r, y + h-radius);
        ctx.quadraticCurveTo(r, b, r - radius, b);
        ctx.lineTo(x + radius, b);
        ctx.quadraticCurveTo(x, b, x, b - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.fillText(text, x + 10, y + 10);
        
    }, 


    drawUser: function (ctx, user)
    {   
        var text = 'hello test testtest test test test test test';
        if(!user.avatar)
            return;

        var gait_anim = this.gait_animations[ user.gait ];
        var action_anim = this.action_animations[ user.action ];
        if (!gait_anim)
            return;
        if (!action_anim)
            return;

        var time = performance.now()*0.001;
        var img = getImage (user.avatar)
        var gait_frame = gait_anim [Math.floor(time*10) % gait_anim.length];
        var action_frame = action_anim [Math.floor(time*10) % action_anim.length];
        var facing = user.facing;
        
        if (user.action == "crouchdown" || user.action == "crouchup")
            ctx.drawImage(img, action_frame*32, facing*64, 32, 64, user.position-16, -28, 32, 64); //must fix this to limit frames to 2
        else if (user.action == "talking" && user.gait == "idle")
            { 
                ctx.drawImage(img, action_frame*32, facing*64, 32, 64, user.position-16, -28, 32, 64);
                //this.drawBubble(ctx, user.position, 80, ctx.measureText(text).width + 40, 50, 20, text); 
            }
        else if (user.gait)
            {
                ctx.drawImage(img, gait_frame*32, facing*64, 32, 64, user.position-16, -28, 32, 64);
                this.drawBubble(ctx, user.position, -50, text);
            }
        else if (user.action == "talking" && user.gait =="walking")
            ctx.drawImage(img, gait_frame*32, facing*64, 32, 64, user.position-16, -28, 32, 64);
            // remove talking and return talking onUserArrive    
    },

    //function that should be used to modify the state of my application 
    update: function (dt)
    {
        if (this.my_user) 
        {
            //var room = this.my_user.room;
            var room = this.current_room;
            this.my_user.target[0] = clamp (this.my_user.target[0],room.range[0], room.range[1]);

            var diff = (this.my_user.target[0] - this.my_user.position);
            var delta = diff;
            if(delta > 0)
                delta = 30;
            else if (delta < 0)
                delta = -30;
            else 
                delta = 0;
            if ( Math.abs(diff) < 1 ) 
            {
                delta = 0;
                this.my_user.position = this.my_user.target[0];
            }
            else
                this.my_user.position += delta * dt;

            
            if (delta == 0)
                this.my_user.gait = "idle";
            else   
            {
                if (delta > 0)
                    this.my_user.facing = FACING_RIGHT;
                    else
                        this.my_user.facing = FACING_LEFT;
                this.my_user.gait = "walking";

            }

            //this.cam_offset = -this.my_user.position;
            this.cam_offset = lerp (this.cam_offset, -this.my_user.position, 0.025);
        }
        if (keys["ArrowLeft"])
            this.cam_offset += dt * 50;
        if (keys["ArrowRight"])
            this.cam_offset -= dt * 50;

    },

    onMouse: function (e)
    {
        if(e.type == "mousedown")
        {
            var localmouse = this.canvasToWorld(mouse_pos);
            this.my_user.target[0] = localmouse[0];
            this.my_user.target[1] = localmouse[1];

            if ( isIntersect(this.my_user.target, this.current_room.exits) )
            {
                this.current_room.removeUser (this.my_user);
                this.current_room = eval(this.current_room.leadsTo);
                this.my_user.room = this.current_room.name;
                this.current_room.addUser(this.my_user);
            }
        }
    
        else if(e.type == "mousemove")
        {

        }
        else
        {

        }
    },

    onKey: function (e)
    {
        if(e.key == "Control")
        {
            if (this.my_user.action == "crouchdown")
                this.my_user.action = "none";
            else 
                this.my_user.action = "crouchdown";
        }

        //if (e.key == "Escape")
            //this.current_room.removeUser (this.my_user);
            //this.current_room = Beach;
            //this.my_user.room = "Beach";
            //this.current_room.addUser(this.my_user);
    },
    
};