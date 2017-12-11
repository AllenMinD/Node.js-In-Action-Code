/*
HTTPS服务：
在Node程序中使用HTTPS，首先要取得一个【私钥】和一份【证书】
【证书】内容包含了公钥和证书持有者的信息
【公钥】用来加密客户端发往服务器的数据
【私钥】用来解密客户端发给服务器的数据
【证书】和【公钥】是其他人都可以看见的，而【私钥】是其他人不可见的。
【私钥】保存在服务器上的一个文件里，放在一个不可信用户无法轻易访问的地方。

这里演示的，是自己生成的一个【自签发的证书】。这种证书不能用在正式网站上，只能用于开发和测试。

生成私钥需要OpenSSL，在装Node时已经装过了，因此可以直接使用。
在命令行中输入：
openssl genrsa 1024 > key.pem
在当前目录下就会创建出一个key.pem文件，这个就是私钥

在命令行中输入：
openssl req -x509 -new -key key.pem > key-cert.pem
然后按提示填入相关信息
然后就会在当前目录下就会创建出一个key-cert.pem文件，这个就是证书

另外，HTTPS的API和HTTP基本相同。
*/

var https = require('https');  // HTTPS服务要用到https模块
var fs = require('fs');

// **配置项，包含着SSL私钥和证书
var options = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./key-cert.pem')
}

// 和创建http服务器最大的不同就是，在创建https服务器时，
// 需要额外多一个参数：options，这个参数是包含【密钥】和【证书】的配置对象
// 另外，HTTPS的API和HTTP基本相同
var server = https.createServer(options, function(req, res) {
  res.writeHead(200);
  res.end("Hello world\n");
});

server.listen(3000, function() {
  console.log('server on port 3000, the url is https://localhost:3000/');
});