var connect = require('connect');
var app = connect();

// 中间件hello
function hello(req, res, next) {
  console.log(req.url);
  if (req.url == '/helloerror') {
    var err = "Don't visit /helloerror! Do you want to visit /hello ?"
    next(err);
  } else if (req.url.match(/^\/hello/)) {
    res.end('Hello World!\n');
  } else {
    next();
  }
}

// 中间件user
// 假设db为数据库
var db = {
  users: {
    'tobi': 'I am tobi',
    'loki': 'I am loki',
    'jane': 'I am jane'
  }
}
function users(req, res, next) {
  var match = req.url.match(/^\/user\/(.+)/); // 匹配“/user/xxx”
  //console.log(match);  // [ '/user/tobi', 'tobi', index: 0, input: '/user/tobi' ]
  if (match) {
    var user = db.users[match[1]];
    if (user) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(user));
    } else {
      var err = new Error('User not found');
      err.notFound = true;
      next(err);
    }
  } else {
    next();
  }
}

// 中间件pets
function pets(req, res, next) {
  if (req.url.match(/^\/pets\/(.+)/)) {
    foo();
  } else {
    next();
  }
}

// 错误处理中间件errorHandler
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.setHeader('Content-Type', 'application/json');
  if (err.notFound) {
    res.statusCode = 404;
    res.end(JSON.stringify({error: err.message}));
  } else {
    res.statusCode = 500;
    res.end(JSON.stringify({error: 'Internal Server Error'}));
  }
}

// 错误处理中间件errorPage（当中间件hello发生错误时，才会触发）
function errorPage(err, req, res, next) {
  res.setHeader('Content-Type', 'application/html');
  res.end(err);
}


var api =  connect()
  .use(users)
  .use(pets)
  .use(errorHandler);

var app = connect()
  .use(hello)
  .use('/api', api)  // 嵌套connect程序
  .use(errorPage)
  .listen(3000, function() {
    console.log('server run in localhost:3000');
  });