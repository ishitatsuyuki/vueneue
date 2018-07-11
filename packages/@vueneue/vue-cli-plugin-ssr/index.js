const definePlugin = require('./webpack/definePlugin');

module.exports = api => {
  api.chainWebpack(config => {
    // Change main entry
    config.entryPoints
      .get('app')
      .clear()
      .add(require.resolve('@vueneue/ssr-core/client'));
  });

  api.configureWebpack(() => {
    // Add required process vars for Vueneue (for SPA mode only)
    const defines = definePlugin();
    defines.__vueneue = true;
    return {
      plugins: [defines],
    };
  });

  api.service.projectOptions.transpileDependencies.push(/@vueneue\/ssr-core/);

  require('./commands/serve')(api, api.service.projectOptions);
  require('./commands/build')(api, api.service.projectOptions);
  require('./commands/start')(api, api.service.projectOptions);
  require('./commands/generate')(api, api.service.projectOptions);
};

module.exports.defaultModes = {
  'ssr:serve': 'development',
  'ssr:build': 'production',
  'ssr:start': 'production',
};
