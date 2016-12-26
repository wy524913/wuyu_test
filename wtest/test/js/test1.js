
define(function (require, exports, module) {

	exports.$ready = function () {


	//	second(10);
		//$(":text[data-validation-engine*=required]:not([data-required-class=ubankNORequired])").each(function () {
		//	$(this).after("<span style='color:#ff0000;display:inline;'>*</span>");
		//});

		/*		   $(":text[data-validation-engine*=required]").on("keyup", function(e){
		 if(e.currentTarget.value.length!==0 && e.target.tagName.toLowerCase() === "input") {
		 var count=e.currentTarget.value.split(','),ty="";
		 $.each(count,function(i,v){
		 ty+=v;
		 })

		 if(ty.length%4==0){
		 e.currentTarget.value+=",";
		 }
		 }

		 })*/
		console.log("渲染完成")
	};


	function setTranLoading(msg) {
		$.fn.setting({height: 100, width: 400, text: msg, backgroudColor: "#ECECEC"});
	}


	function second(sec) {

		setTranLoading("请在" + sec + "秒后插入签名纸张...");
		$("#zhah").jqLoading({type:0});
		var tu = setInterval(function () {
			sec = sec - 1;
			if (sec == 0) {
				$("#zhah").jqLoading("destroy");
				clearInterval(tu);
			} else {
				$("#asign").text("请在" + sec + "秒后插入签名纸张...");
			}
		}, 1000);


	}

	function hui() {
		var temp = 0, defobj = $.Deferred();

		arr().done(function (d) {
			temp = d
			defobj.resolveWith(this, [temp]);
		})
		return defobj.promise();
	}

	function arr() {
		var defObj = $.Deferred();
		var a = "你", b = "好";
		var y = new Array();
		if (defObj == undefined) {
			defObj.rejectWith(this, arguments);
			return;
		}
		y.push(a);
		y.push(b);
		defObj.resolveWith(this, [y]);

		return defObj.promise();


	}


});