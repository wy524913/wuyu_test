/**
 * Created by hp on 2016/6/28.
 */
var express = require('express');
var app = express();
app.configure(function() {
    //Ĭ�������Express����֪������δ���������壬���������Ҫ����bodyParser�м�������ڷ���
    //application/x-www-form-urlencoded��application/json
    //�����壬���ѱ�������req.body�����ǿ������������������ʹ�á��м��[�����֤POST��ȡ�����������ֵ]��
    app.use(express.bodyParser());
});

//����POST����
//name��email��POST�������еĲ�����
app.post('/hello', function(req, res) {
    console.log(req.body.name);
    console.log(req.body.email);
    res.send('Post Over');
});

post_mtd = function(req,res){
    res.send('����Wujintao');
}
//������������ʽ�е�function�����Զ������ⲿ��Ȼ���������������ɡ����з���post_mtdҪ��������ǰ����
app.post("/wujintao",post_mtd);

//����app.get��app.post������ʽ�⣬�����Բ��ã�app.all������all��ʾget,post���κ�һ������ʽ����ȻҲ����ָ��Ϊĳ���ض�������ʽ��
//����app['get']('/path', function(req,res));������ʽ��

//���ڿ��԰󶨺ͼ����˿��ˣ�����app.listen()����������ͬ���Ĳ��������磺
app.listen(8080);
console.log('Listening on port 8080');