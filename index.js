var fs = require("fs");
var express = require("express");
var http = require("http");
var path = require("path");
var socket = require("socket.io");

var app = express();
var server = http.Server(app);
var io = socket(server);

var users = [];
var sockets = [];

var messageCount = 0;

app.set('port', 8080);
app.use('/static', express.static(__dirname + '/static'));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
}); //Starts server

server.listen(8080, () => {
  console.log("Chat online");
});

io.on("connection", socket => {
  socket.on("disconnect", () => {
    var i = sockets.indexOf(socket);
    let leftUser = users.splice(i, 1);
    sockets.splice(i, 1);
    io.sockets.emit("users", users);
    io.sockets.emit("message", {
      user: "<font color=\"red\">The Chat Bot</font>",
      message: "User " + leftUser + " has foolishly left The Chat."
    })
  });
  
  //When user logs in
  socket.on("newUser", username => {
    console.log("new user");
    if(username == null){return;}

    users.push(username);

    sockets[users.indexOf(username)] = socket;

    io.sockets.emit("message", {
      user: "The Chat Bot",
      message: "User " + username + " has joined The Chat"
    });
    io.sockets.emit("users", users);
  });

  //Message request sent to server
  socket.on("newMessage", data => { 
    let d = new Date();
    let historyNugget = JSON.stringify({
      "user": data.user,
      "message": data.message,
      "date": (d.getMonth()+1) + "/" + d.getDate() + "/" + d.getFullYear(),
      "time": d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
    }) + "\n";

    fs.appendFile("history.txt", historyNugget, () => {return;});
    
    if(data.user == null){return;}
    messageCount++;
    io.sockets.emit("message", data);
  });

  //Command request sent to server
  socket.on("commandRequest", cmd => {
    io.sockets.emit("command", cmd);
  });

  socket.on("uChangeRequest", uChange => {
    var uI = users.indexOf(uChange[0]);
    users[uI] = uChange[1];
    io.sockets.emit("message", {
      user: "<font color=\"red\">The Chat Bot</font>",
      message: "User " + uChange[0] + " has changed their name to " + uChange[1]
    });
    io.sockets.emit("users", users);
  });
});