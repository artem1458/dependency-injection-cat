import { FileSystemRequest } from '../types/file_system/FileSystemRequest';
import { FSRequestType } from '../types/file_system/FSRequestType';
import { FileSystem } from '../../file-system/FileSystem';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { IRequestHandler } from './IRequestHandler';

export class FileSystemHandler implements IRequestHandler<FileSystemRequest> {

    invoke(request: FileSystemRequest): void {
        if (request.type === FSRequestType.ADD) {
            request.files.forEach(([path, content]) => {
                FileSystem.writeFile(path, content);
                SourceFilesCache.clearByPath(path);
            });
        }

        if (request.type === FSRequestType.DELETE) {
            request.paths.forEach(path => {
                FileSystem.deleteFile(path);
                SourceFilesCache.clearByPath(path);
            });
        }

        if (request.type === FSRequestType.CLEAR) {
            FileSystem.clearVirtualFS();
            SourceFilesCache.clear();
        }
    }
}
