var mychat = {

    window: null,
    LobbyButton: null,
    textarea: null,
    sendbutton: null,
    myspace: null,
    LinkIDtoName: [],
    mydatabase: { type:"history", content:[] },
    NumOnlineUsersByRoom: null,
    OnlineRooms: null,
    UsersInThisRoom: null,
    welcomeButton: null,
    

    init: function()
    {
        this.welcomeButton = document.querySelector("#Start");
        this.window = document.querySelector("#main");
        this.textarea = document.querySelector("textarea");
        this.ConnectButton = document.querySelector(".connectButton");
        this.LobbyButton = document.querySelector(".lobbyButton");
        this.RoomButton = document.querySelector(".roomsButton");
        this.UsersButton = document.querySelector('.usersButton');
        this.sendbutton = document.querySelector('#sendbutton');

        this.ConnectButton.addEventListener("click", this.CreateMyRoom.bind(this, '1'));
        this.LobbyButton.addEventListener("click", this.ShowLobby.bind(this));
        this.RoomButton.addEventListener("click", this.CreateMyRoom.bind(this, '2'));
        this.UsersButton.addEventListener("click", this.DisplayUsers.bind(this));
        this.welcomeButton.addEventListener("click", this.onWelcomeClick.bind(this))
        
        this.textarea.addEventListener("keydown", this.onKeyPressed.bind(this, '3')); // send message on Enter
        this.sendbutton.onclick = this.onKeyPressed.bind(this, '1'); // send message on "send" button click

    },

    onWelcomeClick: function ( event ) 
    {
        var welcome = document.querySelector('#EnterApp');
        welcome.style.display = 'none';
    },
    

    GetStarted: function ( cas )
    {
        return new Promise ( function(resolve, reject) {
        if (cas =='1') {
        mychat.myspace = {
            my_username: null,
            my_room: null,
        };
        }

        if (cas == '1') {
            do { input = prompt("Select username", "");
            mychat.myspace.my_username = input; 
            }
            while (input == null || input == "" || input.trim() == '' );
        }
        
        do { input = prompt("Select room name", "");
        mychat.myspace.my_room = input; 
        }
        while (input == null || input == "" || input.trim() == '' );

        var disp = document.querySelector('.onlineUsersHeader');
        disp.style.display = 'block';

        var changeName = document.querySelectorAll('#roomName'); // need to fix this to change both names (on the left + on top)
            for (var i = 0; i < changeName.length; i++) {
            changeName[i].innerHTML = mychat.myspace.my_room;
            }

        //var user = document.querySelector("#myprofile");
        //user.innerHTML = mychat.myspace.my_username;

        resolve(mychat.myspace);
    }
        );
    },

    Connect: function ( )
    {
        // our server
        this.server = new WebSocket ("ws://localhost:9022/" + this.myspace.my_room);
        //this.server.onopen = this.ShareID.bind(this);
        this.server.onopen = this.ReceiveText.bind(this);
        this.server.onmessage = this.ReceiveText.bind(this);
    },

    ShareID: function ( user_id )
    {
        //if (this.server.loadData)
        //    { this.server.loadData(this.myspace.my_room, this.loadHistory.bind(this)); }
        msg = {
            content: "Welcome to " + this.myspace.my_room + ", " + this.myspace.my_username + ". Your user ID is " + user_id + ".",
            username: "system message",
            type: "sysmsg",
            timestamp: new Date().toTimeString().slice(0,5),
        };
        this.showText (msg, 'joinleft');
        msg = {
            content: "To send a private message to users, start with '@user_ID', eg.: '@1405 @6203 Hello'",
            username: "system message",
            type: "sysmsg",
            timestamp: new Date().toTimeString().slice(0,5),
        };
        this.showText (msg, 'joinleft');
        this.myspace.my_userid = user_id;

        //clients_info = this.server.clients[user_id.toString()];
        //L2N = { ...clients_info, username: this.myspace.my_username};
        //this.LinkIDtoName.push(L2N);
        //console.log(L2N);
        //this.ShowUsersInThisRoom();
        //display effects
        light = document.querySelector(".light");
        light.style.backgroundColor = 'green';
        button = document.querySelector(".connectButton");
        button.innerHTML = 'reset';
    },

    RoomEnter: function ( user_id )
    {
        msg = {
            content: "User " + user_id + " has joined the room.",
            username: "system message",
            type: "sysmsg",
            timestamp: new Date().toTimeString().slice(0,5),
        };
        this.showText (msg, 'joinleft');
        //this.server.getReport(this.LobbyData.bind(this));
    },

    RoomLeave: function (user_id)
    {
        msg = {
            content: "User " + user_id + " has left the room.",
            username: "system message",
            type: "sysmsg",
            timestamp: new Date().toTimeString().slice(0,5),
        };
        this.showText (msg, 'joinleft');
        //this.server.getReport(this.LobbyData.bind(this));
    },

    ConnectionKilled: function()
    {
        msg = {
            content: "Server has shutdown.",
            username: "system message",
            type: "sysmsg",
            timestamp: new Date().toTimeString().slice(0,5),
        };
        this.showText (msg, 'joinleft');
    },

    //ReceiveText: function ( user_id, msg)
    ReceiveText: function ( data )
    {
        if (data.data)
        {
            msg = data.data;
            var obj = JSON.parse( msg );
            console.log(obj);
            //if (obj.user_id)
            //    { obj.user_id = user_id; }
            //obj.userid = user_id;
            if (obj.type == 'login')
                this.ShareID(obj.user_id);
            else if (obj.type == 'leftroom')
                this.RoomLeave(obj.user_id);
            else if (obj.type == 'joinedroom')
                this.RoomEnter(obj.user_id);
            else if (obj.type == 'text')
                this.showText(obj, 'received');
            if (obj.type !== 'private') {this.mydatabase.content.push(obj);}
        }

        //clients_info = this.server.clients[user_id.toString()];
        //L2N = { ...clients_info, username: obj.username};
        //this.LinkIDtoName.push(L2N);
        //console.log(this.LinkIDtoName); 

        //clientsArray = Object.keys(this.server.clients);
        //if (this.myspace.my_userid == Math.min(...clientsArray))
        //{
        //    this.server.storeData(this.myspace.my_room, JSON.stringify(this.mydatabase.content), this.printInfo.bind(this));
        //}
        //this.server.getReport(this.LobbyData.bind(this));
        ////this.ShowUsersInThisRoom;
    },

    LobbyData: function ( data )

    {
            console.log(data);
            onlinerooms = data['rooms'];
            this.OnlineRooms = Object.getOwnPropertyNames(onlinerooms);
            this.NumOnlineUsersByRoom = [];
            for(var o in onlinerooms) {
            this.NumOnlineUsersByRoom.push(onlinerooms[o]);
            }
            
            arr0 = data['clients'];
            switchToarr = [];

            for (var i = 0; i<Object.keys(arr0).length; i++)
            {
                switchToarr.push(arr0[i]);
            };
            
            function findUsersFromLobbyData( lobbydata, query ) {
                filterArray =[];
                filterData = lobbydata.filter(item => {
                if (item['room'] === query) {
                    filterArray.push(item['id']);
                    return filterArray;
                }
                return false;
                });
                return filterArray;
            }
            
            this.UsersInThisRoom = findUsersFromLobbyData( switchToarr, this.myspace.my_room );
            console.log(this.UsersInThisRoom);
            this.ShowUsersInThisRoom();
            return this.UsersInThisRoom        
    },

    printInfo: function (data)
    {
        console.log(data)
    },

    loadHistory: function (data)
    {
        try {
            var obj = JSON.parse( data ); }
        catch (error) {
            console.log("No history available to load.");
            //console.error(error);
        }

        for (const property in obj)
        {
            historyArray = [];
            var style;
            switch ( obj[property].type ){
                case "sysmsg":
                    style =   'joinleft';
                    break;
                case "text":
                    style = 'received';
                    break;                 
            }
            this.showText(obj[property], style );
            historyArray.push(property);
        }
        //return historyArray;
    },

    showText: function ( msg, style )
    {
        var elem = document.createElement('div');
        elem.className = style;
        var div = document.createElement('div');
        div.className = 'username';
        time = msg.timestamp;
        div.innerHTML = msg.username + ' ' + time;
        if (msg.type === "sysmsg") {
        div.style.display = 'none';}
        elem.appendChild(div);
        let div2 = document.createElement('div');
        div2.className = 'publishedmsg';
        div2.classList.add(msg.type); // will use type for now to assess the second class (if available) of the div
        div2.innerHTML = msg.content;
        elem.appendChild(div2);
        if(div2.innerHTML.trim() == '')
            { return; }
            else {
            var conversation = document.querySelector('#conversation');
            conversation.appendChild(elem);
            const lastdiv = document.querySelector('#conversation > div:last-of-type');
            lastdiv.scrollIntoView();
            //conversation.scrollTop = 10000;
        }
        
    },
    
    onKeyPressed: function ( cas, event )
    {   
        if (event.key === 'Enter' && event.shiftKey) 
                {
                return;
                }
        else if (event.key === 'Enter' || cas == '1') 
                {
                event.preventDefault();
                clients_info = this.server.clients;
                input = this.textarea.value;
                if (input.startsWith("@") ) {
                    switchType = "private";
                    var sendToUser = new Array();
                    const words = input.split('@');
                    for (var i = 1; i < words.length; i++) {
                        sendToUser.push(words[i].substring(0, input.indexOf(' ')-1));
                        }
                    }
                else {
                    switchType = "text";
                    sendToUser = "";
                    }
                msg = {
                type: switchType,
                content: this.textarea.value,
                username: this.myspace.my_username,
                timestamp: new Date().toTimeString().slice(0,5),
                };
                if (msg.type === "private") {
                    if (sendToUser.every(sendToUser => clients_info.hasOwnProperty(sendToUser)))
                        { 
                        s_msg = JSON.stringify(msg);
                        this.server.send(s_msg, sendToUser);
                        //this.mydatabase.content.push(msg); 
                        this.showText(msg, 'sent'); 

                        clientsArray = Object.keys(this.server.clients);
                        if (this.myspace.my_userid == Math.min(...clientsArray))
                            {
                            this.server.storeData(this.myspace.my_room, JSON.stringify(this.mydatabase.content), this.printInfo.bind(this));
                            }
                            } 
                        else {
                            errorNoUsermsg = {
                            content: "Message was not sent because user(s) " + sendToUser + " is/are not in the room.",
                            username: "system message",
                            type: "sysmsg"
                            };
                            this.showText (errorNoUsermsg, 'joinleft');
                            this.server.feedback = false;
                           }
                }
                        
                else {
                    s_msg = JSON.stringify(msg);
                    this.server.send(s_msg);
                    this.mydatabase.content.push(msg);
                    this.showText(msg, 'sent');

                    //catching error
                    if (this.server.storeData) {
                        clientsArray = Object.keys(this.server.clients);
                        if (this.myspace.my_userid == Math.min(...clientsArray))
                            {
                            this.server.storeData(this.myspace.my_room, JSON.stringify(this.mydatabase.content), this.printInfo.bind(this));
                            }
                    }
                }

                this.textarea.value = "";
                }
    },

    CreateMyRoom: function ( cas , event )
    {         
        // Log user information and connect to server
        mychat.GetStarted(cas).then(mychat.Connect());

        //display relevant elements
        var lobbylist = document.querySelector('.histlist.lobby');
        lobbylist.style.display = "none";

        const histlist = document.querySelector('.histlist');
        histlist.firstChild.remove()
        
        var elem = document.createElement('div');
        elem.className = "hpreview privateconv";
        var icon = document.createElement('div');
        icon.className = "lefticons";
        elem.appendChild(icon);
        var img = document.createElement('img');
        img.className = "profilepic";
        icon.appendChild(img);
        var prev = document.createElement('div');
        prev.className = "previewbox";
        elem.appendChild(prev);
        var roomname = document.createElement('p');
        roomname.setAttribute("id", "roomName");
        roomname.className = ".contactname";
        roomname.innerHTML = mychat.myspace.my_room;
        prev.appendChild(roomname);
        var p = document.createElement('p');
        p.className = 'messageprev';
        p.innerHTML = ('Last message preview test');
        prev.appendChild(p);
        var header = document.querySelector('.onlineUsersHeader');
        histlist.prepend(elem, header);

        const parent = document.querySelector("#conversation")
                while (parent.firstChild) {
                    parent.firstChild.remove()}
        

    },

    ShowUsersInThisRoom: function ( event )
    {
        //mychat.server.getReport(mychat.LobbyData.bind(mychat));
            const parent = document.querySelector(".listOnlineUsers")
            while (parent.firstChild) {
                parent.firstChild.remove()
            }

            for (var i = 0; i < mychat.UsersInThisRoom.length; i++)
            {   
                thisusername = null;
                thisuserID = mychat.UsersInThisRoom[i];
                arr0 = mychat.LinkIDtoName;
                for (var j = 0 ; j<arr0.length; j++)
                {if (arr0[j]['id'] == thisuserID) 
                    {thisusername = arr0[j]['username']}
                };
                
                var elem = document.createElement('div');
                elem.className = "onlineUsers";
                var p = document.createElement('p');
                p.innerHTML = "User_ID: " + thisuserID + "<br> Username: " + thisusername;
                elem.appendChild(p);
                parent.appendChild(elem);
            };
        
    },

    ShowLobby: function ( event )
    {
        
        //mychat.server.getReport(mychat.LobbyData.bind(mychat));

        const parent = document.querySelector(".histlist.lobby")
        while (parent.firstChild) {
            parent.firstChild.remove()
        }

        for (var i = 1; i < this.OnlineRooms.length+1; i++)
        {   
            var thisroom = this.OnlineRooms[i-1];
            var itsusers = this.NumOnlineUsersByRoom[i-1];
            var elem = document.createElement('div');
            elem.className = "hpreview privateconv";
            var div = document.createElement('div');
            div.className = "previewbox";
            elem.appendChild(div);
            var p = document.createElement('p');
            p.className = "contactname";
            p.setAttribute("id", "roomName");
            p.innerHTML = thisroom;
            div.appendChild(p);
            var p2 = document.createElement('p');
            p2.className = "messageprev";
            p2.innerHTML = "Online users: " + itsusers;
            div.appendChild(p2);
            var histlist = document.querySelector('.histlist.lobby');
            histlist.appendChild(elem);
        }
        
        var lobbylist = document.querySelector('.histlist.lobby');
        lobbylist.style.display = "block";
    },

    DisplayUsers: function ( event )
    {
        var lobbylist = document.querySelector('.histlist.lobby');
        lobbylist.style.display = "none";
    }

};