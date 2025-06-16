const path = require("path");
const { merge } = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const common = require("./webpack.common");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const rootPath = path.resolve(__dirname, "./../../");

module.exports = merge(common, {
  mode: "development",
  devtool: "inline-source-map",
  devServer: {
    static: {
      directory: path.resolve(rootPath, "./assets"),
    },
    hot: true,
    client: {
      overlay: false, // 关闭错误覆盖
      logging: "warn",
    },
    open: true,
    proxy: [
      {
        context: [
          "/api/harmony-module/miniapp/preview",
          "/api/harmony-module/miniapp/publish",
          "/api/harmony-module/miniapp/compile",
          "/api/harmony-module/harmony/compile",
          "/api/harmony-module/publish",
          "/api/harmony-module/getModule",
          "/api/harmony-module/loadPage",
          "/api/harmony-module/alipay/preview",
          "/api/harmony-module/alipay/publish",
          "/api/harmony-module/alipay/compile",
          "/api/harmony-module/h5/publish",
          "/api/harmony-module/h5/preview",
          "/api/harmony-module/download",
          "/api/harmony-module/queryFiles",
          "/api/harmony-module/getMybricksConfig",
          "/api/harmony-module/cpu",
          "/api/harmony-module/wx/test",
          "/api/harmony-module/miniapp/searchUser"
        ],
        target: "http://localhost:3000",
        secure: false,
        changeOrigin: true,
      },
      // {
      //   context: ['/mybricks-app-harmony-module/api'],
      //   pathRewrite: { '^/mybricks-app-harmony-module/api': '/api' },
      //   target: 'http://localhost:3000',
      //   secure: false,
      //   changeOrigin: true,
      // },
      {
        context: [
          '/paas/api/project/service/push',
          '/paas/api/project/download',
        ],
        target: 'https://my.mybricks.world',
        // target: 'http://127.0.0.1:3100',
        secure: false,
        changeOrigin: true,
      },
      {
        context: [
          '/runtime/service',
        ],
        pathRewrite: {
          '^/runtime/service': '/service', // 重写路径
        },
        // target: 'http://127.0.0.1:3106',
        target: 'https://my.mybricks.world',
        secure: false,
        changeOrigin: true,
      },
      {
        context: ["/"],
        // target: 'https://admin.alialumni.com',
        // target: 'http://118.31.0.78',
        target: "https://my.mybricks.world",
        // target:"https://build.zidayun.com",
        // target: "https://test.mybricks.world",
        // target: "http://work.manateeai.com",
        // target: 'https://www.hzao.com.cn',
        // target: 'http://127.0.0.1:3100',
        secure: false,
        changeOrigin: true
      },
      // {
      //   context: [
      //     '/paas/api/serviceProject/push',
      //     '/paas/api/serviceProject/download'
      //   ],
      //   // target: 'https://admin.alialumni.com',
      //   target: 'http://127.0.0.1:3100',
      //   secure: false,
      //   changeOrigin: true,
      // },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "../assets/index.html"),
      chunks: ["index"],
      hot: true,
    }),
    new HtmlWebpackPlugin({
      filename: 'setting.html',
      template: path.resolve(__dirname, '../assets/setting.html'),
      chunks: ['setting'],
    }),
    new webpack.DefinePlugin({
      APP_ENV: JSON.stringify('production')
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, "../public"), to: "public" },
      ],
    }),
  ],
});
