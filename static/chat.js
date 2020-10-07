var username = prompt("What's your username?");

var clientMessageCount = 0;

var woahOptions = ["A retro chat room for all your chat room needs!", "Better than Myspace!", "Woah super epic", "No viruses!", "Fun with friends and family!", "Also functions as HTML interpreter!", "Censors swears for family-friendly experience! (To be implemented soon)", "Anarchy!", "Shh, this is a secret message you'll rarely get :)"];

var serverCommands = ["alert", "disconnect", "color"];

var texties = Math.floor(Math.random() * (woahOptions.length-1));


$("#woah-p").text(woahOptions[texties]);

var socket = io();

socket.emit("newUser", username);

socket.on("message", data => {
  onMessage(data);
});

socket.on("users", data => {
  $("#online-box").text("");
  for(var u in data){
    $("#online-box").append( data[u] + "<br/>");
  }
});

socket.on("disconnect", () => {
  alert("You were disconnected, probably for development reasons.  Please wait while we fix/update the chat.");
});

socket.on("command", cmd => {
  command(cmd);
});

$("#button-in").click(() => {
  message($("#message-in").val());
  $("#message-in").val("");
});

window.addEventListener("keydown", event => {
  if(event.code == "Enter"){
    message( $("#message-in").val());
    $("#message-in").val("");
  }
  // Console Toggle
  else if (event.code == "Backquote"){
    var rawText = prompt("Type a command");
    var editedText = rawText.split(" ");
    var command = editedText.shift();
    var args = editedText;
    onCommand([command, args]);
  }
});

function message(msg){
  if(msg == ""){return;}
  var dat = {
    user: username,
    message: msg
  };
  socket.emit("newMessage", dat);
}


function onMessage(data){
  $("title").text("Message from: " + data.user);
  let text = "<br/><strong>" + data.user + ":</strong> " + data.message;
  $("#chat-box").append(text);
  clientMessageCount++;
  if(clientMessageCount > 9){
    window.scrollBy(0, 18);
  }
}

function onCommand(cmd)
{
  var command = cmd[0];
  var args = cmd[1];
  if(serverCommands.includes(command)){
    socket.emit("commandRequest", cmd);
    return;
  }
  switch(command){
    case "username":
      let newU = arrToString(args);
      socket.emit("uChangeRequest", [username, newU]);
      username = newU;
      break;
    case "message":
      let msg = arrToString(args);
      message(msg);
    default:
      alert(command + " is not a command.");
      break;
  }
}

function command(cmd){
  var command = cmd[0];
  var args = cmd[1];
  switch(command){
    case "disconnect":
      socket.disconnect();
      break;
    case "color":
      $("*").css("color", args[0]);
      break;
    case "alert":
      alert(arrToString(args));
      break;
    default:
      alert("an error occured while trying to execute a server wide command");
      break;
  }
}

function arrToString(array){
  let ret = "";
  for(var a in array){
    ret = ret.concat(array[a], " ");
  }
  return ret;
}