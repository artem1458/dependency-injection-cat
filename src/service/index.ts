import { DICatService } from './DICatService';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';

const requestHandler = new DICatService(
    new FileSystemHandler(),
    new ProcessFilesHandler(),
);

requestHandler.run();