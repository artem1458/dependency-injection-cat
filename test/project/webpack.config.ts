const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const DICatWebpackPlugin = require('../../src/plugins/webpack/ReportDiErrors').default;

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.ts'],
        plugins: [new TsconfigPathsPlugin()]
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            // {
            //     test: /\.ts$/,
            //     loader: 'ts-loader',
            //     options: {
            //         compiler: 'ttypescript',
            //         // getCustomTransformers: (program) => ({
            //         //     before: [diCatTsTransformer(program, {
            //         //     })],
            //         // }),
            //         transpileOnly: false,
            //     }
            // }
            {
                test: /\.(t|j)s$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        '@babel/plugin-transform-runtime',
                        '@babel/plugin-proposal-class-properties',
                        [
                            '@babel/plugin-proposal-decorators',
                            { 'legacy': true }
                        ],
                        [
                            require('../../src/transformers/babel'),
                        ]
                    ],
                    presets: [
                        '@babel/preset-env',
                        '@babel/preset-typescript',
                    ]
                }
            }
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(),
        new DICatWebpackPlugin(),
    ]
};
