/**
 * Created by hp on 2016/6/27.
 */
var express = require('express');
var app = express();
//���ţ����ǿ���ʹ��app.����()����·�ɡ�
//����ʹ��"GET /"��Ӧ"Hello World"�ַ�������Ϊres��req����Node�ṩ��׼ȷ�Ķ����������Ե���res.pipe()
//��req.on('data', callback)����������
//app.get('/hello.txt', function(req, res){
//    var body = 'Hello World';
//    res.setHeader('Content-Type', 'text/plain');
//    res.setHeader('Content-Length', body.length);
//    res.end(body);
//});

//ExpressJS����ṩ�˸��߲�ķ���������res.send()��������ʡȥ�������Content-Length֮������顣���£�
//����GET����
//http://127.0.0.1:8080/hello/?name=wujintao&email=cino.wu@gmail.com
app.get('/hello/*', function(req, res){
    console.log(req.query.name);
    console.log(req.query.email);
    res.send('Get Over');
});
//���ϱ�ʾ����url�ܹ�ƥ��/hello/*��GET���󣬷�����������ͻ��˷����ַ�����Hello World"

//app.get('/', function(req, res){
// res.render('index', {
//    title: 'Express'
//  });
//});
//����Ĵ�����˼�ǣ�get�����Ŀ¼�����views�ļ����е�indexģ�壬���Ҵ������titleΪ��Express�������title�Ϳ�����ģ���ļ���ֱ��ʹ�á�


//���ڿ��԰󶨺ͼ����˿��ˣ�����app.listen()����������ͬ���Ĳ��������磺
app.listen(8080);
console.log('Listening on port 8080');