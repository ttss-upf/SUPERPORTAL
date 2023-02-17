var MYCHAT = {
  url: "http://localhost:9022/",
  window: null,
  textarea: null,
  sendbutton: null,
  myspace: {
    my_room: null,
    my_username: null,
  },
  LoginButton: null,
  LogoutButton: null,
  input_username: null,
  input_password: null,
  server: null,

  init: function () {
    this.window = document.querySelector("#main");
    this.textarea = document.querySelector("textarea");
    this.LoginButton = document.querySelector("#login");
    this.sendbutton = document.querySelector("#sendbutton");
    this.LogoutButton = document.querySelector(".connectButton");
    this.WeatherButton = document.querySelector(".weatherButton");
    this.input_password = document.querySelector("#input_password");
    this.input_username = document.querySelector("#input_username");
    this.LoginButton.addEventListener("click", this.onLoginClick.bind(this));
    this.LogoutButton.addEventListener("click", this.onLogoutClick.bind(this));
    this.WeatherButton.addEventListener(
      "click",
      this.onWeatherClick.bind(this)
    );
    this.textarea.addEventListener(
      "keydown",
      this.onKeyPressed.bind(this, "3")
    ); // send message on Enter
    this.sendbutton.onclick = this.onKeyPressed.bind(this, "1"); // send message on "send" button click
  },

  onLoginClick: async function (event) {
    if (this.input_username.value == "" || this.input_password.value == "") {
      alert("please input all the information");
      return;
    }
    let user = WORLD.createUser({
      username: this.input_username.value,
    });
    //user.avatar = "url"
    user.password = this.input_password.value;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    };
    let res = await fetch(this.url + "login", options);
    let data = await res.json();
    if (data.status == 200) {
      this.myspace.my_username = this.input_username.value;
      this.myspace.my_userid = data.content.id;
      delete data.content.password;
      let res = await fetch(this.url + "load/room_list");
      res = await res.json();
      WORLD.rooms_by_id = res;
      console.log("user", data.content);
      this.myspace.my_user = WORLD.createUser(data.content);
      MYAPP.current_room = WORLD.rooms_by_id[this.myspace.my_user.room];
      let app = document.querySelector("#EnterApp");
      app.style.display = "none";
      await MYCHAT.Connect(this.myspace.my_username);
    } else {
      alert(data.msg);
    }
  },

  onLogoutClick: function () {
    this.server.close();
    this.ConnectionKilled();
  },

  onWeatherClick: function () {
    button = this.WeatherButton;
    if (button.innerHTML == "weather toggle") {
      View.weather = "snow";
      button.innerHTML = "snow";
    } else if (button.innerHTML == "snow") {
      button.innerHTML = "rain";
      View.weather = "rain";
    } else if (button.innerHTML == "rain") {
      button.innerHTML = "sunny";
      View.weather = "sunny";
    } else if (button.innerHTML == "sunny") {
      button.innerHTML = "snow";
      View.weather = "snow";
    }
    View.drawWeather();
  },

  Connect: async function (username) {
    console.log("connecting");
    this.server = new WebSocket(
      "ws://localhost:9022/" + "Beach" + "?username=" + username
    );
    this.server.onopen = this.ReceiveText.bind(this);
    this.server.onmessage = this.ReceiveText.bind(this);
    await MYAPP.init();
  },

  ShareID: function (user_id) {
    msg = {
      content: "Welcome to Super Portal, " + this.myspace.my_username,
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    this.showText(msg, "joinleft");
  },

  notify: function (data, type) {
    msg = {
      content: "User " + data + " has " + type + " the room.",
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    this.showText(msg, "joinleft");
  },

  ConnectionKilled: function () {
    msg = {
      content: "You've successfully logged out.",
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    this.showText(msg, "joinleft");
  },

  ReceiveText: function (data) {
    if (data.data) {
      var obj = JSON.parse(data.data);
      if (obj.type == "login") this.ShareID(obj.user_id);
      else if (obj.type == "leftroom") {
        this.notify(obj.username, "left");
        for (i = 0; i < MYAPP.current_room.people.length; i++) {
          if (MYAPP.current_room.people[i].username == obj.username)
            MYAPP.current_room.people.splice(i, 1);
        }
      } else if (obj.type == "joinedroom") {
        this.notify(obj.username, "joined");
        console.log(obj);
        WORLD.createUser(obj.content);
      } else if (obj.type == "text") {
        this.showText(obj, "received");
        View.message_bubble.push({
          content: obj.content,
          username: obj.username,
          dur: 500
        })
      } else if (obj.type == "state") {
        WORLD.updateRoom(obj.content);
        MYAPP.current_room = WORLD.getRoom(obj.content.name);
        MYAPP.my_user = this.myspace.my_user;
      }
    }
  },

  printInfo: function (data) {
    console.log(data);
  },

  showText: function (msg, style) {
    var elem = document.createElement("div");
    elem.className = style;
    var div = document.createElement("div");
    div.className = "username";
    time = msg.timestamp;
    div.innerHTML = msg.username + " " + time;
    if (msg.type === "sysmsg") {
      div.style.display = "none";
    }
    elem.appendChild(div);
    let div2 = document.createElement("div");
    div2.className = "publishedmsg";
    div2.classList.add(msg.type);
    div2.innerHTML = msg.content;
    elem.appendChild(div2);
    if (div2.innerHTML.trim() == "") {
      return;
    } else {
      var conversation = document.querySelector("#conversation");
      conversation.appendChild(elem);
      const lastdiv = document.querySelector(
        "#conversation > div:last-of-type"
      );
      lastdiv.scrollIntoView();
    }
  },

  onKeyPressed: function (cas, event) {
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
        username: this.myspace.my_username,
        timestamp: new Date().toTimeString().slice(0, 5),
      };
      if (msg.type === "private") {
        if (
          sendToUser.every((sendToUser) => {
            for (i in MYAPP.current_room.people) {
              sendToUser == MYAPP.current_room.people[i].name;
            }
          })
        ) {
          s_msg = JSON.stringify(msg);
          this.server.send(s_msg, sendToUser);
          this.showText(msg, "sent");
        } else {
          errorNoUsermsg = {
            content:
              "Message was not sent because user(s) " +
              sendToUser +
              " is/are not in the room.",
            username: "system message",
            type: "sysmsg",
          };
          this.showText(errorNoUsermsg, "joinleft");
          this.server.feedback = false;
        }
      } else {
        s_msg = JSON.stringify(msg);
        this.server.send(s_msg);
        MYAPP.OnUserSpeak(msg);
        View.message_bubble.push({
          content: msg.content,
          username: msg.username,
          dur: 500
        })
        this.showText(msg, "sent");
      }

      this.textarea.value = "";
    }
  },

  ShareRoomWelcome: function (room) {
    msg = {
      content: room.welcome_msg,
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    this.showText(msg, "joinleft");
  },
};
MYCHAT.init();

