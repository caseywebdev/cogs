
/* = require some-file
*/


/* = require-tree .
*/


/* = require-tree some-dir
*/


/* = require-self
*/


(function() {
  var a;

  a = function() {
    b(1);
    return 2;
  };

}).call(this);
