const UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];

const {floor, log, min, pow, round} = Math;

module.exports = size => {
  const i = size ? min(UNITS.length - 1, floor(log(size) / log(1000))) : 0;
  const s = (round((size / pow(1000, i)) * 1000) / 1000).toString().slice(0, 5);
  return (new Array(6 - s.length)).join(' ') + s + UNITS[i];
};
