/**
 * Created by hp on 2016/6/28.
 */
var express = require('express');
var app = express();
app.configure(function() {
    //默认情况下Express并不知道该如何处理该请求体，因此我们需要增加bodyParser中间件，用于分析
    //application/x-www-form-urlencoded和application/json
    //请求体，并把变量存入req.body。我们可以像下面的样子来“使用”中间件[这个保证POST能取到请求参数的值]：
    app.use(express.bodyParser());
});

//处理POST请求
//name和email是POST请求域中的参数名
app.post('/hello', function(req, res) {
    console.log(req.body.name);
    console.log(req.body.email);
    res.send('Post Over');
});

post_mtd = function(req,res){
    res.send('我是Wujintao');
}
//其中这两种形式中的function均可以定义在外部，然后引进方法名即可。其中方法post_mtd要在引用其前定义
app.post("/wujintao",post_mtd);

//除了app.get、app.post这种形式外，还可以采用：app.all在这里all表示get,post等任何一种请求方式，当然也可以指定为某种特定的请求方式。
//或者app['get']('/path', function(req,res));这种形式。

//现在可以绑定和监听端口了，调用app.listen()方法，接收同样的参数，比如：
app.listen(8080);
console.log('Listening on port 8080');