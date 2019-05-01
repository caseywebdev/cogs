const UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];

const { floor, log, min, round } = Math;

const BASE = 1024;

module.exports = size => {
  const i = size ? min(UNITS.length - 1, floor(log(size) / log(BASE))) : 0;
  const s = (round((size / BASE ** i) * BASE) / BASE).toString().slice(0, 6);
  return new Array(7 - s.length).join(' ') + s + UNITS[i];
};
