import * as path from 'path';
import * as fs from 'fs';
import * as webpack from 'webpack';

const UglifyJSPlugin: any = require('uglifyjs-webpack-plugin');

const pkg = JSON.parse(fs.readFileSync('./package.json').toString());

export default {
    entry: {
        'bundles/serializer.umd': path.join(__dirname, 'src', 'index.ts'),
        'bundles/serializer.umd.min': path.join(__dirname, 'src', 'index.ts'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'serializer'
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'tslint-loader?emitErrors=true&failOnHint=true',
            exclude: /node_modules/,
            enforce: 'pre'
        }, {
            test: /\.ts$/,
            loader: 'ts-loader?configFileName=tsconfig.prod.json',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    plugins: [
        new UglifyJSPlugin({
            include: /\.min\.js$/,
            sourceMap: true
        }),
        new webpack.BannerPlugin({
            banner: `
/**
 * ${pkg.name} - ${pkg.description}
 * @version v${pkg.version}
 * @author ${pkg.author}
 * @link ${pkg.homepage}
 * @license ${pkg.license}
 */
      `.trim(),
            raw: true,
            entryOnly: true
        })
    ]
};
