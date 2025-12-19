const path = require("path");

module.exports = {
  mode: 'development',
  entry: {
    "dist/js/bundle.js": path.resolve(__dirname, "src/ts/main.ts"),
    "demo/kepler/dist/js/bundle.js": path.resolve(__dirname, "demo/kepler/src/js/main.js")
  },
  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },
  output: {
    path: path.resolve(__dirname,"."),
    filename: "[name]"
  }
};
