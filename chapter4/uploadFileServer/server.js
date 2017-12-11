/*
用formidable处理上传的文件：

formidable模块用来处理文件上传
1）通过npm安装formidable（在项目根目录输入npm install formidable）
2）创建一个IncomingForm实例
3）调用form.parse()解释HTTP请求对象
4）监听表单事件field、file和end（接收完输入域后也发出field事件、文件上传完后会发出file事件。）
5）使用formidable的高层API
*/

var http = require('http');
var formidable = require('formidable');

var server = http.createServer(function(req, res) {
  switch (req.method) {
    case 'GET':
      show(req, res);
      break;
    case 'POST':
      upload(req, res);
      break;
  }
});

server.listen(3000, function() {
  console.log('server on port 3000');
});

function show(req, res) {
  var html = ''
           + '<form method="post" action="/" enctype="multipart/form-data">'
           + '<p><input type="text" name="name" /></p>'
           + '<p><input type="file" name="file" /></p>'
           + '<p><input type="submit" value="Upload" /></p>'
           + '</form>';
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}


// 上传后的文件默认放在C:\Users\AllenMinD\AppData\Local\Temp
// 在path中可以看到
function upload(req, res) {
  if (!isFormData(req)) {
    res.statusCode = 400;
    res.end('Bad Request: expecting multipart/form-data');
    return;
  }

  var form = new formidable.IncomingForm();  // 创建一个IncomingForm实例

  // 监听‘field’事件、‘file’事件、‘end’事件

  // 接收完输入域后也发出field事件
  form.on('field', function(field, value) {
    console.log(field);
    console.log(value);
  });

  // 文件上传完后会发出file事件。
  // file对象会提供所上传文件的信息:
  //（文件大小、文件上传后所存放的路径【form.uploadDir目录中的路径】、
  // 原始的主档名、MIME类型等）
  form.on('file', function(name, file) {
    console.log(name);
    console.log(file);  // 显示所上传文件的信息
  });

  form.on('end', function() {
    res.end('upload complete!')
  });

  form.parse(req);  // 解析HTTP请求对象
}

function isFormData(req) {
  var type = req.headers['content-type'] || '';
  return 0 == type.indexOf('multipart/form-data');
}