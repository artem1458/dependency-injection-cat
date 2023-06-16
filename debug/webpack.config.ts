import HtmlWebpackPlugin from 'html-webpack-plugin';
import DICatWebpackPlugin from '../src/plugins/webpack';
// import tsTransformer from '../src/transformers/typescript';
import path from 'path';

module.exports = {
    context: __dirname,
    entry: './index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        compiler: 'ttypescript', //TTypescript is needed https://github.com/TypeStrong/ts-loader/issues/1615
                        // getCustomTransformers: (program: any) => ({
                        //     before: [tsTransformer(program)],
                        // }),
                    },
                }],
                exclude: /node_modules/,
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'webpack_bundled.js',
        path: path.resolve(__dirname, 'lib'),
    },

    plugins: [
        new HtmlWebpackPlugin({title: 'MyProject'}),
        new DICatWebpackPlugin(),
    ],

    devServer: {
        static: path.join(__dirname, 'lib'),
        port: 4000,
    },
};
