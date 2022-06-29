import { DICatService } from './DICatService';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';

const service = new DICatService(
    new FileSystemHandler(),
    new ProcessFilesHandler(),
);

service.run();
