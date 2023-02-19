var MyChat = {
  my_user: {},
  server: null,

  init: function () {
    this.window = document.querySelector("#main");
    this.selectBox = document.querySelector("#background");
    this.saveButton = document.querySelector("#save");
    this.textarea = document.querySelector("textarea");
    this.loginButton = document.querySelector("#login");
    this.sendButton = document.querySelector("#sendbutton");
    this.logoutButton = document.querySelector(".connectButton");
    this.input_password = document.querySelector("#input_password");
    this.input_username = document.querySelector("#input_username");
    this.loginButton.addEventListener("click", this.onLoginClick.bind(this));
    this.logoutButton.addEventListener("click", this.onLogoutClick.bind(this));
    this.saveButton.addEventListener("click", this.saveButtonClick.bind(this));

    this.WeatherButton = document.querySelector(".weatherButton");
    this.WeatherButton.addEventListener(
      "click",
      this.onWeatherClick.bind(this)
    );
    this.textarea.addEventListener("keydown", this.inputText.bind(this, "3")); // send message on Enter
    this.sendButton.onclick = this.inputText.bind(this, "1"); // send message on "send" button click
    for (i in Model.ROOMS) {
      room = Model.ROOMS[i];
      option = new Option(room.name, room.url);
      this.selectBox.add(option);
    }
  },
  connect: async function () {
    console.log("connecting");
    this.server = new WebSocket(
      Config.WS_URL + this.my_user.room + "?username=" + this.my_user.username
    );
    this.server.onopen = this.receiveText.bind(this);
    this.server.onmessage = this.receiveText.bind(this);
    await MyCanvas.init();
  },

  fetchData: async function (url, data) {
    console.log("fetch data from database");
    if (data && typeof data != "undefined") {
      let options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      };
      res = await fetch(url, options);
    } else {
      res = await fetch(url);
    }
    result = await res.json();
    return result;
  },

  connectKilled: function () {
    console.log("on log out");
    msg = {
      content: "You've successfully logged out.",
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    View.showText(msg, "joinleft");
  },

  receiveText: function (msg) {
    if (!msg.data || typeof msg.data == "undefined") return;
    let data = JSON.parse(msg.data);
    this.handleText(data);
  },

  handleText: function (data) {
    switch (data.type) {
      case "login":
        user = data.content;
        msg = {
          content: "Welcome to Super Portal, " + this.my_user.username,
          username: "system message",
          type: "sysmsg",
          timestamp: new Date().toTimeString().slice(0, 5),
        };
        View.showText(msg, "joinleft");
        View.message_bubble.push({
          content: "init",
          username: this.my_user.username,
          dur: 500,
        });
        break;

      case "joinedroom":
        user = World.createUser(data.content);
        World.addUser(user);
        msg = {
          content: user.username + " has joined " + user.room,
          username: "system message",
          type: "sysmsg",
          timestamp: new Date().toTimeString().slice(0, 5),
        };
        if (user.username == this.my_user.username) {
          this.shareRoomWelcome(World.rooms_by_id[user.room].welcome_msg || "");
          View.changeRoomName(user.room);
        } else View.showText(msg, "joinleft");
        break;

      case "leftroom":
        // for (i = 0; i < MyCanvas.current_room.people.length; i++) {
        //   if (MyCanvas.current_room.people[i].username == data.content.username)
        //     MyCanvas.current_room.people.splice(i, 1);
        // }
        msg = {
          content: data.content.username + " has left the room.",
          username: "system message",
          type: "sysmsg",
          timestamp: new Date().toTimeString().slice(0, 5),
        };
        // if()
        View.showText(msg, "joinleft");
        break;

      case "text":
        View.message_bubble.push({
          content: data.content,
          username: data.username,
          dur: 500,
        });
        View.showText(data, "received");
        break;

      case "state":
        // console.log("data.content", data.content);
        World.updateRoom(data.content);
        MyCanvas.current_room = World.getRoom(data.content.name);
        break;

      case "addroom":
        // console.log("data.content", data.content);
        World.rooms_by_id = data.content;
        break;
      default:
        // do nothing
        break;
    }
  },

  inputText: function (cas, event) {
    console.log("input msg");
    if (event.key === "Enter" && event.shiftKey) {
      return;
    } else if (event.key === "Enter" || cas == "1") {
      event.preventDefault();
      input = this.textarea.value;
      msg = {
        type: "text",
        content: this.textarea.value,
        username: this.my_user.username,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      s_msg = JSON.stringify(msg);
      this.server.send(s_msg);
      MyCanvas.OnUserSpeak(msg);
      View.message_bubble.push({
        content: msg.content,
        username: msg.username,
        dur: 500,
      });
      View.showText(msg, "sent");

      this.textarea.value = "";
    }
  },

  onLoginClick: async function (event) {
    console.log("on login");
    if (this.input_username.value == "" || this.input_password.value == "") {
      alert("please input all the information");
      return;
    }
    let user = {
      username: this.input_username.value,
      password: this.input_password.value,
    };
    // get avatar
    inputs = document.getElementsByName("radio");
    inputs.forEach((element) => {
      if (element.checked == true) {
        user.avatar =
          STATIC_RESOURCE_ROOT + "character" + element.value + ".png";
      }
    });
    // validate the username and pwd
    let user_res = await this.fetchData(Config.HTTP_URL + "login", user);
    if (user_res.status != 200) {
      alert(user_res.msg);
      return;
    }
    // get room info from database
    let room_res = await this.fetchData(Config.HTTP_URL + "load/room_list");
    for (val in room_res) {
      World.updateRoom(room_res[val]);
    }
    // create user character and add to the world
    this.my_user = World.createUser(user_res.content);
    World.addUser(this.my_user);
    MyCanvas.current_room = World.rooms_by_id[this.my_user.room];

    // ws connection bulilding
    let app = document.querySelector("#EnterApp");
    app.style.display = "none";
    await MyChat.connect();
  },

  onLogoutClick: function () {
    this.server.close();
    this.connectKilled();
  },

  onWeatherClick: function () {
    View.initWeather(this.WeatherButton);
  },

  saveButtonClick: function () {
    room_name = document.querySelector("#roomname").value;
    background = document.querySelector("#background");
    url = background.value;
    var index = background.selectedIndex;
    room_key = background.options[index].text;
    welcome_msg = document.querySelector("#welcomemsg").value;
    // linked_room = document.querySelector("2").value;

    // data validation
    if (!room_name || !welcome_msg) {
      msg = {
        content: "Please fill all the required information",
        username: "system message",
        type: "sysmsg",
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      View.showText(msg, "joinleft");
      return;
    }
    if (Object.keys(World.rooms_by_id).includes(room_name)) {
      alert("room existed");
      return;
    }
    // load room building template
    var room_model = Model.ROOMS[room_key];
    // get the nearest room as the linked room, the room must have one empty slot to build the portal
    for (val in World.rooms_by_id) {
      old_room = World.rooms_by_id[val];
      if (World.rooms_by_id[val].leadsTo.length == 1) {
        old_room_name = val;
      }
    }
    // generate exits for new room we want to create
    var exits = {};
    exits[old_room_name] = room_model.exits_coordinate[0];
    // create new room object and intilize the room
    var new_room = World.createRoom({
      name: room_name,
      url: url,
      welcome_msg: welcome_msg,
      exits: exits,
      leadsTo: [old_room_name],
    });
    // update the world.
    World.updateRoom(new_room);

    // add exits for current room, the coordinate depends on the template that old room is using.
    // get the template of old room
    old_room_exits = Object.values(World.rooms_by_id[old_room_name].exits)[0];
    console.log(old_room_exits);
    for (room_model in Model.ROOMS) {
      if (
        JSON.stringify(Model.ROOMS[room_model].exits_coordinate[0]) ==
        JSON.stringify(old_room_exits)
      ) {
        var exits_coordinate = Model.ROOMS[room_model].exits_coordinate[1];
        console.log("equal", exits_coordinate);
        break;
      }
    }
    World.rooms_by_id[old_room_name].exits[new_room.name] = exits_coordinate;
    console.log(World.rooms_by_id[old_room_name]);

    // send new room to the server for updating
    var msg = {
      type: "newroom",
      content: new_room,
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    this.server.send(JSON.stringify(msg));
    msg = {
      content: "You can go to the new room from " + old_room_name,
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    View.showText(msg, "joinleft");
    View.showForm();
  },

  shareRoomWelcome: function (welcome_msg) {
    msg = {
      content: welcome_msg,
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    View.showText(msg, "joinleft");
  },
};

MyChat.init();
