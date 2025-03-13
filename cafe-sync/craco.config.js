module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      if (webpackConfig.devServer) {
        webpackConfig.devServer.setupMiddlewares = (middlewares, devServer) => {
          console.log("✅ Webpack Middleware 적용됨!");
          return middlewares;
        };
      }
      return webpackConfig;
    },
  },
};
