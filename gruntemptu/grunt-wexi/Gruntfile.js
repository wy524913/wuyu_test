/**
 * Created by hp on 2016/10/11.
 */
module.exports=function(grunt){
    require('time-grunt')(grunt);
    var config={
        app:'app',
        dist:'dist'
    };
    grunt.initConfig({
        config:config,
        copy:{
            dist:{
                src:"<%=config.app%>/index.html",
                dest:"<%=config.dist%>/index.html"
            }
        }
    });
}