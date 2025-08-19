const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = merge(common, {
    mode: "production",
    plugins: [
        new ESLintPlugin({
            emitWarning: true,
            failOnWarning: false,
            emitError: true,
            failOnError: true,
        })
    ],
    devtool: 'source-map',
});