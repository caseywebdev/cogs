// test/cases/underscore-default/a.tmpl
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define('test/cases/underscore-default/a', ['jade', 'mustache', 'underscore'], factory);
  }
  if (typeof exports !== 'undefined') {
    module.exports = factory(require('jade'), require('mustache'), require('underscore'));
  }
  (root.JST || (root.JST = {}))['test/cases/underscore-default/a'] = factory(root['jade'], root['Mustache'], root['_']);
})(this, function (jade, Mustache, _) {
  return function(obj){
  var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
  __p+='<h1>hello</h1>\n';
}
return __p;
};
});
