// 服务器

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};

// 创建http服务器
var server = http.createServer(function(request, response) {
  var filePath = false;

  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    filePath = 'public' + request.url;
  }
  var absPath = './' + filePath;
  serveStatic(response, cache, absPath);  // 查找文件
});

// 启动HTTP服务器
server.listen(3000, function() {
  console.log("Server listening on port 3000.");
});


// 加载自定义的Node模块，这个模块提供的逻辑是用来处理基于Socket.IO的服务端聊天功能
var chatServer = require('./lib/chat_server');
// 启动Socket.IO服务器，并给他提供一个已经定义好的HTTP服务器，这样他就能跟HTTP服务器共享同一个TCP/IP端口
chatServer.listen(server);


// 当所请求的文件不存在时，发送404错误
function send404(response) {
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.write('Error 404: resource not found. ');
  response.end();
}

// 提供文件数据服务(从本地找到要发送的文件，并随着响应发送出去)
function sendFile(response, filePath, fileContents) {
  response.writeHead(
    200,
    {"content-type": mime.lookup(path.basename(filePath))}
  );
  response.end(fileContents);
}

// 先尝试从内存（缓存）中读取数据，内存没有的话，再从硬盘读取，并加到内存中。硬盘都没有的话就返回404
function serveStatic(response, cache, absPath) {
  if (cache[absPath]) {  // 先尝试从内存(缓存）中读取所需数据
    sendFile(response, absPath, cache[absPath]); // 若能读取到，就发送出去
  } else {  // 尝试从硬盘中读取所需数据
    fs.exists(absPath, function(exists) {
      if (exists) {  // 硬盘中存在所需数据
        fs.readFile(absPath, function(err, data){  // 从硬盘中读取数据
          if (err) {  // 如果读取过程中发生了错误
            send404(response);
          } else {  // 成功从硬盘中读取数据
            cache[absPath] = data;  // 把数据放进内存（缓存）中，方便下一次需要的时候用
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}