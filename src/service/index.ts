import { DICatService } from './DICatService';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';

(async () => {
    const service = new DICatService(
        new FileSystemHandler(),
        new ProcessFilesHandler(),
    );

    await service.run();
})();
