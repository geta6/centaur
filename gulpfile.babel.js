import 'babel-polyfill';
import fs from 'fs';
import path from 'path';
import gulp from 'gulp';
import load from 'gulp-load-plugins';
import ncp from 'ncp';
import rimraf from 'rimraf';
import mkdirp from 'mkdirp';
import chokidar from 'chokidar';
import runSequence from 'run-sequence';
import express from 'express';
import browserSync from 'browser-sync';
import errorOverlayMiddleware from 'react-dev-utils/errorOverlayMiddleware';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import webpackConfig from './webpack.config.babel';
import pkg from './package.json';

let app;
let watch;
let server;

const $ = Object.assign(load(), {
  run: (...tasks) => new Promise((resolve) => runSequence(...tasks, resolve)),
  copy: (src, dst) => new Promise((resolve, reject) => ncp(src, dst, (reason) => (reason ? reject(reason) : resolve()))),
  write: (dst, data) => new Promise((resolve, reject) => fs.writeFile(dst, data, (reason) => (reason ? reject(reason) : resolve()))),
  rmdir: (glob) => new Promise((resolve, reject) => rimraf(glob, (err) => (err ? reject(err) : resolve()))),
  mkdir: (dst) => new Promise((resolve, reject) => mkdirp(dst, (reason) => (reason ? reject(reason) : resolve()))),
});

/**
 * Cleans up the output directory.
 */
gulp.task('clean', async () => {
  await $.rmdir('tmp/build');
  await $.mkdir('tmp/build/public');
});

/**
 * Copies static files to the output directory.
 */
gulp.task('copy', async () => {
  await Promise.all([
    $.copy('.node-version', 'tmp/build/.node-version'),
    $.copy('src/public', 'tmp/build/public'),
    // $.copy('etc/app', 'tmp/build/config'),
    $.copy('yarn.lock', 'tmp/build/yarn.lock'),
  ]);

  await $.write('tmp/build/package.json', JSON.stringify({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    private: pkg.private,
    engines: pkg.engines,
    engineStrict: pkg.engineStrict,
    dependencies: pkg.dependencies,
    scripts: {
      start: `pm2 startOrReload config/${process.env.NODE_ENV}.json && pm2 save`,
      stop: 'pm2 kill',
    },
  }, '', 2));

  if (watch || process.argv.includes('--watch')) {
    const watch = chokidar.watch(['src/public/**'], { ignoreInitial: true });
    const change = async (file) => {
      const src = path.relative('./', file);
      const dst = path.join(__dirname, 'tmp', 'build', path.relative('src', src));
      await $.mkdir(path.dirname(dst));
      await $.copy(src, dst);
      $.util.log(`Update file ${$.util.colors.green(src)}`);
    };
    const unlink = async (file) => {
      const src = path.relative('./', file);
      const dst = path.join(__dirname, 'tmp', 'build', path.relative('src', src));
      await $.rmdir(dst);
      $.util.log(`Remove file ${$.util.colors.magenta(src)}`);
    };
    watch.on('add', change);
    watch.on('change', change);
    watch.on('unlink', unlink);
    watch.on('unlinkDir', unlink);
  }
});

/**
 * Creates application bundles from the source files.
 */
gulp.task('bundle', async () => {
  $.util.log(`Building source for ${$.util.colors.green(process.env.NODE_ENV)}`);
  const config = webpackConfig();
  await new Promise((resolve, reject) => {
    webpack(config).run((err, stats) => {
      if (err) return reject(err);
      $.util.log(stats.toString(config[0].stats));
      return setTimeout(resolve, 1000);
    });
  });
});

/**
 * Compiles the project from source files into a distributable
 * format and copies it to the output directory.
 */
gulp.task('build', async () => {
  await $.run('clean', 'copy', 'bundle');
});

/**
 * Launches a development web server with "live reload" functionality -
 * synchronizing URLs, interactions and code changes across multiple devices.
 */
gulp.task('start', async () => {
  if (server) return server;

  watch = true;

  const watchOptions = {
    ignored: /node_modules/,
  };

  const createCompilationPromise = (name, compiler, config) => new Promise((resolve, reject) => {
    compiler.plugin('compile', () => $.util.log(`Compiling ${$.util.colors.cyan(name)}...`));
    compiler.plugin('done', (stats) => {
      $.util.log(stats.toString(config.stats));
      if (stats.hasErrors()) {
        $.util.log(`Failed to compile ${$.util.colors.magenta(name)}`);
        reject(new Error('Compilation failed!'));
      } else {
        $.util.log(`Finished ${$.util.colors.green(name)} compilation`);
        resolve(stats);
      }
    });
  });

  const checkForUpdate = (fromUpdate) => {
    if (!app.hot) throw new Error('Hot Module Replacement is disabled.');
    if (app.hot.status() !== 'idle') return Promise.resolve();
    return app.hot.check(true).then((updatedModules) => {
      if (!updatedModules) return fromUpdate && $.util.log($.util.colors.green('Update applied.'));
      if (updatedModules.length === 0) {
        $.util.log('Nothing hot updated.');
      } else {
        $.util.log('Updated modules:');
        updatedModules.forEach((moduleId) => $.util.log(`  ${$.util.colors.cyan(moduleId)}`));
        checkForUpdate(true);
      }
    }).catch((error) => {
      if (['abort', 'fail'].includes(app.hot.status())) {
        $.util.log('Cannot apply update.');
        delete require.cache[require.resolve('./tmp/build/server')];
        app = require('./tmp/build/server').default; // eslint-disable-line import/no-unresolved
        $.util.log('App has been reloaded.');
      } else {
        $.util.log(`Update failed: ${error.stack || error.message}`);
      }
    });
  };

  server = express();
  server.use(errorOverlayMiddleware());
  server.use(express.static(path.resolve(__dirname, 'src', 'public')));

  const config = webpackConfig();

  const clientConfig = config.find((config) => config.name === 'client');
  clientConfig.entry.client = ['../lib/WebpackHotClient.js'].concat(clientConfig.entry.client).sort((a, b) => b.includes('polyfill') - a.includes('polyfill'));
  clientConfig.output.filename = clientConfig.output.filename.replace('chunkhash', 'hash');
  clientConfig.output.chunkFilename = clientConfig.output.chunkFilename.replace('chunkhash', 'hash');
  clientConfig.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin(), new webpack.NamedModulesPlugin());

  const serverConfig = config.find(({ name }) => name === 'server');
  serverConfig.output.hotUpdateMainFilename = 'updates/[hash].hot-update.json';
  serverConfig.output.hotUpdateChunkFilename = 'updates/[id].[hash].hot-update.js';
  serverConfig.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin(), new webpack.NamedModulesPlugin());

  await $.run('clean', 'copy');

  const multiCompiler = webpack(config);
  const clientCompiler = multiCompiler.compilers.find((compiler) => compiler.name === 'client');
  const serverCompiler = multiCompiler.compilers.find((compiler) => compiler.name === 'server');
  const clientPromise = createCompilationPromise('client', clientCompiler, clientConfig);
  const serverPromise = createCompilationPromise('server', serverCompiler, serverConfig);
  server.use(webpackDevMiddleware(clientCompiler, { publicPath: clientConfig.output.publicPath, quiet: true, watchOptions }));
  server.use(webpackHotMiddleware(clientCompiler, { log: false }));
  server.use((req, res) => app.handle(req, res));

  serverCompiler.watch(watchOptions, (error, stats) => app && !error && !stats.hasErrors() && checkForUpdate());
  await Promise.all([clientPromise, serverPromise]);
  app = require('./tmp/build/server').default; // eslint-disable-line import/no-unresolved
  await new Promise((resolve, reject) => {
    browserSync.create().init({
      port: process.env.PORT,
      server: 'src/server.js',
      middleware: [server],
      open: !process.argv.includes('--silent'),
      ui: false,
      notify: false,
    }, (error, bs) => (error ? reject(error) : resolve(bs)));
  });
});
