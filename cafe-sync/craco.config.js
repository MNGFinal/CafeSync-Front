module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      console.log("✅ Custom Webpack Config Loaded! 🚀");
      return webpackConfig;
    },
  },
};
