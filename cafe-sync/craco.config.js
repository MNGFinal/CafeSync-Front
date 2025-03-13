module.exports = {
  devServer: (devServerConfig) => {
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      console.log("✅ Webpack Middleware 적용됨!");
      return middlewares;
    };
    return devServerConfig;
  },
};
