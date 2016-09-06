/*eslint no-console:0 */
var config = require('./webpack.config');

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
