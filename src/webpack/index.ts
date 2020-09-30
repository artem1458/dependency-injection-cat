import { WatchModeRepository } from '../watcher/WatchModeRepository';

export default class DiContainerWebpackPlugin {
    constructor(
        watchMode: boolean
    ) {
        WatchModeRepository.isWatchMode = watchMode;
    }

    apply() {}
}
