const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const path = require("path");

module.exports = {
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3080'
      },
    }
  },
  configureWebpack: {
    plugins: [
      new MonacoWebpackPlugin({
        languages: ["javascript"],
      })
    ],
  }
};
