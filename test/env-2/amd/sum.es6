export default function () {
  return [].reduce.call(arguments, function (sum, n) { return sum + n; }, 0);
}
