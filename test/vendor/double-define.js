define('internal', function () {
  // I'm used internally.
});

define(['internal'], function () {
  // I should be 'double-define';
});
