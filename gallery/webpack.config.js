const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpackBase = require("../build-scripts/webpack.js");
const { babelLoaderConfig } = require("../build-scripts/babel.js");

const isProd = process.env.NODE_ENV === "production";
const chunkFilename = isProd ? "chunk.[chunkhash].js" : "[name].chunk.js";
const buildPath = path.resolve(__dirname, "dist");
const publicPath = isProd ? "./" : "http://localhost:8080/";
const latestBuild = true;

const rules = [
  {
    exclude: [path.resolve(__dirname, "../node_modules")],
    test: /\.ts$/,
    use: [
      {
        loader: "ts-loader",
        options: {
          compilerOptions: latestBuild
            ? { noEmit: false }
            : {
                target: "es5",
                noEmit: false,
              },
        },
      },
    ],
  },
  {
    test: /\.css$/,
    use: "raw-loader",
  },
  {
    test: /\.(html)$/,
    use: {
      loader: "html-loader",
      options: {
        exportAsEs6Default: true,
      },
    },
  },
];

if (!latestBuild) {
  rules.push(babelLoaderConfig({ latestBuild }));
}

module.exports = {
  mode: isProd ? "production" : "development",
  // Disabled in prod while we make 牧养犬 able to serve the right files.
  // Was source-map
  devtool: isProd ? "none" : "inline-source-map",
  entry: "./src/entrypoint.js",
  module: {
    rules,
  },
  optimization: webpackBase.optimization(latestBuild),
  plugins: [
    new CopyWebpackPlugin([
      "public",
      { from: "../public", to: "static" },
      { from: "../build-translations/output", to: "static/translations" },
      {
        from: "../node_modules/leaflet/dist/leaflet.css",
        to: "static/images/leaflet/",
      },
      {
        from: "../node_modules/roboto-fontface/fonts/roboto/*.woff2",
        to: "static/fonts/roboto/",
      },
      {
        from: "../node_modules/leaflet/dist/images",
        to: "static/images/leaflet/",
      },
    ]),
  ].filter(Boolean),
  resolve: webpackBase.resolve,
  output: {
    filename: "[name].js",
    chunkFilename: chunkFilename,
    path: buildPath,
    publicPath,
  },
  devServer: {
    contentBase: "./public",
  },
};
