export default val => {
  if (val == null) return [];

  if (Array.isArray(val)) return val;

  return [val];
};
