import 'babel-polyfill';
import path from 'path';
import webpack from 'webpack';
import webpackMerge from 'webpack-merge';
import nodeExternals from 'webpack-node-externals';
import AssetsPlugin from 'assets-webpack-plugin';
import nib from 'nib';
import Environment from './lib/Environment';
import pkg from './package.json';

export default () => {
  const DEBUG = process.env.NODE_ENV !== 'production';
  const VERBOSE = process.argv.includes('--verbose');
  const GLOBALS = Environment.load({}, typeof process.env.NODE_ENV !== 'undefined');
  const CONFIG = {
    context: path.resolve(__dirname, 'src'),

    output: {
      path: path.resolve(__dirname, 'tmp', 'build', 'public'),
      pathinfo: false,
      publicPath: '/',
      filename: DEBUG ? '[name].js' : '[name].[chunkhash:8].js',
      chunkFilename: DEBUG ? '[name].chunk.js' : '[name].[chunkhash:8].chunk.js',
      devtoolModuleFilenameTemplate: (info) => path.resolve(info.absoluteResourcePath),
    },

    resolve: {
      modules: ['node_modules', 'src'],
    },

    module: {
      strictExportPresence: true,

      rules: [{
        test: /\.styl$/,
        include: path.resolve(__dirname, 'src'),
        use: [{
          loader: 'isomorphic-style-loader',
        }, {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            sourceMap: DEBUG,
            modules: true,
            minimize: DEBUG ? false : { discardComments: { removeAll: true } },
            localIdentName: DEBUG ? '[name]-[local]-[hash:base64:5]' : '[hash:base64:5]',
          },
        }, {
          loader: 'stylus-loader',
          options: {
            use: [nib()],
            import: ['~nib/index'],
          },
        }],
      }, {
        test: /\.json$/,
        include: [path.join(__dirname, 'src')],
        use: [{
          loader: 'json-loader',
        }],
      }, {
        test: /\.md$/,
        include: [path.join(__dirname, 'src')],
        use: [{
          loader: 'html-loader',
        }, {
          loader: 'markdown-loader',
        }],
      }, {
        test: /\.svg$/,
        include: [path.join(__dirname, 'src')],
        use: [{
          loader: 'svg-inline-loader',
        }],
      }, {
        test: /\.[vf]sh$/,
        include: [path.join(__dirname, 'src')],
        use: [{
          loader: 'shader-loader',
        }],
      }, {
        test: /\.(png|jpe?g|gif)$/,
        include: [path.join(__dirname, 'src')],
        use: [{
          loader: 'url-loader',
          options: {
            limit: 1000,
            name: DEBUG ? '[path][name].[ext]?[hash:8]' : '[hash:8].[ext]',
          },
        }],
      }],
    },

    bail: !DEBUG,

    cache: DEBUG,

    stats: {
      cached: VERBOSE,
      cachedAssets: VERBOSE,
      chunks: VERBOSE,
      chunkModules: VERBOSE,
      colors: true,
      hash: VERBOSE,
      modules: VERBOSE,
      reasons: DEBUG,
      timings: true,
      version: VERBOSE,
    },

    devtool: DEBUG ? 'cheap-module-inline-source-map' : 'source-map',
  };

  return [
    // client
    webpackMerge.smart(CONFIG, {
      name: 'client',
      target: 'web',
      entry: { client: ['babel-polyfill', './client.js'] },

      module: {
        rules: [{
          test: /\.jsx?$/,
          include: path.resolve(__dirname, 'src'),
          loader: 'babel-loader',
          options: {
            cacheDirectory: DEBUG ? path.resolve(__dirname, 'tmp', 'caches', 'babel-client') : false,
            babelrc: false,
            presets: [
              ['env', { targets: { browsers: pkg.browserslist, forceAllTransforms: true }, modules: false, useBuiltIns: false, debug: false }],
              ['react', { development: DEBUG }],
            ],
            plugins: [
              'transform-decorators-legacy',
              'transform-class-properties',
              'transform-object-rest-spread',
              ...(DEBUG ? [] : ['transform-react-constant-elements']),
              ...(DEBUG ? [] : ['transform-react-inline-elements']),
              ...(DEBUG ? [] : ['transform-react-remove-prop-types']),
            ],
          },
        }],
      },

      plugins: [
        new webpack.DefinePlugin(Object.assign({}, GLOBALS)),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ja/),
        new AssetsPlugin({ path: path.resolve(__dirname, 'tmp', 'build'), filename: 'assets.json', prettyPrint: true }),
        new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', minChunks: (module) => /node_modules/.test(module.resource) }),
        ...DEBUG ? [] : [new webpack.optimize.ModuleConcatenationPlugin()],
        ...DEBUG ? [] : [new webpack.optimize.UglifyJsPlugin({
          sourceMap: true,
          compress: { screw_ie8: true, warnings: VERBOSE, unused: true, dead_code: true },
          mangle: { screw_ie8: true },
          output: { comments: false, screw_ie8: true },
        })],
      ],

      node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
      },
    }),

    // server
    webpackMerge.smart(CONFIG, {
      name: 'server',
      target: 'node',
      entry: { server: ['babel-polyfill', './server.js'] },

      output: {
        path: path.resolve(__dirname, 'tmp', 'build'),
        filename: '[name].js',
        chunkFilename: 'chunks/[name].js',
        libraryTarget: 'commonjs2',
      },

      module: {
        rules: [{
          test: /\.jsx?$/,
          include: path.resolve(__dirname, 'src'),
          loader: 'babel-loader',
          options: {
            cacheDirectory: DEBUG ? path.resolve(__dirname, 'tmp', 'caches', 'babel-server') : false,
            babelrc: false,
            presets: [
              ['env', { targets: { node: pkg.engines.node.match(/(\d+\.?)+/)[0], forceAllTransforms: true }, modules: false, useBuiltIns: false, debug: false }],
              ['react', { development: DEBUG }],
            ],
            plugins: [
              'transform-decorators-legacy',
              'transform-class-properties',
              'transform-object-rest-spread',
              ...(DEBUG ? [] : ['transform-react-constant-elements']),
              ...(DEBUG ? [] : ['transform-react-inline-elements']),
              ...(DEBUG ? [] : ['transform-react-remove-prop-types']),
            ],
          },
        }],
      },

      externals: [
        './assets.json',
        nodeExternals(),
      ],

      plugins: [
        new webpack.DefinePlugin(Object.assign({}, GLOBALS)),
        new webpack.BannerPlugin({ banner: 'require("source-map-support").install();', raw: true, entryOnly: false }),
      ],

      node: {
        console: false,
        global: false,
        process: false,
        Buffer: false,
        __filename: false,
        __dirname: false,
      },
    }),
  ];
};
