let connection;

$(function () {
  "use strict";
  // for better performance - to avoid searching in DOM
  let content = $('#content');
  let input = $('#input');
  let status = $('#status');

  // if browser doesn't support WebSocket, just show
  // some notification and exit
  if (!window.WebSocket) {
    alert('Sorry, but your browser doesn\'t support WebSocket.');
    return;
  }

  // open connection
  connection = new WebSocket('ws://127.0.0.1:1337'); // Localhost

  connection.onopen = function () {
    // first we want users to enter their names
    getName();
  };

  connection.onerror = function (error) {
    // just in there were some problems with connection...
    alert('Sorry, but there\'s some problem with your connection or the server is down.');
  };

  connection.onmessage = function (message) {
    let json;
    try {
      json = JSON.parse(message.data);
    } catch (e) {
      console.log('Invalid JSON: ', message.data);
      return;
    }

    if (json.type === 'history') { // entire message history
      // insert every single message to the chat window
      for (let i=0; i < json.data.length; i++) {
        addMessage(json.data[i].author, json.data[i].text);
      }
    } else if (json.type === 'message') { // it's a single message
      // let the user write another message
      addMessage(json.data.author, json.data.text);
    } else if(json.type === "draw") {
      console.log("recieved draw");
      console.log(json.data);
      if (json.data.type === "brush") {
        strokeWeight(json.data.strokeWeight);
        stroke(json.data.color);
        line(json.data.mouseX, json.data.mouseY, json.data.pmouseX, json.data.pmouseY);
      } else if (json.data.type == "bucket") {
        brushColour = json.data.color;
        floodFill(json.data.mouseX, json.data.mouseY);
      } else if (json.data.type === "clear") {
          clear();
          background(255);
      }
    } else if(json.type === "drawHistory") {
      console.log("recieved drawHistory");
      for (let i = 0; i < json.data.length; i++) {
        if (json.data[i].type === "brush") {
          strokeWeight(json.data[i].strokeWeight);
          stroke(json.data[i].color);
          line(json.data[i].mouseX, json.data[i].mouseY, json.data[i].pmouseX, json.data[i].pmouseY);
        } else if (json.data[i].type === "bucket") {
          brushColour = json.data[i].color;
          floodFill(json.data[i].mouseX, json.data[i].mouseY);
        }
      }
    } else if(json.type === "players"){
      let playerListElement = $("#players");
      for (let i = 0; i < json.data.length; i++) {
        console.log(json.data[i]);
        playerListElement.append("<div id='player_"+json.data[i].index+"'>"+json.data[i].name+"</div>")
      }
    } else if(json.type === "playerJoined"){
      console.log(json.data);
      let playerListElement = $("#players");
      playerListElement.append("<div id='player_"+json.data.index+"'>"+json.data.name+"</div>")
    } else if(json.type === "playerLeft"){
      console.log(json.data);
      $("#player_"+json.data.index).remove();
    } else if(json.type === "index"){
      console.log(json);
      $("#player_"+json.index).css("color","red");
    } else {
      console.log('Excuse me what the fuck?: ', json);
    }
  };

  input.keydown(function(e) {
    if (e.keyCode === 13) {
      let msg = $(this).val();
      if (!msg) {
        return;
      }
      let json = JSON.stringify({ type:'message', data: msg });
      // send the message as an ordinary text
      connection.send(json);
      $(this).val('');
    }
  });


// Add message to the chat window
  function addMessage(author, message) {
    content.append('<p><span>' + author + '</span>: ' + message + '</p>');

    let messageBody = document.querySelector('#content');
    messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
  }
});
