const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const JS_BASE = "./src/client/js/";

module.exports = {
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  mode: "development", // "production" | "development" | "none",
  entry: {
    main: JS_BASE + "main.js",
    videoPlayer: JS_BASE + "videoPlayer.js",
    recorder: JS_BASE + "recorder.js",
    commentSection: JS_BASE + "commentSection.js",
  },
  watch: true,
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [["@babel/preset-env", { targets: "defaults" }]],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          //   "style-loader",
          MiniCssExtractPlugin.loader,
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
    ],
  },
};
