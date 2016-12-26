/************************** *
Desc:�ύ����ʱ���� 
*Argument:type=0 ȫ���� 1�ֲ��� 
**************************/;
define(function(require, exports, module) {
	(function ($) {
		var defaultVal = {
			backgroudColor: "#ECECEC",//����ɫ
			backgroundImage: "loading.gif",//����ͼƬ
			text: "���ڼ�����,���Ժ�....",//����
			width: 180,//���
			height: 60,//�߶�
			type: 0 //0ȫ���ڣ�1 �ֲ���
		};
		$.fn.extend({

			setting: function (option) {
				$.extend(defaultVal, option);
			},
			jqLoading: function (option) {
				if (typeof option == "object") {
					var opt = $.extend(defaultVal, option);
				}
				if (opt.type == 0) {             //ȫ����
					openLayer();
				} else if (opt.type == 1) {
					//�ֲ���(��ǰ����ӦΪ��Ҫ���ڵ��Ķ���)
					openPartialLayer(this);
				} else {
					openPartialLayer(this);
				}
				//���ٶ���
				if (option === "destroy") {
					var t = closeLayer();
					defaultVal = t;
				}
			}

		})
		//���ñ������
		function getHeight() {
			var scrollHeight, offsetHeight;
			// handle IE 6
			if ($.support.boxModel && $.support.leadingWhitespace) {
				scrollHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
				offsetHeight = Math.max(document.documentElement.offsetHeight, document.body.offsetHeight);
				if (scrollHeight < offsetHeight) {
					return $(window).height();
				} else {
					return scrollHeight;
				}
				// handle "good" browsers
			} else if ($.support.objectAll) {
				return $(document).height() - 4;
			} else {
				return $(document).height() + 500;
			}
		}

		//���ñ������
		function getWidth() {
			var scrollWidth, offsetWidth;
			// handle IE
			if ($.support.boxModel) {
				scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
				offsetWidth = Math.max(document.documentElement.offsetWidth, document.body.offsetWidth);
				if (scrollWidth < offsetWidth) {
					return $(window).width();
				} else {
					return scrollWidth;
				}
				// handle "good" browsers
			} else {
				return $(document).width();
			}
		}

		/*==========ȫ������=========*/
		function openLayer() {
			//�������ֲ�
			var layer = $("<div id='layer'></div>");
			var opt = defaultVal;
			layer.css({
				zIndex: 9998,
				position: "absolute",
				height: getHeight() + "px",
				width: getWidth() + "px",
				background: "black",
				top: 0,
				left: 0,
				filter: "alpha(opacity=30)",
				opacity: 0.3
			});
			//ͼƬ�����ֲ�
			var content = $("<div id='content'></div>");
			content.css({
				textAlign: "left",
				position: "absolute",
				zIndex: 9999,
				height: opt.height + "px",
				width: opt.width + "px",
				top: "50%",
				left: "50%",
				verticalAlign: "middle",
				background: opt.backgroudColor,
				borderRadius: "8px",
				fontSize: "13px"
			});
			content.append("<img style='vertical-align:middle;margin:" + (opt.height / 4) + "px; 0 0 5px;margin-right:5px;' src='" + opt.backgroundImage + "' /><span  id='asign' style='text-align:center; vertical-align:middle;font-size:20px;'>" + opt.text + "</span>");
			$("body").append(layer).append(content);
			var top = content.css("top").replace('px', '');
			var left = content.css("left").replace('px', '');
			content.css("top", (parseFloat(top) - opt.height / 2)).css("left", (parseFloat(left) - opt.width / 2));
			return this;
		}

		//���ٶ���
		function closeLayer() {
			$("#layer,#content,#partialLayer").remove();
			defaultVal = {
				backgroudColor: "#ECECEC",//����ɫ
				backgroundImage: "loading.gif",//����ͼƬ
				text: "���ڼ�����,���Ժ�....",//����
				width: 180,//���
				height: 60,//�߶�
				type: 0 //0ȫ���ڣ�1 �ֲ���
			};
			return defaultVal;
		}

		/*==========�ֲ�����=========*/
		function openPartialLayer(obj) {
			var eheight = $(obj).css("height");//Ԫ�ش�px�ĸ߿��
			var ewidth = $(obj).css("width");
			//	var top = $(obj).offset().top; // Ԫ�����ĵ���λ�� ��������Ӱ��
			//	var left = $(obj).offset().left;
			var layer = $("<div id='partialLayer' style='text-align:center;z-index:9998;'><img  src='loading.gif' style='margin-top:20px;'/></div>");
			layer.css({

				position: "absolute",
				height: eheight,
				width: ewidth,
				//		top: top,
				//		left: left,
				filter: "alpha(opacity=60)",
				opacity: 1,
				borderRadius: "3px",
				display: "block",
				"background-color": '#ECECEC'

			});
			//$("body").append(layer);
			layer.appendTo(obj);
			//obj.html("").append(layer)
			return this;
		}
	})(jQuery)
});