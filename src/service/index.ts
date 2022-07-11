import { DICatService } from './DICatService';
import { FileSystemHandler } from './handlers/FileSystemHandler';
import { ProcessFilesHandler } from './handlers/ProcessFilesHandler';
import { ProgramOptionsProvider } from '../program-options/ProgramOptionsProvider';

(async () => {
    ProgramOptionsProvider.init();

    const service = new DICatService(
        new FileSystemHandler(),
        new ProcessFilesHandler(),
    );

    await service.run();
})();
