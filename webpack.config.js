const webpack = require("webpack");

const isDev = process.env.BUILD_TYPE && process.env.BUILD_TYPE.trim() === "dev";

const config = require(`./config`);

const CompressionPlugin = require('compression-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const entry = [ './app/app.js' ];

const plugins = [
  new webpack.DefinePlugin({
    __API_HOST__: JSON.stringify(config.api.host),
    __API_PORT__: JSON.stringify(config.api.port),
    __LOGIN__: JSON.stringify(config.site.login_url),
    __SITE_TITLE__: JSON.stringify(config.site.title)
  }),
  new HtmlWebpackPlugin({
    template: './app/index.html'
  })
];

let filename = "assets/[name].[chunkhash].js";

let optimization = {};

if (isDev) {
  entry.unshift('webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000&reload=true');
  plugins.push(new webpack.HotModuleReplacementPlugin());
  plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'server',
    analyzerPort: '3003',
    generateStatsFile: true,
    statsOptions: { source: false }
  }));
  filename = "assets/bundle.js";
} else {
  plugins.push(new CompressionPlugin({
    filename: '[path].gz[query]',
    algorithm: 'gzip',
    test: /\.js$|\.css$|\.html$|\.eot?.+$|\.ttf?.+$|\.woff?.+$|\.svg?.+$/,
    threshold: 10240,
    minRatio: 0.8
  }));
  optimization.splitChunks = {
    cacheGroups: {
      commons: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      }
    }
  };
}

module.exports = {
  mode: isDev ? "development" : "production",
  context: __dirname,
  entry,
  output: {
    filename,
    path: __dirname + '/public',
    publicPath: "/"
  },
  devtool: isDev ? '#source-map' : '',
  optimization: {
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules)/,
        loader: "babel-loader",
        options: {
          presets: [
            "@babel/env",
            "@babel/react",
            {
              plugins: ["@babel/proposal-class-properties"]
            }
          ]
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'sass-loader'
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: 'file-loader'
      }
    ]
  },
  plugins
};