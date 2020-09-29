import chokidar from 'chokidar';
import { transformerConfig } from '../transformer-config';
import nodePath from 'path';
import { ConfigIdRepository } from '../factories/ConfigIdRepository';
import { DiConfigRepository } from '../di-config-repository';
import { runCompile } from '../run-compile/runCompile';
import { getDiConfigPattern } from '../transformer-config/getDiConfigPattern';
import { WatchModeRepository } from './WatchModeRepository';
import { setWatchMode } from './setWatchMode';

let wasInitialised = false;

export function initWatcher(): void {
    setWatchMode();

    if (wasInitialised || !WatchModeRepository.isWatchMode) {
        return;
    }
    wasInitialised = true;

    const watcher = chokidar.watch(getDiConfigPattern(), {
        ignored: transformerConfig.ignorePatterns,
    });

    watcher.on('change', (path) => {
        const absolutePath = nodePath.resolve(process.cwd(), path);
        ConfigIdRepository.registerConfig(absolutePath);
        DiConfigRepository.registerConfig(absolutePath);

        runCompile();
    });

    watcher.on('unlink', path => {
        const absolutePath = nodePath.resolve(process.cwd(), path);
        ConfigIdRepository.unregisterConfig(absolutePath);
        DiConfigRepository.unregisterConfig(absolutePath);

        runCompile();
    });
}
