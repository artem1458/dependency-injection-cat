import { Bean, CatContext } from 'dependency-injection-cat';
import { DICatService } from './DICatService';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';
import { StatisticsCollector } from './statistics/StatisticsCollector';

export interface IDICatServiceContext {
    service: DICatService;
}

class DICatServiceContext extends CatContext<IDICatServiceContext> {
    service = Bean(DICatService);
    fileSystemHandler = Bean(FileSystemHandler);
    processFilesHandler = Bean(ProcessFilesHandler);
    statisticsCollector = Bean(StatisticsCollector);
}
