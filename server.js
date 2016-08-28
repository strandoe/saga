/*eslint no-console:0 */
var localhost = '127.0.0.1';
// var localhostEkstern = '192.168.183.133';
var host = localhost;
var config = require('./webpack.config');
var proxyMiddleware = require('http-proxy-middleware');
var apiProxy = proxyMiddleware('/api', {target: 'http://' + host + ':9900/mss'});
var aapenApiProxy = proxyMiddleware('/skattekalkulator/api', {target: 'http://' + host + ':8005'});
var mssProxy = proxyMiddleware('/mss', {target: 'http://' + host + ':9900/'});

var browserSync = require('browser-sync');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var bundler = webpack(config);

// Run Browsersync and use middleware for Hot Module Replacement
browserSync({
    server: {
        baseDir: 'app',

        middleware: [
            apiProxy,
            mssProxy,
            aapenApiProxy,
            //browserSyncProxy,
            webpackDevMiddleware(bundler, {
                // Dev middleware can't access config, so we provide publicPath
                publicPath: config.output.publicPath,

                // pretty colored output
                stats: { colors: true },

                // Set to false to display a list of each file that is being bundled.
                noInfo: true

                // for other settings see
                // http://webpack.github.io/docs/webpack-dev-middleware.html
            }),

            // bundler should be the same as above
            webpackHotMiddleware(bundler)
        ]
    },

    // no need to watch '*.js' here, webpack will take care of it for us,
    // including full page reloads if HMR won't work
    files: [
        'app/*.html'
    ]
});
