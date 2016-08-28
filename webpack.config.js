var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var autoprefixer = require('autoprefixer');

module.exports = {
    entry: [
        'babel-polyfill',
        'webpack-hot-middleware/client',
        path.resolve(__dirname, 'src/app.js'),
    ],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoErrorsPlugin(),

        new HtmlWebpackPlugin({
            title: 'Min skatteside',
            template: 'src/html-template.html', // Load a custom template
            inject: 'body', // Inject all scripts into the body
            hash: true,
        }),
        new webpack.DefinePlugin({
            __DEVELOPMENT__: true,
            __PRODUCTION__: false,
            __LOGLEVEL__: 1, // Debug
        }),
    ],

    resolve: {
        extensions: ['', '.js', '.jsx'],
    },

    devtool: 'cheap-module-eval-source-map',

    noInfo: true,

    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react'],
                },
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader!postcss-loader',
            },
            {
                test: /\.sass/,
                loader: 'style-loader!css-loader!sass-loader!postcss-loader?outputStyle=expanded&indentedSyntax',
            },
            {
                test: /\.scss/,
                loader: 'style-loader!css-loader!sass-loader!postcss-loader?outputStyle=expanded',
            },
            {
                test: /\.less/,
                loader: 'style-loader!css-loader!less-loader!postcss-loader',
            },
            {
                test: /\.(png|jpg|gif)$/,
                loader: 'url-loader?limit=8192',
            },
            { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff' },
            { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader' },
        ],
    },

    postcss: [
        autoprefixer({
            browsers: ['> 5%', 'last 5 version', 'last 5 Chrome versions', 'Firefox >= 20', 'ie >= 10'],
        }),
    ],
};
