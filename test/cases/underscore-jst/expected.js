// test/cases/underscore-jst/a.jst.tmpl
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('test/cases/underscore-jst/a', [], factory);
  } else if (typeof exports !== 'undefined') {
    module.exports = factory();
  } else {
    (root.JST || (root.JST = {}))['test/cases/underscore-jst/a'] = factory();
  }
})(this, function () {
  return function(obj){
  var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
  __p+='<h1>hello</h1>\n';
}
return __p;
};
});
