import _ from 'underscore';

export default val => {
  if (val == null) return [];

  if (_.isArray(val)) return val;

  return [val];
};
