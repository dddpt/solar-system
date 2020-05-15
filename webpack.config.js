const path = require("path");

module.exports = {
  mode: 'development',
  entry: {
    "dist/js/bundle.js": path.resolve(__dirname, "src/js/main.js"),
    "demo/kepler/dist/js/bundle.js": path.resolve(__dirname, "demo/kepler/src/js/main.js")
  },
  output: {
    path: path.resolve(__dirname,"."),
    filename: "[name]"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["babel-preset-env"]
          }
        }
      }
    ]
  }
};
