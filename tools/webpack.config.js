const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env) {
    const distFolder = path.join(path.dirname(__dirname), 'dist', env.platform);

    return {
        context: path.join(path.dirname(__dirname), 'src'),
        entry: {
            background: './background/background.js',
            content: './content.js',
            options: './options/options.js',
            popup: './popup/popup.js'
        },
        output: {
            path: path.join(distFolder, 'bundle'),
            filename: '[name].js'
        },
        plugins: [
            new CopyWebpackPlugin([{
                from: 'vendor',
                to: path.join(distFolder, 'vendor')
            }, {
                from: 'popup',
                to: path.join(distFolder, 'popup')
            }, {
                from: 'options',
                to: path.join(distFolder, 'options')
            }, {
                from: 'background',
                to: path.join(distFolder, 'background')
            }], {
                ignore: ['*.js']
            }),
            new webpack.DefinePlugin({
                PLATFORM_EDGE: env.platform === 'edge',
                PLATFORM_OPERA: env.platform === 'opera',
                PLATFORM_CHROME: env.platform === 'chrome',
                PLATFORM_FIREFOX: env.platform === 'firefox'
            }),
            new webpack.optimize.ModuleConcatenationPlugin()
        ]
    };
};
