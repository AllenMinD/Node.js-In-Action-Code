/*
RESTful服务:
4个HTTP谓词会覆盖一个代办事项清单的操作任务：
POST - 向代办事项清单中添加事项 
GET - 显示当前事项列表，或者显示某一事项的详情
DELETE - 从代办事项清单中移除事项
PUT - 修改已有事项

cURL是一个强大的命令行HTTP客户端，可以用来向目标服务器发送请求
git Bash里面就集成了cURL，在git Bash中运行下面命令即可发起相应请求：
- POST请求：curl -X POST -d '...' http://localhost:3000 （或者 curl -d '...' http://localhost:3000）
- GET请求：curl -X GET http://localhost:3000 （或者curl http://localhost:3000）
- DELETE请求：curl -X DELETE http://localhost:3000/索引号
- PUT请求：curl -X PUT -d "..." http://localhost:3000/索引号

常用curl命令的参数：
-h 查看请求参数的含义 
-v 显示请求的信息 
-X 选项指定其它协议
-d 用来输入参数
*/

var http = require('http');
var url = require('url');

var items = [];

var server = http.createServer(function(req, res) {
  switch (req.method) {
    // curl -X POST -d '...' http://localhost:3000 （或者 curl -d '...' http://localhost:3000）即可发送post请求
    case 'POST':
      var item = '';
      req.setEncoding('utf-8');
      req.on('data', function(chunk) {  // 只要读入了新的数据块，就触发data事件
        item += chunk;
      });
      req.on('end', function() {  // 数据全部读完之后会触发end事件
        items.push(item);
        res.end('\nOjbK\n');
      });
      break;
    // curl -X GET http://localhost:3000 （或者curl http://localhost:3000）即可发送get请求
    case 'GET':
      items.forEach(function(item, i) {
        res.write('\n' + i + ')' + item);
      });
      res.end();
      break;
    // curl -X DELETE http://localhost:3000/索引号 即可发送delete请求，删掉相应索引的item
    case 'DELETE':
      var path = url.parse(req.url).pathname;
      var i = parseInt(path.slice(1), 10);  // 代办事项前面的编号
      if (isNaN(i)) {
        res.statusCode = 400;
        res.end('\nInvalid item id');
      } else if (!items[i]) {
        res.statusCode = 404;
        res.end('\nItem not found');
      } else {
        items.splice(i, 1);
        res.end('\nOjbK, DELETE already\n');
      }
      break;
    // curl -X PUT -d "..." http://localhost:3000/索引号
    case 'PUT':
      var path = url.parse(req.url).pathname;
      var i = parseInt(path.slice(1), 10);  // 代办事项前面的编号
      if (isNaN(i)) {  
        res.statusCode = 400;
        res.end('\nInvalid item id');
      } else if (!items[i]) {   // 如果编号不存在，则在数组items的最后插入这个新的代办事项
        var item1 = '';
        req.setEncoding('utf-8');
        req.on('data', function(chunk) {
          item1 += chunk;
        });
        req.on('end', function() {
          items.push(item1);
          res.end('\nThe item has PUT in the end of items\n');
        });        
      } else {  // 如果编号存在，则用新的代办事项来代替该编号的待办事项
        var item2 = '';
        req.setEncoding('utf-8');
        req.on('data', function(chunk) {
          item2 += chunk;
        });
        req.on('end', function() {        
          items[i] = item2;
          res.end('\nOjbK, PUT already\n');
        });
      }   
      break;     
  }
});

server.listen(3000, function() {
  console.log("server on port 3000");
});