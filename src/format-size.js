const UNITS = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];

const { floor, log, min, round } = Math;

module.exports = size => {
  let i = size ? min(UNITS.length - 1, floor(log(size) / log(1024))) : 0;
  let s = round(size / 1024 ** i).toString();

  // Round 1000B - 1023B to 1K to keep it <= 4 characters.
  if (s.length > 3) {
    s = '1';
    i += 1;
  }

  return new Array(4 - s.length).join(' ') + s + UNITS[i];
};
