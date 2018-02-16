const UNITS = ['B', 'K', 'M', 'G', 'T'];

const BASE = 1000;

module.exports = size => {
  const {floor, log, min, pow} = Math;
  const i = min(UNITS.length - 1, floor(log(size) / log(BASE)));
  const s = (size / pow(BASE, i)).toFixed(i && 1);
  return (new Array(6 - s.length)).join(' ') + s + UNITS[i];
};
