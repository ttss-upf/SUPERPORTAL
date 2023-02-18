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
        msg = {
          content: "Welcome to Super Portal, " + this.my_user.username,
          username: "system message",
          type: "sysmsg",
          timestamp: new Date().toTimeString().slice(0, 5),
        };
        View.showText(msg, "joinleft");
        break;

      case "joinedroom":
        user = World.createUser(data.content);
        World.addUser(user);
        msg = {
          content: user.username + " has joined the room.",
          username: "system message",
          type: "sysmsg",
          timestamp: new Date().toTimeString().slice(0, 5),
        };
        View.showText(msg, "joinleft");
        if (user.username == this.my_user.username)
        this.shareRoomWelcome(World.rooms_by_id[user.room].welcome_msg);
        break;

      case "leftroom":
        for (i = 0; i < MyCanvas.current_room.people.length; i++) {
          if (MyCanvas.current_room.people[i].username == data.username)
            MyCanvas.current_room.people.splice(i, 1);
        }
        msg = {
          content: data.content.username + " has left the room.",
          username: "system message",
          type: "sysmsg",
          timestamp: new Date().toTimeString().slice(0, 5),
        };
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
    }
  },

  inputText: function (cas, event) {
    console.log("input msg");
    if (event.key === "Enter" && event.shiftKey) {
      return;
    } else if (event.key === "Enter" || cas == "1") {
      event.preventDefault();
      input = this.textarea.value;
      if (input.startsWith("@")) {
        switchType = "private";
        var sendToUser = new Array();
        const words = input.split("@");
        for (var i = 1; i < words.length; i++) {
          sendToUser.push(words[i].substring(0, input.indexOf(" ") - 1));
        }
      } else {
        switchType = "text";
        sendToUser = "";
      }
      msg = {
        type: switchType,
        content: this.textarea.value,
        username: this.my_user.username,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      if (msg.type === "private") {
        if (
          sendToUser.every((sendToUser) => {
            for (i in MyCanvas.current_room.people) {
              sendToUser == MyCanvas.current_room.people[i].name;
            }
          })
        ) {
          s_msg = JSON.stringify(msg);
          this.server.send(s_msg, sendToUser);
          View.showText(msg, "sent");
        } else {
          errorNoUsermsg = {
            content:
              "Message was not sent because user(s) " +
              sendToUser +
              " is/are not in the room.",
            username: "system message",
            type: "sysmsg",
          };
          View.showText(errorNoUsermsg, "joinleft");
          this.server.feedback = false;
        }
      } else {
        s_msg = JSON.stringify(msg);
        this.server.send(s_msg);
        MyCanvas.OnUserSpeak(msg);
        View.message_bubble.push({
          content: msg.content,
          username: msg.username,
          dur: 500,
        });
        View.showText(msg, "sent");
      }

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
    inputs = document.getElementsByName("radio");
    inputs.forEach((element) => {
      if (element.checked == true) {
        user.avatar =
          STATIC_RESOURCE_ROOT + "character" + element.value + ".png";
      }
    });
    let user_res = await this.fetchData(Config.HTTP_URL + "login", user);
    if (user_res.status != 200) {
      alert(user_res.msg);
      return;
    }
    let room_res = await this.fetchData(Config.HTTP_URL + "load/room_list");
    for (val in room_res) {
      World.updateRoom(room_res[val]);
    }

    // console.log("user_res.content", user_res.content);
    this.my_user = World.createUser(user_res.content);
    World.addUser(this.my_user);
    MyCanvas.current_room = World.rooms_by_id[this.my_user.room];

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
    if (!room_name || !welcome_msg) {
      msg = {
        content: "Please fill all the required information",
        username: "system message",
        type: "sysmsg",
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      View.showText(msg, "joinleft");
    } else {
      var room_model = Model.ROOMS[room_key];
      var leadsTo = Object.values(World.rooms_by_id)[0].name;
      var new_room = World.createRoom({
        name: room_name,
        url: url,
        welcome_msg: welcome_msg,
        exits: { leadsTo: room_model.exits_coordinate[0] },
        leadsTo: [leadsTo],
      });
      World.updateRoom(new_room);
      var msg = {
        type: "state",
        content: new_room,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      this.server.send(JSON.stringify(msg));
    }
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

  // printInfo: function (data) {
  //   console.log(data);
  // },
};

MyChat.init();
