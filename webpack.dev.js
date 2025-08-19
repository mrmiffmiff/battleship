const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = merge(common, {
    mode: "development",
    plugins: [
        new ESLintPlugin({
            emitWarning: true,
            failOnWarning: false,
            emitError: true, // Could potentially set this to false if the errors are getting too aggressive
            failOnError: false,
        }),
    ],
    devtool: "eval-source-map",
    devServer: {
        watchFiles: ["./src/template.html"],
    },
});