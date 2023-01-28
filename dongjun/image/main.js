const chat = {
    url: "wss://ecv-etic.upf.edu/node/9000/ws",
    myUserName: "",
    server: null,
    text: "",
    chatList: [],
    userList: [],
    myUserId: "",
    onlineNum: 0,
    msgType: "text",
    msgInput: null,
    roomInfo: null,
    privateUser: [],
    currentGroup: "",
    background: null,
    groupInput: null,
    rightHeader: null,
    chatBoxArea: null,
    chatListArea: null,
    chatBox_input: null,
    checkbox: null,
    // isLoaded: true,
  
    isImage: false,
    isNotify: true,
    data: [
      // {
      //     "groupName": String,
      //     "data":[{
      //         "type": String,
      //         "isReceived": Number,
      //         "content": String,
      //         "senderId": Number,
      //         "createdAt": String,
      //         "username": String
      //     }]
      // }
    ],
    // init the data binded.
    init: function () {
      this.server = new SillyClient();
      this.msgInput = document.getElementById("message");
      this.server.on_message = this.receiveMsg.bind(this);
      this.groupInput = document.getElementById("groupName");
      this.background = document.getElementById("background");
      this.rightHeader = document.getElementById("rightHeader");
      this.chatBoxArea = document.getElementById("chatBoxArea");
      this.server.on_user_connected = this.onConnect.bind(this);
      this.server.on_user_disconnected = this.onLeave.bind(this);
      this.checkbox = document.getElementsByName("userSelected");
      this.chatListArea = document.getElementById("chatListArea");
      this.chatBox_input = document.getElementById("chatBox_input");
      this.msgInput.addEventListener("keydown", this.inputText.bind(this));
      this.groupInput.addEventListener("keydown", this.inputGroup.bind(this));
      // this.startLoading.bind(this);
      this.startLoading();
      // this.connectToServer();
    },
    // first step, need you input the username and get all the room names
    startLoading: async function () {
      this.myUserName = prompt("Input your username");
      if (this.myUserName == undefined) this.myUserName = "Default username";
      let promise = new Promise((resolve, reject) => {
        this.server.getReport((res) => {
          console.log(res);
          this.chatList = Object.keys(res.rooms);
          this.renderLeftSide();
        });
      });
      await promise;
    },
    // connect to server and set userID and get roomInfo
    connectToServer: async function (id) {
      return new Promise((resolve, reject) => {
        this.server.connect(this.url, this.currentGroup);
        this.server.on_ready = (id) => {
          this.myUserId = String(id);
          this.userList.push(this.myUserId);
  
          this.server.getRoomInfo(this.currentGroup, (res) => {
            this.roomInfo = res;
            resolve(res);
          });
        };
      });
    },
    // to notify users who comes in ant out
    sendNotification: function (data) {
      if (this.isNotify || data.type != "error") {
        let notify_tag = document.createElement("div");
        let notify_child_tag = document.createElement("div");
        let p_tag = document.createElement("p");
        notify_tag.setAttribute("class", "notify");
        notify_child_tag.setAttribute("class", "notify_" + data.type);
        p_tag.innerHTML = data.content;
        notify_child_tag.appendChild(p_tag);
        notify_tag.appendChild(notify_child_tag);
        this.chatBoxArea.appendChild(notify_tag);
        document.getElementById("currentGroupName").innerHTML =
          this.currentGroup + "<br><span>" + this.onlineNum + " Online</span>";
        data.isNotify != undefined
          ? (this.isNotify = data.isNotify)
          : (this.isNotify = true);
      }
    },
    // listen and trigger when someone is in
    onConnect: function (userid) {
      this.userList.push(Number(userid));
      this.onlineNum += 1;
      if (Number(this.myUserId) == Math.min(...this.userList)) {
        console.log("I am the minimum");
        this.loadData(this.currentGroup).then((history) => {
          if (history != undefined) {
            // let data = JSON.parse(history).content;
            console.log("history" + history);
            console.log("user:" + userid + "connected");
            this.server.sendMessage(history, [userid]);
            // data.forEach((ele) => {
            //   this.addDataToChatContent(ele);
            //   this.server.sendMessage(JSON.stringify(ele));
            // });
            // this.renderLeftSide();
            // this.renderRightSide();
          }
        });
      }
      let content =
        "User&nbsp;<span style='font-weight:bolder'>" +
        userid +
        "</span>&nbsp;joins the group";
      let data = {
        type: "in",
        content: content,
      };
      this.server.on_message = function (author_id, data) {
        //data received
        if (author_id == userid) {
            console.log("user: " + data.username + "connected");
            // handleMsgShow(msg, 0, author_id)
        }
    }
      this.sendNotification(data);
      this.createUserList();
    },
    // listen and trigger when someone goes out
    onLeave: function (userid) {
      // console.log(typeof(userid));
      // console.log(this.userList.indexOf(userid));
      if (this.userList.indexOf(Number(userid)) != -1) {
        this.userList.splice(this.userList.indexOf(Number(userid)), 1);
      }
      if (this.myUserId != userid) this.onlineNum -= 1;
      let content =
        "User&nbsp;<span style='font-weight:bolder'>" +
        userid +
        "</span>&nbsp;leaves the group";
      let data = {
        type: "out",
        content: content,
      };
      this.sendNotification(data);
      this.createUserList();
    },
    // process the msg data
    inputText: function (event) {
      if (event.keyCode == 13 && this.msgInput.value != "") {
        // console.log( document.getElementById("userSelected"));
        obj = document.getElementsByName("userSelected");
        this.privateUser = [];
        for (k in obj) {
          if (obj[k].checked && this.privateUser.indexOf(obj[k].value == -1))
            this.privateUser.push(obj[k].value);
        }
        if (testLink(this.msgInput.value)) {
          this.msgInput.value =
            "<a href=" +
            this.msgInput.value +
            " target='_blank'><img src='" +
            this.msgInput.value +
            "' style='width:100%' /></a>";
          this.isImage = true;
        }
        // this.msgInput.value = "[@" + event.target.text + "]";
        if (this.privateUser.length > 0) {
          this.msgType = "private";
          this.msgInput.value = "Private msg:" + this.msgInput.value;
        } else {
          this.msgType = "text";
        }
  
        // this.privateUser.push(event.target.text);
        data = {
          type: this.msgType,
          username: this.myUserName,
          content: this.msgInput.value,
          senderId: this.myUserId,
          isReceived: false,
          timestamp: getTime(),
        };
        this.msgInput.value = "";
        if (this.msgType == "private") {
          msg = {
            type: "out",
            content:
              "The message you sent is private, unseen except user: " +
              this.privateUser,
          };
          this.sendNotification(msg);
          this.server.sendMessage(JSON.stringify(data), this.privateUser);
          // this.msgType = "text";
        } else {
          this.server.sendMessage(JSON.stringify(data));
          // this.server.sendMessage(data);
          // this.storeData(this.currentGroup, data);
        }
        this.addDataToChatContent(data);
        this.renderLeftSide(this.isImage);
        this.showText(data);
        this.basicRender();
      }
    },
    // process the groupName data
    inputGroup: function (event) {
      if (event.keyCode == 13 && this.groupInput.value != "") {
        this.currentGroup = this.groupInput.value;
        this.connectToServer().then((res) => {
          this.chatBoxArea.innerHTML = "";
          this.userList = this.roomInfo.clients;
          this.onlineNum = this.roomInfo.clients.length;
          // if (!this.isLoaded) this.chatBoxArea.innerHTML = "";
  
          this.addDataToChatList();
          this.renderLeftSide();
          this.renderRightSide();
          // });
        });
      }
    },
    // add data to left side
    addDataToChatList: function () {
      if (this.chatList.indexOf(this.currentGroup) == -1) {
        this.chatList.unshift(this.currentGroup);
      } else {
        this.chatList.splice(this.chatList.indexOf(this.currentGroup), 1);
        this.chatList.unshift(this.currentGroup);
      }
    },
    // add data to right side
    addDataToChatContent: function (data) {
      let isReceived = data.senderId != this.myUserId;
      let appendData = {
        groupName: this.currentGroup,
        data: [
          {
            type: data.type,
            isReceived: isReceived,
            content: data.content,
            timestamp: getTime(),
            senderId: data.senderId,
            username: data.username,
          },
        ],
      };
      container = this.data.filter((ele) => {
        return ele.groupName === this.currentGroup;
      });
      if (container.length > 0) {
        this.data.forEach((ele) => {
          if (ele.groupName === this.currentGroup) {
            ele.data.push(appendData.data[0]);
          }
        });
      } else {
        this.data.push(appendData);
      }
    },
    // render the room block in left side
    createBlocks: function () {
      let blocks = document.querySelectorAll("div.block");
      for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        block.addEventListener("click", async () => {
          if (this.currentGroup != this.chatList[i]) {
            this.currentGroup = this.chatList[i];
            this.connectToServer().then(() => {
              this.userList = this.server.room.clients;
              this.onlineNum = this.server.room.clients.length;
              this.chatBoxArea.innerHTML = "";
              let data = {
                type: this.msgType,
                username: this.myUserName,
                content:
                  "Hi, everyone, nice to meet you, I am " + this.myUserName,
                senderId: this.myUserId,
                isReceived: false,
                timestamp: getTime(),
              };
              this.addDataToChatList();
              this.renderLeftSide();
              this.renderRightSide();
              this.showText(data);
              this.server.sendMessage(JSON.stringify(data));
            });
          }
        });
      }
    },
    // render the emoji picker
    createEmojis: function () {
      document.getElementById("table").style.display == "block"
        ? (document.getElementById("table").style.display = "none")
        : (document.getElementById("table").style.display = "block");
      let emojis = document.querySelectorAll("td");
      for (let i = 0; i < emojis.length; i++) {
        let emoji = emojis[i];
        var that = this;
        emoji.addEventListener("click", () => {
          that.msgInput.value = that.msgInput.value + emoji.innerHTML;
        });
      }
    },
    // render the userList in the right side. for private chatting
    createUserList: function () {
      document.getElementById("dropdown-content2").innerHTML = "";
      this.userList.forEach((ele) => {
        if (ele != this.myUserId) {
          document.getElementById("dropdown-content2").innerHTML +=
            '<input type="checkbox" name="userSelected" value=' +
            ele +
            ">" +
            ele +
            "<br>";
        }
      });
    },
    // render left side
    renderLeftSide: function (isImage = false) {
      this.chatListArea.innerHTML = "";
      this.chatList.forEach((element) => {
        let content = "Start the conversation";
        let timestamp = "";
        div_tag = document.createElement("div");
        this.data.forEach((ele) => {
          if (ele.groupName === element) {
            isImage
              ? (content = "image")
              : (content = ele.data[ele.data.length - 1].content);
            date = ele.data[ele.data.length - 1].timestamp;
          }
        });
  
        div_tag.setAttribute("class", "block unread");
        div_tag.innerHTML =
          '<div class="imgbx"><ion-icon class="cover" name="people-outline"></ion-icon></div><div class="details"><div class="listHead"><h4>' +
          element +
          '</h4><p class="time">' +
          timestamp +
          '</p></div><div class="message_p"><p>' +
          content +
          "</p></div></div>";
        this.chatListArea.appendChild(div_tag);
      });
      this.createBlocks();
    },
    // render right side
    renderRightSide: function () {
      this.basicRender();
      this.groupInput.value = "";
      // if (!this.isLoaded) this.chatBoxArea.innerHTML = "";
      // this.isLoaded = false;
      this.data.forEach((ele) => {
        if (ele.groupName == this.currentGroup) {
          ele.data.forEach((item) => {
            this.showText(item);
          });
        }
      });
      document.getElementById("currentGroupName").innerHTML =
        this.currentGroup + "<br><span>" + this.onlineNum + " Online</span>";
      this.createUserList();
    },
    // cancel the illustration of basic DOM element
    basicRender: function () {
      this.background.style.display = "none";
      this.chatBox_input.style.display = "flex";
      this.rightHeader.style.display = "flex";
      document.getElementById("table").style.display = "none";
    },
    // read the data in dialogue defined above and renderChatList after inputing the text each time
    showText: function (item) {
      div_tag = document.createElement("div");
      p_tag = document.createElement("p");
      br_tag = document.createElement("br");
      p_tag.innerHTML = item.content;
      // if (item.type != "history") {
      span_tag = document.createElement("span");
      span_tag.innerHTML = item.timestamp;
      if (item.isReceived) {
        div_tag.setAttribute("class", "message frnd_message");
        p_tag.innerHTML =
          "<a class='userName' href='javascript:void(0)' onclick='test(" +
          item.senderId +
          ")'>~ " +
          item.username +
          "</a><br>" +
          item.content;
      } else {
        div_tag.setAttribute("class", "message my_message");
      }
      p_tag.appendChild(br_tag);
      p_tag.appendChild(span_tag);
  
      div_tag.appendChild(p_tag);
      this.chatBoxArea.appendChild(div_tag);
      this.chatBoxArea.scrollTop = 100000;
    },
    // if the data recvied is history, showed using this function
    showHistory: function (items) {
      console.log("show history");
      let msg = {
        type: "out",
        content: "The next message is the chatting history.",
      };
      this.sendNotification(msg);
      p_tag = document.createElement("p");
      div_tag = document.createElement("div");
      div_tag.setAttribute("class", "message frnd_message");
      console.log(items);
      items.forEach((item) => {
        if (item.type != "private") {
          br_tag = document.createElement("br");
          span_tag = document.createElement("span");
          span_tag.innerHTML = item.timestamp
            ? item.timestamp.slice(0, 10)
            : "someday before";
          p_tag.innerHTML =
            p_tag.innerHTML +
            "<a class='userName' href='javascript:void(0)' onclick='test(" +
            item.senderId +
            ")'>~ " +
            item.username +
            "</a><br>" +
            item.content;
          p_tag.appendChild(span_tag);
  
          p_tag.appendChild(br_tag);
          p_tag.appendChild(br_tag);
          div_tag.appendChild(p_tag);
        }
      });
      // console.log(123);
      this.chatBoxArea.appendChild(div_tag);
      this.chatBoxArea.scrollTop = 100000;
    },
    // listen and trigger when receive msg
    receiveMsg: function (author_id, data) {
      data = JSON.parse(data);
      console.log(data);
      if (data.type != "history") {
        data.senderId = author_id;
        this.addDataToChatContent(data);
        this.addDataToChatList();
        this.renderLeftSide();
        item = {
          content: data.content,
          timestamp: getTime(),
          username: data.username,
          senderId: author_id,
          isReceived: author_id != this.myUserId,
          type: data.type,
        };
        this.storeData(this.currentGroup, data);
        this.showText(item);
      } else {
        this.showHistory(data.content);
      }
    },
    // save the history on the server
    storeData: function (key, value) {
      // value.type = "history";
      let that = this;
      this.loadData(key).then((history) => {
        console.log(history);
        if (history != undefined) {
          data = JSON.parse(history);
        } else {
          data = {
            content: [],
            type: "history",
          };
        }
        if (data.content.includes) data.content.push(value);
        console.log(data);
        that.server.storeData(key, JSON.stringify(data));
      });
    },
    // get the history on the server
    loadData: async function (key) {
      let promise = new Promise((resolve, reject) => {
        this.server.loadData(key, function (res) {
          resolve(res);
        });
      });
      let result = await promise;
  
      try {
        if (JSON.parse(result).content == undefined) {
          result = {
            type: "history",
            content: JSON.parse(result),
          };
          result = JSON.stringify(result);
        }
        return result;
      } catch (error) {
        console.log(result);
        console.log(error);
        this.sendNotification({
          type: "error",
          content: "Cannot load the history, reload and try later please",
          isNotify: false,
        });
      }
    },
  
    // realize the change of theme color
    handleColorChange: function () {
      color = document.getElementById("color").value;
      res = hexadecimalToRgb(color);
      let g = res[0] * 0.299 + res[1] * 0.587 + res[2] * 0.114;
      g <= 192 ? (fontColor = "white") : (fontColor = "black");
      document.documentElement.style.setProperty("--theme-color", color);
      document.documentElement.style.setProperty("--font-color", fontColor);
    },
    // relize the change of profile image
    handleProfileChange: function (img) {
      document.getElementById("userProfile").src = img;
      document.getElementById("profile").style.display = "none";
      document.getElementById("dropdown-content").style.display = "none";
    },
    // test funciton
    test: function (userid) {
      console.log(userid);
    },
  };
  chat.init();
  