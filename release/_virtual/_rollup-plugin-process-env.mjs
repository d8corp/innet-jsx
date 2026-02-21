;(function () {
  const env = {"__INNETJS_JSX__PACKAGE_VERSION":"2.0.8"};
  if (typeof process === 'undefined') {
    globalThis.process = { env: env };
  } else if (process.env) {
    Object.assign(process.env, env);
  } else {
    process.env = env;
  }
})();
