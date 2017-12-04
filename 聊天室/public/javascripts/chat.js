// 客户端的js
var Chat = function(socket) {
  this.socket = socket;
}

// 处理消息发送
Chat.prototype.sendMessage = function(room, text){
  var message = {
    room: room,
    text: text
  }
  this.socket.emit('message', message);
};

// 处理房间变更
Chat.prototype.changeRoom = function(room){
  this.socket.emit('join', {newRoom: room});
};

// 处理聊天命令（join命令、nick命令）
Chat.prototype.processCommand = function(command){
  var words = command.split(' ');
  var command = words[0].substring(1, words[0].length).toLowerCase();  // 从第一个单词开始解析命令
  var message = false;

  switch(command) {
    case 'join':
      words.shift(); // shift() 方法用于把数组的第一个元素从其中删除，并返回第一个元素的值。
      var room = words.join(' ');
      this.changeRoom(room);
      break;
    case 'nick':
      words.shift();
      var name = words.join(' ');
      this.socket.emit('nameAttempt', name);
      break;
    default:
      message = 'Unrecognized command.';
      break;
  }

  return message;
}; 

