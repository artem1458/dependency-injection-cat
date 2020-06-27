const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const testTransformer = require('./test-transformer').default;

module.exports = {
    entry: './index.ts',
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx', '.ts', '.tsx'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            // {
            //     test: /\.(js|ts)$/,
            //     loader: 'babel-loader',
            // },
            {
                test: /\.ts$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
                options: {
                    getCustomTransformers: (program) => ({
                        before: [testTransformer]
                    })
                }
            },
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(),
    ]
};
