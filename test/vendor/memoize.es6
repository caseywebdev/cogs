export default function (fn) {
  var cache = {};
  return function (arg) {
    if (arg in cache) return cache[arg];
    return fn.apply(this, arguments);
  };
}
