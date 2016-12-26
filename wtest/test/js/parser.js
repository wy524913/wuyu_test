/**
 * @module core/parser
 * @author wuy
 */
define(function(require, exports, module) {

    /***
     * **解析组件配置**
     *
     * @method parseOptions
     * @param {object} target 目标元素
     * @param {array} properties 属性配置数组
     * @return {object} 解析后的对象
     */
    exports.parseOptions = function(target, properties){
        var t = $(target);
        var options = {};
        var s = $.trim(t.attr('kui-options'));
        if (s){
            var first = s.substring(0,1);

            if(first!='{') s = "{"+s+"}";
            options = (new Function('return ' + s))();
        }

        if (properties){
            var opts = {};
            for(var i=0; i<properties.length; i++){
                var pp = properties[i];
                if (typeof pp == 'string'){
                    if (pp == 'width' || pp == 'height' || pp == 'left' || pp == 'top'){
                        opts[pp] = parseInt(target.style[pp]) || undefined;
                    } else {
                        opts[pp] = t.attr(pp);
                    }
                } else {
                    for(var name in pp){
                        var type = pp[name];
                        if (type == 'boolean'){
                            opts[name] = t.attr(name) ? (t.attr(name) == 'true') : undefined;
                        } else if (type == 'number'){
                            opts[name] = t.attr(name)=='0' ? 0 : parseFloat(t.attr(name)) || undefined;
                        }
                    }
                }
            }
            $.extend(options, opts);
        }


        this.handleView(options, this.getContextObj() || {});
        return options;
    }

    /***
     * **根据id获取view配置**
     *
     * @method getViewConfig
     * @param {string} viewIds view配置id
     * @param {function} success 获取成功的回调
     * @param {function} error 获取失败的回调
     * @return undefined
     */
    exports.getViewConfig = function(viewIds, success, error) {
        var that = this,
            defObj = $.Deferred(),
            viewIdArr = viewIds && (_.isArray(viewIds) ? viewIds : viewIds.split(",")),
            retViewConf = {};

        success = $.isFunction(success) ? success : $.noop;
        error = $.isFunction(error) ? error : $.noop;

        if(!viewIdArr || !viewIdArr.length) {
            success.call(this, {});
            defObj.resolveWith(this, [{}]);
            return defObj.promise();
        }

        ajax.post({
            req: {service: "P9999998", IS_NEW_VIEW_FORMAT: "true", view_ids: viewIdArr.join(",")}
        }).done(function(data, head) {
            if(1 === viewIdArr.length) {
                retViewConf[viewIdArr[0]] = data[data.length - 1]["CONFIG"];
            } else {
                retViewConf = data[data.length - 1]["CONFIG"];
            }

            that.handleView(retViewConf);
            success.call(this, retViewConf);
            defObj.resolveWith(this, [retViewConf]);
        }).fail(function(data, head) {
            error.call(this, head || {});
            defObj.rejectWith(this, [head || {}]);
        });

        return defObj.promise();
    }

    /***
     * **解析上下文dom对象**
     *
     * @method parseContext
     * @param {object} context 上下文dom对象
     * @return {object} 解析后的对象
     */
    exports.parseContext = function(context) {
        var context = $(context),
            views = [],
            objs = [], obj, viewId;

        $("[class*='kui-']", context).add(context).each(function() {
            obj = {};
            obj["target"] = $(this);    //目标元素
            obj["name"] = obj["target"].attr("name");   //元素name属性
            obj["provider"] = getProvider(this);    //组件名称

            if(!obj["provider"]) {
                return true;
            }

            //jQuery.fn中不存在的组件方法不尝试初始化
            if(!$.fn[obj["provider"]]) {
                return true;
            }

            //初始化好的组件不再初始化
            if(obj["target"].data(obj["provider"])) {
                return true;
            }

            //同时满足以下情况的元素会从后台view配置中取参数
            //1.能够通过acceptViewConfig方法检查的组件。
            //2.需要远程加载配置的组件，即data-remote属性不为false的组件。
            //3.能够取到view编号配置的组件，即配置了data-view属性或id属性的组件，其中优先获取data-view配置。
            if(acceptViewConfig(obj["provider"]) && false !== obj["target"].data("remote") &&
                (viewId = obj["target"].data("view") || obj["target"].attr("id"))) {

                obj["viewId"] = viewId;

                if(-1 === $.inArray(viewId, views)) {
                    views.push(viewId);
                }
            }

            objs.push(obj);
        });

        return {
            context: context,   //上下文对象
            viewIds: views.join(","),   //view配置id，多个使用逗号分隔
            elems: objs,    //目标对象数组
            uioptions: context.data("uioptions") || {}  //上下文数据缓存对象
        };

        //判断组件是否能够通过view初始化
        function acceptViewConfig(provider) {
            return -1 !== $.inArray(provider, ["datagrid", "reportgrid", "form", "treegrid", "sform"]);
        }

        //通过dom对象获取组件类型
        function getProvider(ele) {
            var v, klass;

            if(!(klass = $(ele).attr("class"))) {
                return;
            }
            $.each(klass.split(" "), function() {
                if(this && this.startsWith("kui-")) {
                    v = this.replace("kui-", "");
                    return false;
                }
            });

            return v;
        }
    }

    /***
     * **获取view中的script配置，获取到立刻返回**
     *
     * @method getViewScript
     * @param {object} conf view配置
     * @return {string} view的script配置
     */
    exports.getViewScript = function(conf) {
        for(var k in conf) {
            if(conf[k]["data-main"]) {
                return conf[k]["data-main"];
            }
        }
    }

    /***
     * **获取view中的css配置，获取到立刻返回**
     *
     * @method getViewScript
     * @param {object} conf view配置
     * @return {string} view的css配置
     */
    exports.getViewCSS = function(conf) {
        for(var k in conf) {
            if(conf[k]["data-css"]) {
                return conf[k]["data-css"];
            }
        }
    }

    /***
     * **生成通用界面dom结构**
     *
     * @method setGenPage
     * @param {object} obj 初始化通用页面参数对象
     * @return undefined
     */
    //exports.setGenPage = function(obj) {
    //    var genericRender = require("apps/tpls/src/frame/generic-page"),
    //        viewIdArr = obj.VIEW_ID && obj.VIEW_ID.split(","),
    //        frameHeight;
    //    //begin@zhaozz 2015-12-09 调整通用界面高度 ------------------------
    //    if(!top.kjdp.$fScreenDialog){
    //        frameHeight = $(top).height() - 115;
    //    }else{
    //        frameHeight =window.frameElement ? $(window.frameElement).parent().height() : $(window).height();
    //    }
    //    $(document.body).css({height:frameHeight});
    //
    //    if(!viewIdArr) {
    //        throw "没有获取到view编号，检查参数！";
    //        return;
    //    }
    //
    //    $("body").empty().append(genericRender({
    //        viewIdArr: viewIdArr,
    //        isVertical: obj.isVertical,
    //        winWidth: window.frameElement ? $(window.frameElement).parent().width() : $(window).width(),
    //        winHeight: frameHeight,
    //        showFScreenBtn: !top.kjdp.$fScreenDialog ? "fullScreen":"reductScreen",//增加全屏按钮配置 @zhaozz 2016-01-06
    //        btnName: !top.kjdp.$fScreenDialog ? "全屏":"返回"//增加全屏按钮配置 @zhaozz 2016-01-06
    //    }));
    //    //end@zhaozz 2015-12-09 调整通用界面高度 ------------------------
    //    this.setContextObj({
    //        onBeforeResize: function() {
    //            var panels = $.data(this, "layout").panels;
    //            if(panels.west && panels.west.length) {
    //                panels.west.panel("options").width =  $(window).width() / 2;
    //            } else if(panels.north && panels.north.length) {
    //                panels.north.panel("options").height =  $(window).height() / 2;
    //            }
    //        }
    //    });
    //}

    /***
     * **递归处理view配置，结合模块导出的上下文对象将view配置中的函数字符串配置转换成对应的function对象**
     *
     * @method handleView
     * @param {object} obj view配置
     * @param {object} contextObj 模块导出的上下文对象
     * @return undefined
     */
    exports.handleView = function(obj, contextObj) {
        var ctxObj = $.extend(true, {}, this.getContextObj(), contextObj),
            tmp;
        for(var key in obj) {
            if(_.isObject(obj[key]) || _.isArray(obj[key])) {
                arguments.callee.call(this, obj[key], ctxObj);
                continue;
            }

            if(_.isString(obj[key])) {
                obj[key] = valueEval(obj[key]);
            }

            if(ctxObj && _.isString(obj[key])) {
                if(obj[key].indexOf(".") >= 0 && (tmp = contextEval("ctxObj", obj[key]))) {
                    obj[key] = tmp;
                } else {
                    obj[key] = ctxObj[obj[key]] || obj[key];
                }
            }
        }

        function valueEval(v) {
            if("true" === v) {
                return true;
            }

            if("false" === v) {
                return false;
            }

            if(/^\d+$/.test(v)) {
                return v;
            }

            try {
                return utils.parseJSON(v);
            } catch(e) {}

            return v;
        }

        function contextEval(objName, str) {
            try {
                return eval(objName + "." + str);
            } catch(e) {}
        }
    }

    /***
     * **处理view配置中的回调，主要用于处理通用界面表格的回调**
     *
     * @method handleCallbacks
     * @param {object} viewConf view配置
     * @return undefined
     */
    exports.handleCallbacks = function(viewConf) {

        var commonBtnHandler = {

            commonAdd: function(e, datagrid, btnConf) {
                var mainDatagridId = datagrid.data("mainDatagrid"),
                    mainDatagrid = mainDatagridId ? $("#" + mainDatagridId) : null,
                    records,
                    obj;

                if(mainDatagrid && mainDatagrid.length) {
                    records = mainDatagrid.datagrid("getSelected");

                    if(!records) {
                        alert("请选择主表格的一行数据！");
                        return;
                    }
                }

                obj = createCommonDialog({
                    title: btnConf.title||"增加",
                    width: btnConf.panelWidth,
                    height: btnConf.panelHeight,
                    col: datagrid.datagrid("getOriginalColumns"),
                    record: records,
                    buttons: [{
                        text: "保存",
                        iconCls: "icon-save",
                        handler: function() {
                            if(btnConf.req && btnConf.req.length && (btnConf.req[0].service||btnConf.req[0].bex_codes) && obj.form.form("validate")) {
                                var mask,
                                    formData = obj.form.form("getData");

                                if(_.isFunction(btnConf.onBeforeSave) && false === btnConf.onBeforeSave.call(obj.form, formData)) {
                                    mask && mask.window("destroy");
                                    return;
                                };
                                mask = loading("操作中，请稍后！");
                                ajax.post({
                                    req: $.extend({}, btnConf.req[0], formData)
                                }).done(function(arg) {
                                    var index;
                                    alert("增加成功！");
                                    obj.dialog.dialog("close");  
                                    //begin@zhaozz  2015-12-07 解决需求：datagrid新增row后，默认选中新增的那一行记录    
                                    datagrid.datagrid("reload",null,function(){
                                        index = datagrid.datagrid("getRowIndex",formData);
                                        index > -1 && datagrid.datagrid("selectRow",index);
                                    });    
                                    //end@zhaozz  2015-12-07 解决需求：datagrid新增row后，默认选中新增的那一行记录                                           
                                }).always(function() {
                                    mask.window("destroy");
                                });
                            }
                        }
                    }, {
                        text: "关闭",
                        iconCls: "icon-cancel",
                        handler: function() {
                            obj.dialog.dialog("close");
                        }
                    }],
                    onFormInitSuccess: btnConf.onFormInitSuccess,
                    onBeforeLoad: btnConf.onBeforeLoad
                }, records);
            },

            commonModify: function(e, datagrid, btnConf) {
                var row = datagrid.datagrid("getSelected"),
                    obj;

                if(!row) {
                    alert("请选择一行数据！");
                    return;
                }

                obj = createCommonDialog({
                    modify: true,
                    title: btnConf.title||"修改",
                    width: btnConf.panelWidth,
                    height: btnConf.panelHeight,
                    col: datagrid.datagrid("getOriginalColumns"),
                    buttons: [{
                        text: "保存",
                        iconCls: "icon-save",
                        handler: function() {
                            if(btnConf.req && btnConf.req.length && (btnConf.req[0].service||btnConf.req[0].bex_codes) && obj.form.form("validate")) {
                                var mask,
                                    formData = obj.form.form("getData");

                                if(_.isFunction(btnConf.onBeforeSave) && false === btnConf.onBeforeSave.call(obj.form, formData)) {
                                    mask && mask.window("destroy");
                                    return;
                                };

                                mask = loading("操作中，请稍后！");
                                ajax.post({
                                    req: $.extend({}, btnConf.req[0], formData)
                                }).done(function() {
									var index = datagrid.datagrid("getRowIndex",row);
                                    alert("修改成功！");
                                    obj.dialog.dialog("close");
                                   // datagrid.datagrid("reload");
									datagrid.datagrid("updateRow",index,$.extend(row,formData));
                                }).always(function() {
                                    mask.window("destroy");
                                });
                            }
                        }
                    }, {
                        text: "关闭",
                        iconCls: "icon-cancel",
                        handler: function() {
                            obj.dialog.dialog("close");
                        }
                    }],
                    onFormInitSuccess: btnConf.onFormInitSuccess,
                    onBeforeLoad: btnConf.onBeforeLoad
                }, row);

            },

            commonDelete: function(e, datagrid, btnConf) {
                var row = datagrid.datagrid("getSelected"),
                    subGridId = datagrid.data("subDatagrid"),
                    subGrid = subGridId ? $("#" + subGridId) : null;

                if(!row) {
                    alert("请选择一行数据！");
                    return;
                }

                confirm(btnConf.title||"提示", "确定要删除选中的记录吗？", function(flag) {
                    if(flag) {
                        if(btnConf.req && btnConf.req.length && (btnConf.req[0].service||btnConf.req[0].bex_codes)) {
                            ajax.post({
                                req: $.extend({}, btnConf.req[0], row)
                            }).done(function() {
                                alert("删除成功！");
                                if(subGrid) {
                                    subGrid.datagrid("loadData", {});
                                }
                                datagrid.datagrid("clearSelections");
                                datagrid.datagrid("reload");
                            });
                        }
                    }
                });
            }
        };

        $.each(viewConf, function(viewId) {
            var datagrid = $("#" + viewId),
                subGridId = datagrid.data("subDatagrid"),
                subGrid = subGridId ? $("#" + subGridId) : null,
                sViewConf = viewConf[viewId];
           
            if(!_.isFunction(sViewConf.onQueryButtonClick)) {
                sViewConf.onQueryButtonClick = function(param) {
                    datagrid.datagrid('reload', param);
                    datagrid.datagrid('clearSelections');
                    if(subGrid) {
                        subGrid.datagrid("clean");
                    }
                }
            }

            if(!_.isFunction(sViewConf.onSelect)) {
                sViewConf.onSelect = function(idx, row) {
                    var maintainFlag = "MAINTAIN_FLAG",
                        subBtns,
                        modifyBtn = datagrid.datagrid("getToolbarButton", "button_commonModify_" + sViewConf.id),
                        delBtn = datagrid.datagrid("getToolbarButton", "button_commonDelete_" + sViewConf.id);

                    modifyBtn.linkbutton("enable");
                    delBtn.linkbutton("enable");

                    if("1" === row[maintainFlag]) {
                        delBtn.linkbutton("disable");
                    } else if("2" === row[maintainFlag]) {
                        modifyBtn.linkbutton("disable");
                    } else if("3" === row[maintainFlag]) {
                        delBtn.linkbutton("disable");
                        modifyBtn.linkbutton("disable");
                    }

                    if(subGrid) {
                        subBtns = subGrid.datagrid("getToolbarButton");
                        if(subBtns.length) {
                            subBtns.linkbutton("enable");
                        }
                        subGrid.datagrid("reload", row);
                    }
                }
            }

            $.each(sViewConf, function(key, value) {
                if("toolbar" === key) {
                    $.each(value, function() {
                        var btnConf = this,
                            proxy;

                        if(!btnConf.handler) {
                            proxy = $.proxy($.noop);
                        } else if(_.isString(btnConf.handler) && commonBtnHandler[btnConf.handler]) {
                            btnConf.id = "button_" + btnConf.handler + "_" + viewId;
                            proxy = $.proxy(commonBtnHandler[btnConf.handler]);
                        } else if(_.isFunction(btnConf.handler)) {
                            proxy = $.proxy(btnConf.handler);
                        }

                        btnConf.handler = function(e) {
                            if(proxy) {
                                proxy.call(this, e, datagrid, btnConf);
                            } else {
                                throw "没有找到对应的处理器，请检查按钮的handler配置！"
                            }
                        };
                        //对于表格没有绑定行双击事件的时候，绑定双击事件，绑定的双击事件默认为第一个修改按钮，通过按钮图标判断是否是修改按钮，icon-edit。没有修改按钮的时候，不绑定双击事件。
                        //zhubc-20151123.
                        if(!_.isFunction(sViewConf.onDblClickRow) && btnConf.iconCls == "icon-edit") {
                            sViewConf.onDblClickRow = function(i,row) {
                                if(proxy) {
                                    proxy.call(this, window.event, datagrid, btnConf);
                                } else {
                                    throw "没有找到对应的处理器，请检查按钮的handler配置！"
                                }
                            }
                        }
                    });
                }
            });
        });

        function createCommonDialog(opts, data) {
            var dialog = $("<div><form></form></div>").dialog({
                    width: opts.width || 570,
                    height: opts.height || 300,
                    modal: true,
                    title: opts.title || "对话框",
                    buttons: opts.buttons,
                    onClose: function() {
                        dialog.dialog("destroy");
                    }
                }),

                form = dialog.find("form").form({
                    modify: !!opts.modify,
                    colNumbers: 2,
                    col: opts.col,
                    record: opts.record,
                    onInitSuccess: function() {
                        if(_.isFunction(opts.onBeforeLoad) && false === opts.onBeforeLoad.call(form, data || {})) {
                            return;
                        }
                        if(data){
                            form.form("load", data || {});
                        }

                        _.isFunction(opts.onFormInitSuccess) && opts.onFormInitSuccess.call(form, data || {});
                    }
                });

            return {
                dialog: dialog,
                form: form
            };
        }
    }

    /***
     * **获取保存的模块上下文对象**
     *
     * @method getContextObj
     * @return {object} 模块的上下文对象
     */
    exports.getContextObj = function() {
        return $("body").data("contextObj");
    }

    /***
     * **设置页面的模块上下文对象，重复set会合并不会直接替换**
     *
     * @method setContextObj
     * @return {object} 模块的上下文对象
     */
    exports.setContextObj = function(obj) {
        if(!obj) {
            return;
        }
        var body = $("body"),
            contexObj = body.data("contextObj");
        body.data("contextObj", $.extend({}, contexObj, obj));
    }

    /**
     * **解析指定的dom元素及其子元素**
     *
     * @method director
     * @param {object|string} context 需要解析的上下文dom元素
     * @param {function} success 解析完成的回调
     * @param {function} error 解析错误的回调
     * @return undefined
     */
    exports.director = function(context, success, error) {
        success = $.isFunction(success) ? success : $.noop;
        error = $.isFunction(error) ? error : $.noop;

        var defObj = $.Deferred(),
            that = this,
            ctx, parsed,
            t1 = $.now(), logArr;

        if(!context || !(ctx = $(context)).length) {

            success.call(context);
            defObj.resolveWith(context, []);
            return defObj.promise();
        }

        (logArr = ["解析开始，上下文信息："]).push(utils.toJSON({
            tagName: ctx[0].tagName.toLocaleLowerCase(),
            id: ctx.attr("id"),
            name: ctx.attr("name")
        }));


        parsed = that.parseContext(context);

        if(!parsed.elems || !parsed.elems.length) {

            success.call(context);
            defObj.resolveWith(context, []);
            return defObj.promise();
        }

        that.getViewConfig(parsed.viewIds).done(function(conf) {
            var contextObj = that.getContextObj(),
                script = contextObj.isGenPage && !$.isEmptyObject(conf) ? that.getViewScript(conf) : null,
                css = contextObj.isGenPage && !$.isEmptyObject(conf) ? that.getViewCSS(conf) : null;

            if(css) {
                $("<link type='text/css' rel='stylesheet'>").attr("href", resolve(css + "#")).appendTo("head");
            }


            contextObj.use(script, function(obj) {
                that.setContextObj(obj);
                contextObj = that.getContextObj();
                doParse(parsed, conf);
                success.call(this, contextObj, parsed);

                defObj.resolveWith(this, [contextObj, parsed]);
            });
        }).fail(function(errObj) {

            error.apply(this, arguments);
            defObj.rejectWith(this, arguments);
        });

        function doParse(parsedObj, viewConf) {
            var contextObj = that.getContextObj();

            that.handleView(viewConf, contextObj);

            if(contextObj.isGenPage) {
                that.handleCallbacks(viewConf);
            }

            $.each(parsedObj.elems || [], function() {
                var elem = this,
                    target = elem.target,
                    name = elem.name,
                    viewId = elem.viewId,
                    provider = elem.provider;

                if(viewId) {
                    target[provider](viewConf[viewId] || {});
                } else {
                    target[provider](name ? parsedObj.uioptions[name] || {} : {});
                }
            });
        }

        return defObj.promise();
    }

    /**
     * **解析指定的dom元素及其子元素**
     *
     * @method parse
     * @param {object|string} context 需要解析的上下文dom元素
     * @param {function} success 解析完成的回调
     * @param {function} error 解析错误的回调
     * @return undefined
     */
    exports.parse = exports.director;
    /**
     * 重新设置页面高宽
     * @zhaozz  2015-12-22
     * @method resize
     * @param {number} _numHeadHeight header高度
     */
    exports.resize = function(_numHeadHeight){
        var numHeadHeight = _numHeadHeight||117,
            iframeHeight = $(top).height() - numHeadHeight;
        $(document.body).css({"height":iframeHeight,"overflow":"auto"});
        $(window).resize(function() {
            iframeHeight = $(top).height() - numHeadHeight;
            $(document.body).css("height",iframeHeight);
        });
    };

    //通用界面事件绑定
    $(document.body).off("click.generic")
        .on("click.generic","div.maximize-box",function(e){
            e.stopPropagation();
            e.preventDefault();
            var $dom = top.kjdp.getSelectedTab().children(),
                url = $dom.attr("src"),
                $target = $(e.currentTarget),
                screenTrigger = {
                    //窗口全屏
                    fullScreen: function(){
                        $dom.attr("height","99%");
                        top.kjdp.copyToMaxWin($dom.clone(true));
                    },
                    //窗口还原
                    reductScreen: function(){
                        top.kjdp.getSelectedTab().find("iframe").attr("src",url);
                        top.kjdp.$fScreenDialog.dialog("close");                        
                    }
                };  
            screenTrigger[$target.data("btnTrigger")].call();  
        });
});