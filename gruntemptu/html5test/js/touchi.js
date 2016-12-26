/**
 * Created by wuy on 2016/12/23.
 */
(function($){
    $.fn.touchwipe=function(settings){
        var config={
            min_move_x:20,
            min_move_y:20,
            wipeLeft:function(){},
            wipeRight:function(){},
            wipeUp:function(){},
            wipeDown:function(){},
            preventDefaultEvents:true
        };
        if(settings)
            $.extend(config,settings);
        this.each(
            function(){
                var startX;
                var startY;
                var isMoving=false;
                function cancelTouch(){
                    this.removeEventListener('touchmove',onTouchMove);
                    startX=null;
                    isMoving=false
                }
                function onTouchMove(e){
                    if(config.preventDefaultEvents){
                        e.preventDefault()
                    }
                    if(isMoving){
                        var x=e.touches[0].pageX;
                        var y=e.touches[0].pageY;
                        var dx=startX-x;
                        var dy=startY-y;
                        if(Math.abs(dx)>=config.min_move_x){
                            cancelTouch();
                            if(dx>0){config.wipeLeft()}
                            else{config.wipeRight()}}
                        else if(Math.abs(dy)>=config.min_move_y){
                            cancelTouch();
                            if(dy>0){
                                config.wipeDown()
                            }else{
                                config.wipeUp()
                            }
                        }
                    }
                }
                function onTouchStart(e){
                    if(e.touches.length==1){
                        startX=e.touches[0].pageX;
                        startY=e.touches[0].pageY;
                        isMoving=true;
                        this.addEventListener('touchmove',onTouchMove,false)
                    }
                }
              // if('ontouchstart'in document.documentElement){//for FF
                    this.addEventListener('touchstart',onTouchStart,false)
            }
            //}
        );
        return this
    }
    })(jQuery);

$(function() {


        $(document).on('touchstart click', '.page-three #dot', function(e) {
            $('.fix3').show();
        });
        $(document).on('touchstart click', '.page-three .fix7', function() {
            $(".fix3").fadeOut("slow");
        });


    var ind = 0, zInd = 1;
    var startTime = 0, endTime = 0,now = 0;
    var tagl= document.getElementsByTagName("section");
    if ((navigator.userAgent.toLowerCase().indexOf("firefox")!=-1)){//FF
        (function(){
            for(var ix=0;ix<tagl.length;ix++){
                tagl[ix].addEventListener("DOMMouseScroll",scrollFun,false);
            }
        })()
    }
    else if (document.addEventListener) {
        (function(){
            for(var ix=0;ix<tagl.length;ix++){
                tagl[ix].addEventListener("mousewheel",scrollFun,false);
            }
        })()

    }
    else if (document.attachEvent) {
        (function(){
            for(var ix=0;ix<tagl.length;ix++){
                tagl[ix].attachEvent("mousewheel",scrollFun,false);
            }
        })()
    }
    else{
        (function(){
            for(var ix=0;ix<tagl.length;ix++){
                tagl[ix].onmousewheel = scrollFun;
            }
        })()
    }
    function scrollFun(event){
        var th=event.target;
        startTime = new Date().getTime();
        var delta = event.detail || (-event.wheelDelta);
        if ((endTime - startTime) < -1000) {

            if (delta > 0 ) {
                if (ind <  len-1) {
                    pageHide(ind, 'fadeInDown');
                    ind++;
                    pageShow(ind, 'fadeInUp');
                }
            }
            if (delta < 0) {
                if ($(this).hasClass("page-one")) {
                    return false;
                }
                pageHide(ind, 'fadeInUp');
                ind--;
                pageShow(ind, 'fadeInDown');
            }
            endTime = new Date().getTime();
        }
        else{
            event.preventDefault();
        }
    }

    function pageShow(ind, className) {
        zInd++;
        $("#content section").eq(ind).css({
            zIndex: zInd
        });
        $("#content section").eq(ind).show();
       $("#content section").eq(ind).addClass(className);

    }

    function pageHide(ind, className) {
        zInd++;
        $("#content section").eq(ind).css({
            zIndex: zInd
        });
        $("#content section").eq(ind).hide();
        $("#content section").eq(ind).addClass(className);

    }

    var slidePage = true;
    var scrollDir = 0;
    var len=$("#content section").length;
    $("#content section").touchwipe({
        wipeUp: function () {
            if ($(this).hasClass("page-one")) {
                return false;
            }
            pageHide(ind, 'fadeInUp');
            ind--;
            pageShow(ind, 'fadeInDown');
        },
        wipeDown: function () {
            if (ind <  len-1) {
                pageHide(ind, 'fadeInDown');
                ind++;
                pageShow(ind, 'fadeInUp');
                slidePage = false;
            }

        },
        min_move_x: 80,
        min_move_y: 80,
        preventDefaultEvents: true
    });

})