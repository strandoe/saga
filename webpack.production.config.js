var path = require('path');
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var assign = require('lodash/assign');

const production = {
    entry: [
        'babel-polyfill',
        path.resolve(__dirname, 'src/app.js'),
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },

    resolve: {
        extensions: ['', '.js', '.jsx'],
    },

    devtool: 'source-map',

    plugins: [
        new HtmlWebpackPlugin({
            title: 'Min skatteside',
            template: 'src/html-template-prod.html', // Load a custom template
            inject: 'body', // Inject all scripts into the body
            hash: true,
        }),
        new webpack.DefinePlugin({
            'process.env': {
                // Useful to reduce the size of client-side libraries, e.g. react
                NODE_ENV: JSON.stringify('production')
            },
            __DEVELOPMENT__: false,
            __PRODUCTION__: true,
            __LOGLEVEL__: 4, // Error
        }),
        new webpack.NoErrorsPlugin(),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            output: { comments: false },
            compress: {
                warnings: false,
            },
            exclude: [ /\.min\.js$/gi ],
        }),
    ],

    postcss: [
        autoprefixer({
            browsers: ['> 5%', 'last 5 version', 'last 5 Chrome versions', 'Firefox >= 20', 'ie >= 10'],
        }),
    ],
};

module.exports = assign({}, production, { module: { loaders: require('./webpack.config').module.loaders } });
