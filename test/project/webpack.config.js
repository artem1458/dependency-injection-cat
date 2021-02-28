const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const ReportDiErrorsPlugin = require('dependency-injection-cat/plugins/webpack/ReportDiErrors').default;
// const diCatTsTransformer = require('dependency-injection-cat/transformers/typescript').default;

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
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: 'awesome-typescript-loader',
                options: {
                    compiler: 'ttypescript',
                    // getCustomTransformers: (program) => ({
                    //     before: [diCatTsTransformer(program, {
                    //         compiledContextOutputDir: './compiled-context',
                    //     })],
                    // }),
                    // transpileOnly: false,
                }
            }
            // {
            //     test: /\.(t|j)s$/,
            //     exclude: /(node_modules|bower_components)/,
            //     use: {
            //         loader: 'babel-loader',
            //         options: {
            //             plugins: [
            //                 [
            //                     require('dependency-injection-cat/transformers/babel'),
            //                     {
            //                         "compiledContextOutputDir": "./compiled-context"
            //                     }
            //                 ]
            //             ],
            //             presets: ['@babel/preset-env', '@babel/preset-typescript']
            //         }
            //     }
            // }
        ],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin(),
        new ReportDiErrorsPlugin(),
    ]
};
