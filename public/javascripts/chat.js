
var socket;
var myUserName;
var myColor;
 
function enableMsgInput(enable) {
  $('input#msg').prop('disabled', !enable);
}
 
function enableUsernameField(enable) {
  $('input#userName').prop('disabled', !enable);
}
 
function appendNewMessage(msg) {
  var html;
  if (msg.target == "All") {
    html = "<span class='allMsg' style='color:" + msg.color + "'><b>" + msg.source + "</b>: " + msg.message + "</span><br/>"
  } else {
    // It is a private message to me
    html = "<span class='privMsg' style='color:" + msg.color + "'><b>"+ msg.source + " (P)</b>: " + msg.message + "</span><br/>"
  }
  $('#msgWindow').append(html);
  $('#msgWindow').scrollTop($('#msgWindow')[0].scrollHeight);
  $.titleAlert("New message from " + msg.source + "!", {
    requireBlur:true,
    stopOnFocus:true,
    interval:600
});
}
 
function appendNewUser(uName, notify) {
  if (myUserName !== uName) {
  	$('select#users').append($('<option></option>').val(uName).html(uName));
    updateUsrWindow();
  }
  if (notify && (myUserName !== uName) && (myUserName !== 'All')) {
    $('#msgWindow').append("<span class='adminMsg'>> " + uName + " just joined...<br/>");
	$('#msgWindow').scrollTop($('#msgWindow')[0].scrollHeight);
  }
}
 
function handleUserLeft(msg) {
    $("select#users option[value='" + msg.userName + "']").remove();
    updateUsrWindow();
    if (!jQuery.isEmptyObject(msg)) {
      $('#msgWindow').append("<span class='adminMsg'>> " + msg.userName + " just left...<br/>");
      $('#msgWindow').scrollTop($('#msgWindow')[0].scrollHeight);
    }
}

console.log(window.location.origin);
socket = io.connect(window.location.origin);
 
function setUsername() {
    myUserName = $('input#userName').val();
    if (myUserName.length > 0 && myUserName != 'All') {
      socket.emit('set username', $('input#userName').val(), function(data) { console.log('emit set username', data); });
      console.log('Set user name as ' + $('input#userName').val());
    }
}
 
function sendMessage() {
    var trgtUser = $('select#users').val();
    socket.emit('message', 
                {
                  "inferSrcUser": true,
                  "source": "",
                  "message": $('input#msg').val(),
                  "target": trgtUser,
                  "color": myColor
                });
    $('input#msg').val("");
}
 
function setCurrentUsers(usersStr) {
    $('select#users >option').remove()
    appendNewUser('All', false)
    JSON.parse(usersStr).forEach(function(name) {
        appendNewUser(name, false);
    });
    $('select#users').val('All').attr('selected', true);
}
 
$(function() {
  enableMsgInput(false);
 
  socket.on('userJoined', function(msg) {
    appendNewUser(msg.userName, true);
  });
   
  socket.on('userLeft', function(msg) {
    handleUserLeft(msg);
  });
 
  socket.on('message', function(msg) {
    appendNewMessage(msg);
  });
 
  socket.on('welcome', function(msg) {
    myColor = msg.color;
    setCurrentUsers(msg.currentUsers)
    enableMsgInput(true);
    enableUsernameField(false);
    $('#hitEnter').hide("slow");
    notify('Welcome ' + msg.userName + '!', 'You can begin chatting...');
  });
 
  socket.on('error', function(msg) {
      if (msg.userNameInUse) {
          notify('Username already in use', 'Try another name...');
      }
  });
   
  $('input#userName').change(setUsername);
  $('input#userName').keypress(function(e) {
      if (e.keyCode == 13) {
          setUsername();
          e.stopPropagation();
          e.stopped = true;
          e.preventDefault();
      }
  });
   
  $('input#msg').keypress(function(e) {
      if (e.keyCode == 13) {
          sendMessage();
          e.stopPropagation();
          e.stopped = true;
          e.preventDefault();
      }
  });
});

function notify (title, text) {
    $('span#notificationTitle').html(title);
    $('span#notificationText').html(text);
    $('#notification').modal('show');
}

function updateUsrWindow() {
  
  var lis = $('select#users option');
  var vals = [];

  // Populate the array
  for(var i = 1, l = lis.length; i < l; i++)
    vals.push(lis[i].innerHTML);

  console.log(vals);

  // Sort it
  vals.sort();

  console.log(vals);

  $('#usrWindow').empty();

  for(var i = 0, l = lis.length - 1; i < l; i++) {
    $('#usrWindow').append("<img src='images/27.png'/> <span class='allMsg'>" + vals[i] + "</span><br/>");
  }
}