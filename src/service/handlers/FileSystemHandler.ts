import { FileSystemCommand } from '../types/file_system/FileSystemCommand';
import { FSCommandType } from '../types/file_system/FSCommandType';
import { FileSystem } from '../../file-system/FileSystem';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { ICommandHandler } from './ICommandHandler';

export class FileSystemHandler implements ICommandHandler<FileSystemCommand> {

    invoke(command: FileSystemCommand): void {
        if (command.type === FSCommandType.ADD) {
            command.files.forEach(([path, content]) => {
                FileSystem.writeFile(path, content);
                SourceFilesCache.clearByPath(path);
            });
        }

        if (command.type === FSCommandType.DELETE) {
            command.paths.forEach(path => {
                FileSystem.deleteFile(path);
                SourceFilesCache.clearByPath(path);
            });
        }

        if (command.type === FSCommandType.CLEAR) {
            FileSystem.clearVirtualFS();
            SourceFilesCache.clear();
        }
    }
}
