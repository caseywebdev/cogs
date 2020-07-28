export default obj => {
  const val = {};
  const keys = Object.keys(obj).sort();
  for (let i = 0, l = keys.length; i < l; ++i) val[keys[i]] = obj[keys[i]];
  return val;
};
