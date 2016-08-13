/**
 * Created by hp on 2016/7/13.
 */
define(function(require, exports, module) {

    var $ = require("./jquery"),
        BUI = require("./jquery.blockUI"),
        loding = require("./jquery.loading"),
        validatengine=require("./jquery.validationEngine"),
        validatengineZH=require("./jquery.validationEngine-zh_CN");


    return {
        jQuery: $,
        BUI: BUI,
        loding: loding,
        validatengine:validatengine,
        parser: require("./parser"),
        utils: require("./utils"),
        Backbone: require("./backbone")
    };
});