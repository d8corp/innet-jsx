;(function () {
  const env = {"INNETJS_JSX_PACKAGE_VERSION":"2.0.0"};
  if (typeof process === 'undefined') {
    globalThis.process = { env: env };
  } else if (process.env) {
    Object.assign(process.env, env);
  } else {
    process.env = env;
  }
})();
