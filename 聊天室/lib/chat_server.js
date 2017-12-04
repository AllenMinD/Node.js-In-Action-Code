// chat_server.js

var socketio = require('socket.io');
var io;
var guestNumber = 1;
var nickNames = {};
var namesUsed = [];
var currentRoom = {};

// 定义聊天服务函数listen，并把这个函数暴露（exports）出去，server.js会调用这个函数
exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket) {
    guestNumber = assignGuestName(socket, guestNumber, nickNames, namesUsed);  // 在用户连接上来时，给与一个访客名
    joinRoom(socket, 'Lobby');  // 在用户连接上来时把他放入聊天室Lobby里面
    handleMessageBroadcasting(socket, nickNames);  // 处理用户的消息
    handleNameChangeAttempts(socket, nickNames, namesUsed);  // 处理更名
    handleRoomJoining(socket); // 处理聊天室的创建和变更

    socket.on('rooms', function() {
      socket.emit('rooms', io.sockets.manager.rooms);
    });

    handleClientDisconnection(socket, nickNames, namesUsed); // 定义用户断开连接后的清除逻辑
  });
}

// 在用户连接上来时，给与一个访客名
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
  var name = 'Guest' + guestNumber;  // 生成新名字：Guest + 编号
  nickNames[socket.id] =  name;  // 把用户昵称和客户端连接ID关联上
  socket.emit('nameResult', {  // 给该socket的客户端发送消息（让用户知道他们自己的昵称）
    success: true,
    name: name
  });
  namesUsed.push(name);  // 收录已被使用的昵称
  return guestNumber + 1;
}

// 在用户连接上来时把他放入聊天室Lobby里面
function joinRoom(socket, room) {
  socket.join(room);  // 让用户进入房间
  currentRoom[socket.id] = room; // 记录用户的当前房间
  socket.emit('joinResult', {room: room});  // 给该socket的客户端发送消息（让用户知道他们进入了新的房间）
  socket.broadcast.to(room).emit('message', {  // 给除了自己以外的客户端广播消息(让房间里的其他用户知道有新用户进入了房间)
    text: nickNames[socket.id] + ' has joined ' + room + ' .'
  });

  // 确定哪些用户在这个房间里
  var usersInRoom = io.sockets.clients(room);
  if (usersInRoom.length > 1) { // 汇总（统计）在这个房间里的人
    var usersInRoomSummary = 'Users currently in ' + room + ': ';
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if (userSocketId != socket.id) {
        if (index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += '.';
    socket.emit('message', {text: usersInRoomSummary}); //给该socket的客户端发送消息（让用户知道自己所在房间有哪些人）
  }
}

// 处理用户的消息（发送、接收聊天消息）
function handleMessageBroadcasting(socket) {
  socket.on('message', function(message) {  // 添加"message"事件的监听器（监听客户端发送的信息）
    socket.broadcast.to(message.room).emit('message', {  //给除了自己以外的客户端广播消息（在聊天室显示自己发的消息给其他人看）
      text: nickNames[socket.id] + ': ' + message.text
    });
  });
}

// 处理更名
function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt', function(name) {  // 添加"nameAttempt"事件的监听器（监听客户端发送的信息）
    if (name.indexOf('Guest') == 0) {  // 昵称不能用Guest开头
      socket.emit('nameResult', {
        success: false,
        message: 'Names cannot begin with "Guest". '
      });
    } else {
      if (namesUsed.indexOf(name) == -1) {  // 如果该昵称还没被注册的话，就用这个昵称注册
        // 删掉之前用过的昵称
        var previousName = nickNames[socket.id];
        var previousNmaeIndex = namesUsed.indexOf(previousName);
        // 使用新昵称
        namesUsed.push(name);
        nickNames[socket.id] = name;
        delete namesUsed[previousNmaeIndex]; 

        // 给该socket的客户端发送消息（让他知道他的昵称已经成功修改)
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        // 给除了自己以外的客户端广播消息（告诉其他用户有人修改了昵称）
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + ' is now known as ' + name + '.'
        });
      } else {  // 如果想要该的那个名字已经被占用了
        // 给该socket的客户端发送消息（让他知道他想要修改的昵称已经被占用
        socket.emit('nameResult', {
          success: false,
          message: 'That name is already in use.'
        });
      }
    }
  });
}


// 处理聊天室的创建和变更
function handleRoomJoining(socket) {
  // 添加"join"事件的监听器（监听客户端发送的信息）
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);  // 踢出分组
    joinRoom(socket, room.newRoom);
  });
}

// 定义用户断开连接后的清除逻辑
function handleClientDisconnection(socket) {
  // 添加"disconnect"事件的监听器（监听客户端发送的信息）
  socket.on('disconnect', function(){
    // 删除该用户昵称
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
}