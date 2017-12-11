/*
接收用户从HTML表单输入的数据:
*/

var http = require('http');
var qs = require('querystring');
items = [];

var server = http.createServer(function(req, res) {
  if (req.url == '/') {
    switch (req.method) {
      case 'GET':
        show(res);
        break;
      case 'POST':
        add(req, res);
        break;
      default:
        badRequest(res);
    }
  } else {
    notFound(res);
  }
});

server.listen(3000, function() {
  console.log("server on port 3000");
});

// show()函数用来创建并显示html
function show(res) {
  // 用字符串拼接的方法来创建html
  var html = '<html><head><title>Todo List1</title></head><body>'
           + '<h1>Todo List</h1>'
           + '<ul>'
           + items.map(function(item) {
               return '<li>' + item + '</li>'
             }).join('')
           + '</ul>'
           + '<form method="post" action="/">'
           + '<p><input type="text" name="item" /><p>'
           + '<p><input type="submit" value="Add Item" /></p>'
           + '</form></body></html>';

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  res.end(html);
}

// add()函数用来添加代办事项（向数组items添加数据）
// queryString.parse()用来解析请求主体的字符串,把字符串解析为对象
// 例如在表单输入'打扫卫生', 那么就会解释为 { item: '打扫卫生' }
function add(req, res) {
  var body = '';
  req.setEncoding('utf8');
  req.on('data', function(chunk) {
    body += chunk;
  });
  req.on('end', function() {
    var obj = qs.parse(body);
    console.log(obj);
    items.push(obj.item);
    show(res);
  });
}

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Not Found');
}

function badRequest(res) {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Bad Request');  
}