import path from 'path';
import webpack from 'webpack';
import { WatchModeRepository } from '../watcher/WatchModeRepository';

export default class DiContainerWebpackPlugin {
    apply(compiler: webpack.Compiler) {
        if (compiler.options.watch || isWebpackDevServer()) {
            WatchModeRepository.isWatchMode = true;
        }
    }
}

function isWebpackDevServer(): boolean {
    return process.argv.some(a => path.basename(a) === 'webpack-dev-server');
}
