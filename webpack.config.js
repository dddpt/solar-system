const path = require("path");

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, "src/js/main.js"),
  output: {
    filename: "js/bundle.js"
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
