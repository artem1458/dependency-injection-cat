import path from 'path';
import { WatchModeRepository } from './WatchModeRepository';

let wasInitialized = false;

export function setWatchMode(): void {
    if (wasInitialized) {
        return;
    }
    wasInitialized = true;

    const booleans = [isWebpackDevServer(), isTTSCInWatchMode()];

    if (booleans.some(it => it)) {
        WatchModeRepository.isWatchMode = true;
    }
}

function isWebpackDevServer(): boolean {
    return process.argv.some(a => path.basename(a) === 'webpack-dev-server');
}

function isTTSCInWatchMode(): boolean {
    const basename = process.argv.some(a => path.basename(a) === 'ttsc');
    const isWatchMode = process.argv.some(a => a === '--watch');

    return basename && isWatchMode;
}
