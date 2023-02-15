var RENDERMYMSG = null; // bad, just testing something

var room_list = {
  Pirate: {
    name: "Pirate",
    url: "./images/pirate_island.png",
    id: 0,
    online_num: 0,
    weather: "snow",
    default: true,
    people: [],
    range: [-300, 300],
    exits: [-30, -60],
    leadsTo: "Beach",
  },
  Beach: {
    name: "Beach",
    url: "./images/beach_night.png",
    id: 1,
    default: false,
    online_num: 0,
    weather: "rain",
    people: [],
    range: [-300, 300],
    exits: [-285, 80],
    leadsTo: "Pirate",
  },
};

var mychat = {
  url: "http://localhost:9022/",
  window: null,
  LobbyButton: null,
  textarea: null,
  sendbutton: null,
  myspace: {
    my_room: null,
    my_username: null,
  },
  LinkIDtoName: [],
  mydatabase: { type: "history", content: [] },
  NumOnlineUsersByRoom: null,
  OnlineRooms: null,
  UsersInThisRoom: null,
  LoginButton: null,
  LogoutButton: null,
  input_username: null,
  input_password: null,
  server: null,

  init: function () {
    //loading the lobby before connection
    this.LoginButton = document.querySelector("#login");
    this.window = document.querySelector("#main");
    this.textarea = document.querySelector("textarea");
    this.LogoutButton = document.querySelector(".connectButton");
    this.LobbyButton = document.querySelector(".lobbyButton");
    this.WeatherButton = document.querySelector(".weatherButton");
    this.UsersButton = document.querySelector(".usersButton");
    this.sendbutton = document.querySelector("#sendbutton");
    this.input_username = document.querySelector("#input_username");
    this.input_password = document.querySelector("#input_password");

    this.LoginButton.addEventListener("click", this.onLoginClick.bind(this));
    this.LogoutButton.addEventListener("click", this.onLogoutClick.bind(this));
    this.WeatherButton.addEventListener("click", this.onWeatherClick.bind(this));
    this.textarea.addEventListener( "keydown", this.onKeyPressed.bind(this, "3") ); // send message on Enter
    this.sendbutton.onclick = this.onKeyPressed.bind(this, "1"); // send message on "send" button click
  },

  onLoginClick: function (event) {
    let username = this.input_username.value;
    let password = this.input_password.value;
    if (username == "" || password == "") {
      alert("please input all the information");
      return;
    }
    let user = {};
    //user.avatar = "url"
    user.username = username;
    user.password = password;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    };
    fetch(this.url + "login", options)
      .then((response) => response.json())
      .then((data) => {
        if (data.status == 200) {
          // alert(data.content);
          this.myspace.my_username = username;
          this.myspace.my_userid = data.content;
          delete user.password;
          this.myspace.my_user = WORLD.createUser(user);
          let app = document.querySelector("#EnterApp");
          app.style.display = "none";
          mychat.Connect();
          MYAPP.init();
        } else {
          alert(data.msg);
        }
      });
  },

  onLogoutClick: function () {
    this.server.close();
    this.ConnectionKilled();
  },

  onWeatherClick: function ()
  {
    button = this.WeatherButton;
    if (button.innerHTML == "weather toggle")
      button.innerHTML = "snow";
    else if (button.innerHTML == "snow")
      button.innerHTML = "rain";
    else if (button.innerHTML == "rain")
      button.innerHTML = "sunny";
    else if (button.innerHTML == "sunny")
      button.innerHTML = "snow";
  },

  Connect: function () {
    // our server
    this.server = new WebSocket("ws://localhost:9022/" + this.myspace.my_room);
    //this.server.onopen = this.ShareID.bind(this);
    this.server.onopen = this.ReceiveText.bind(this);
    this.server.onmessage = this.ReceiveText.bind(this);
  },

  ShareID: function (user_id) {
    //if (this.server.loadData)
    //    { this.server.loadData(this.myspace.my_room, this.loadHistory.bind(this)); }
    msg = {
      content: "Welcome to Super Portal, " + this.myspace.my_username,
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    this.showText(msg, "joinleft");
    // msg = {
    //   content:
    //     "To send a private message to users, start with '@user_ID', eg.: '@1405 @6203 Hello'",
    //   username: "system message",
    //   type: "sysmsg",
    //   timestamp: new Date().toTimeString().slice(0, 5),
    // };
    // this.showText(msg, "joinleft");
    this.myspace.my_userid = user_id;

    // button = document.querySelector(".connectButton");
    // button.innerHTML = "reset";
  },

  RoomEnter: function (user_id) {
    msg = {
      content: "User " + user_id + " has joined the room.",
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    this.showText(msg, "joinleft");
    //this.server.getReport(this.LobbyData.bind(this));
  },

  RoomLeave: function (user_id) {
    msg = {
      content: "User " + user_id + " has left the room.",
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };
    this.showText(msg, "joinleft");
    //this.server.getReport(this.LobbyData.bind(this));
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

  //ReceiveText: function ( user_id, msg)
  ReceiveText: function (data) {
    if (data.data) {
      msg = data.data;
      var obj = JSON.parse(msg);
      console.log(obj);
      //if (obj.user_id)
      //    { obj.user_id = user_id; }
      //obj.userid = user_id;
      if (obj.type == "login") this.ShareID(obj.user_id);
      //else if (obj.type == "leftroom" && obj.user_id == this.myspace.my_userid) this.ConnectionKilled();
      else if (obj.type == "leftroom") this.RoomLeave(obj.user_id);
      else if (obj.type == "joinedroom") this.RoomEnter(obj.user_id);
      else if (obj.type == "text") this.showText(obj, "received");
      if (obj.type !== "private") {
        this.mydatabase.content.push(obj);
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
    div2.classList.add(msg.type); // will use type for now to assess the second class (if available) of the div
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
      //conversation.scrollTop = 10000;
    }
  },

  onKeyPressed: function (cas, event) {
    if (event.key === "Enter" && event.shiftKey) {
      return;
    } 
    else if (event.key === "Enter" || cas == "1") {
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
      state = {
        type: "state",
        content: room_list[this.textarea.value],
      };
      console.log(state);
      //   if (msg.type === "private") {
      //     if (
      //       sendToUser.every((sendToUser) =>
      //         clients_info.hasOwnProperty(sendToUser)
      //       )
      //     ) {
      //       s_msg = JSON.stringify(msg);
      //       this.server.send(s_msg, sendToUser);
      //       //this.mydatabase.content.push(msg);
      //       this.showText(msg, "sent");

      //       clientsArray = Object.keys(this.server.clients);
      //       if (this.myspace.my_userid == Math.min(...clientsArray)) {
      //         this.server.storeData(
      //           this.myspace.my_room,
      //           JSON.stringify(this.mydatabase.content),
      //           this.printInfo.bind(this)
      //         );
      //       }
      //     } else {
      //       errorNoUsermsg = {
      //         content:
      //           "Message was not sent because user(s) " +
      //           sendToUser +
      //           " is/are not in the room.",
      //         username: "system message",
      //         type: "sysmsg",
      //       };
      //       this.showText(errorNoUsermsg, "joinleft");
      //       this.server.feedback = false;
      //     }
      //   } else {
      s_msg = JSON.stringify(msg);
      this.server.send(s_msg);
      this.server.send(JSON.stringify(state));
      MYAPP.OnUserSpeak(msg);
      RENDERMYMSG = msg;
      //View.drawBubble(this.myspace.my_user.position, -50, msg);
      //View.scribble();
      this.mydatabase.content.push(msg);
      this.showText(msg, "sent");

      //catching error
      if (this.server.storeData) {
        clientsArray = Object.keys(this.server.clients);
        if (this.myspace.my_userid == Math.min(...clientsArray)) {
          this.server.storeData(
            this.myspace.my_room,
            JSON.stringify(this.mydatabase.content),
            this.printInfo.bind(this)
          );
        }
      }
      //   }

      this.textarea.value = "";
    }
  },

  ShareRoomWelcome: function (room)
  {
    msg = {
      content: room.welcome_msg,
      username: "system message",
      type: "sysmsg",
      timestamp: new Date().toTimeString().slice(0, 5),
    };

    this.showText(msg, "joinleft");
  },

};
