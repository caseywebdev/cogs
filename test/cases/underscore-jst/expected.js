// test/cases/underscore-jst/a.jst.tmpl
(window.jst || (window.jst = {}))['underscore-jst/a'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<h1>hello</h1>\n';
}
return __p;
};
