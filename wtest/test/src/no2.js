/**
 * Created by hp on 2016/7/14.
 */
define(function (require, exports, module) {
    var temp="";
    var originmoney="";
debugger;
    exports.$ready = function () {

       console.log("渲染完成")
        $.validationEngine.defaults.onValidationComplete=function(event){	$.isFunction(check) && check.apply(this)};
        $(document.forms[0]).validationEngine();
        $("#querybanknm").click(function(){
            if(!$("#PyeOpnAcctNm").val()){
                alert("账户名称不能为空");
                return ;
            }
            var frameInfo="<iframe height='1200px' width='100%' style='background-color:rgb(0, 0, 0);' name='qrybankno' scrolling='no' src='Noname4.html'></iframe>";
            $.blockUI({
                message:frameInfo,
                css:{
                    width:$(document).width(),
                    height:'900px',
                    left:'0px',
                    top:'0px',
                    border:'none'
                },
                overlayCSS:{
                    cursor:'default'
                }
            })
        })
        $("#TfrAmt").focus(function(){
            $(this).val("")
        }).blur(function(){
            originmoney=""
            var tmp=$(this).val()
            if(tmp!=""){
                if(/^\.+\d*/.test(tmp)){tmp="0"+tmp.replace(/[^\d\.]/g, "")}
                //匹配整数部分没有值的情况
                if(/^[+|-]*\d+\.*$/.test(tmp)){tmp = parseFloat((tmp + "").replace(/[^\d\.-]/g, "")).toFixed(2)+""}
                //匹配小数部分没有值的情况
                tmp.split(".")[1] && tmp.split(".")[1].length<2?(tmp+="0"):(tmp)
                originmoney=tmp.replace(/[^\d\.]/g, "")
                var l = tmp.split(".")[0].split("").reverse(),
                    r = tmp.split(".")[1],
                    t = "";
                for (i = 0; i < l.length; i++) {
                    t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
                }
                var sz= t.split("").reverse().join("") + "." + r
                $(this).val(sz+"");
            }
        })
    };
    exports.setval=function(i){
        $("#PyeOpnBnkNm").html("").val(i[1]+i[0]);
        $("#IntoAcct").focus()
    };
    function  check(){
        var IntoAcct=$("#IntoAcct").val();
        var IntoAcct2=$("#IntoAcct2").val();
        var TfrAmt=$("#TfrAmt").val().replace(/[^\d\.-]/g, "");
        console.log(TfrAmt)
        if(TfrAmt>100000 || TfrAmt<=0){
            alert("当天交易金额不能超过10万or小于零,请重新输入!");
            return;
        }
        alert('验证成功'+TfrAmt);
    }


    exports.closeclock=function(){
        $.unblockUI();
    }
    exports.show=function(){
        console.log("as")
    }
    function gettmp(){
        if(temp){
            return temp;
        }
    }


});