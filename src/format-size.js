const UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];

const { floor, log, min, round } = Math;

const BASE = 1024;

export default size => {
  const i = size ? min(UNITS.length - 1, floor(log(size) / log(BASE))) : 0;
  const s = (round((size / BASE ** i) * BASE) / BASE).toPrecision(4);
  return new Array(6 - s.length).join(' ') + s + UNITS[i];
};
