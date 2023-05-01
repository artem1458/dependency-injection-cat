import { ProgramOptionsProvider } from '../program-options/ProgramOptionsProvider';
import { DICatService } from './DICatService';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';
import { StatisticsCollector } from './statistics/StatisticsCollector';

(async () => {
    const statisticsCollector = new StatisticsCollector();
    const fileSystemHandler = new FileSystemHandler();
    const processFilesHandler = new ProcessFilesHandler(statisticsCollector);
    const diCatService = new DICatService(fileSystemHandler, processFilesHandler);

    ProgramOptionsProvider.init();

    await diCatService.run();
})();
