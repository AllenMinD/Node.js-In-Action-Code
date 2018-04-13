/*
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

/*
RFC 7235 定义了一个 HTTP 身份验证框架，服务器可以用来针对客户端的请求发送 challenge （质询信息），
客户端则可以用来提供身份验证凭证。
质询与应答的工作流程如下：
服务器端向客户端返回 401（Unauthorized，未被授权的） 状态码，
并在  WWW-Authenticate 首部提供如何进行验证的信息，
其中至少包含有一种质询方式。
之后有意向证明自己身份的客户端可以在新的请求中添加 Authorization 首部字段进行验证，
字段值为身份验证凭证信息。
通常客户端会弹出一个密码框让用户填写，
然后发送包含有恰当的 Authorization  首部的请求。
*/

/*
Connect创建的“程序”实际是一个Javascript函数，用来接收HTTP请求并把它派发给你指定的中间件。
*/

var connect = require('connect');
var app = connect();

// 可配置的中间件logger
function setupLogger(format) {
  var regexp = /:(\w+)/g;

  return function logger(req,res,next) {
    var str = format.replace(regexp, function(match, property) {
      return req[property];
    });
    console.log(str);

    next();  // 返还控制权给分派器，让分派器去调用下一个中间件
  }
}

// 中间件hello
function hello(req,res) {
  res.end('hello world'); // 因为hello中间件结束了HTTP响应（res.end），所以不需要返还控制权给分派器了
}


// 中间件restrict
function restrict(req, res, next) {
  var authorization = req.headers.authorization;
  console.log('authorization: ', authorization);
  if (!authorization)
    return next(new Error('Unauthorized')); // 若return next(new Error())的话，下一步分派器只会调用“错误处理中间件”（即那些带4个参数的中间件：err, req, res, next）

  var parts = authorization.split(' ');
  var scheme = parts[0];
  // Buffer 类被引入作为 Node.js API 的一部分，使其可以在 TCP 流或文件系统操作等场景中处理二进制数据流。
  // Buffer 实例一般用于表示编码字符的序列，比如 UTF-8 、 UCS2 、 Base64 、或十六进制编码的数据。 通过使用显式的字符编码，就可以在 Buffer 实例与普通的 JavaScript 字符串之间进行相互转换。
  var auth = new Buffer(parts[1], 'base64').toString().split(':');
  console.log('auth: ', auth);
  var user = auth[0];
  var pass = auth[1];

  authenticateWithDatabase(user, pass, function(err) {
    if (err)
      return next(err);

    next();
  });
}

// 根据验证用户是否为管理员
// 这里因为没有数据库，所以暂时硬编码管理员为tobi,密码为ferret
function authenticateWithDatabase(user, pass, callback) {
  var err = null;
  if (user != 'Tobi' || pass != 'ferret') 
    //err = new Error('Unauthorized');
    err = 'something go wrong!!!!';
  callback(err);
}

// 中间件admin
function admin(req, res, next) {
  // 用switch语句做一个原始的路由
  switch (req.url) {
    case '/':
      res.end('try another path such as /users');
      break;
    case '/users':
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(['Tobi', 'Loki', 'Jane']));
      break;
  }
}

// 错误处理中间件errorHandler
function errorHandler() {
  var env = process.env.NODE_ENV || 'development';  // 是生产环境还是开发环境

  return function(err, req, res, next) {  // 错误处理中间件有4个参数（比普通中间件多了一个err）
    res.statusCode = 500;
    switch(env) {
      case 'development': 
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(err));
        break;
      default:
        res.end('Server error');
    }
  }
}

app.use(setupLogger(':url :method'));  // 添加中间件
app.use('/admin', restrict);
app.use('/admin', admin);
app.use(hello);
app.use(errorHandler);  // 把程序放到生产环境中，里面至少应该有一个错误处理中间件
app.listen(3000, function() {
  console.log("server run in localhost:3000");
});  // 监听3000端口