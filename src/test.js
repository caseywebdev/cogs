import('kiss-test').then(({ default: kissTest }) =>
  kissTest({ patterns: process.argv.slice(2) })
);
