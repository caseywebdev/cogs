/** @param {string} path */
export const getExt = path => path.match(/\.[^/\\]*$/)?.[0] ?? '';
