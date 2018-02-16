const UNITS = ['B', 'K', 'M', 'G', 'T'];

const BASE = 1000;

module.exports = size => {
  const i = Math.min(
    UNITS.length - 1,
    Math.floor(Math.log(size) / Math.log(BASE))
  );
  return (size / Math.pow(BASE, i)).toFixed(1) + UNITS[i];
};
