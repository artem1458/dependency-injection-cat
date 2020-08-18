import webpack from 'webpack';
import { WatchModeRepository } from '../watcher/WatchModeRepository';

export default class DiContainerWebpackPlugin {
    apply(compiler: webpack.Compiler) {
        if (compiler.options.watch) {
            WatchModeRepository.isWatchMode = true;
        }
    }
}
