import { DICatService } from './DICatService';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';
import { ProgramOptionsProvider } from '../program-options/ProgramOptionsProvider';
import { StatisticsCollector } from './statistics/StatisticsCollector';

(async () => {
    ProgramOptionsProvider.init();

    const statisticsCollector = new StatisticsCollector();
    const service = new DICatService(
        new FileSystemHandler(),
        new ProcessFilesHandler(
            statisticsCollector
        ),
    );

    await service.run();
})();
