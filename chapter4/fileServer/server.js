/*
静态文件服务：
要点：
1. 
构造绝对路径：
  var root = __dirname;
  var url = parse(req.url);
  var path = join(root, url.pathname);

2. 
fs.stat()用于得到文件的相关信息（例如文件大小stat.size，或者错误码err.code。如果文件不存在，err.code='ENOENT'）
fs.stat(文件的路径path, function(err, stat) {
  // 如果有错误，err就会有内容
  // 如果没错误，stat就会存有文件的信息。
});

3. 
Node中的【管道(pipe)】用来读取一个文件（ReadableStream），并把其内容写到另一个文件中（WritableStream）

其中我们常见的HTTP请求（req）对象就是一个ReadableStream，
HTTP响应（res）对象就是一个WritableStream。

另外，
我们也可以自己定义ReadableStream和WritableStream：
var readStream = fs.createReadStream('文件的路径');
var writeSteam = fs.createWriteStream('文件的路径');

把ReadableStream的数据 “流” 到 WritableStream中：
readStream.pipe(writeStream);
*/

var http = require('http');
var fs = require('fs');
var parse = require('url').parse;
var join = require('path').join;

var server = http.createServer(function(req, res) {
  // 构造绝对路径
  var root = __dirname;
  var url = parse(req.url);
  var path = join(root, url.pathname);

  fs.stat(path, function(err, stat) {
    if (err) {  // 如果读取文件时发生了错误
      if ('ENOENT' == err.code) { // 如果文件不存在，则err.code = 'ENOENT'
        res.statusCode = 404;
        res.end('Not Found');
      } else {  // 如果是其他错误，就返回500
        res.statusCode = 500;
        res.end('Interval Server Error');
      }
    } else {  // 如果读取文件成功，则把文件的数据写入到响应中
      res.setHeader('Conten-Length', stat.size);
      var stream = fs.createReadStream(path);  // 创建ReadStream
      stream.pipe(res);  // res相当于WriteStream。这里相当于把文件的数据写入到响应中
      stream.on('error', function(err) {  // 如果写入过程发生了错误
        res.stateCode = 500;
        res.end('Interval Server Error');
      });
    }
  });
});

server.listen(3000, function() {
  console.log('server now on port 3000');
});

// 服务启动后，
// 在导航栏输入http://localhost:3000/someText.txt（或者http://localhost:3000/index.html），即可返回文件内容