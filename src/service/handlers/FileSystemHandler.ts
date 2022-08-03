import upath from 'upath';
import { IBatchFileSystemCommand } from '../types/file-system/FileSystemCommands';
import { FSCommandType } from '../types/file-system/FSCommandType';
import { FileSystem } from '../../file-system/FileSystem';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { ICommandHandler } from './ICommandHandler';
import { ConfigLoader } from '../../config/ConfigLoader';
import { BeanRepository } from '../../core/bean/BeanRepository';
import { BeanDependenciesRepository } from '../../core/bean-dependencies/BeanDependenciesRepository';
import { DependencyGraph } from '../../core/connect-dependencies/DependencyGraph';
import { ContextNamesRepository } from '../../core/context/ContextNamesRepository';
import { ContextRepository } from '../../core/context/ContextRepository';
import { LifecycleMethodsRepository } from '../../core/context-lifecycle/LifecycleMethodsRepository';
import { PathResolver } from '../../core/ts-helpers/path-resolver/PathResolver';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';

export class FileSystemHandler implements ICommandHandler<IBatchFileSystemCommand> {

    invoke(command: IBatchFileSystemCommand): void {
        let wasConfigChanged = false;
        let contentOfNewConfigFile: string | null = null;

        command.commands.forEach(it => {
            if (it.type === FSCommandType.ADD) {
                const normalizedPath = upath.normalize(it.path);

                FileSystem.writeVirtualFile(normalizedPath, it.content, it.modificationStamp);
                SourceFilesCache.clearByPath(normalizedPath);

                if (ConfigLoader.isConfigFile(normalizedPath)) {
                    wasConfigChanged = true;
                    contentOfNewConfigFile = it.content;
                }
            }

            if (it.type === FSCommandType.DELETE) {
                const normalizedPath = upath.normalize(it.path);

                if (ConfigLoader.isConfigFile(normalizedPath)) {
                    wasConfigChanged = true;
                    contentOfNewConfigFile = null;
                }

                FileSystem.deleteFile(normalizedPath);
                SourceFilesCache.clearByPath(normalizedPath);
            }

            if (it.type === FSCommandType.MOVE) {
                const normalizedOldPath = upath.normalize(it.oldPath);
                const normalizedNewPath = upath.normalize(it.newPath);

                if (ConfigLoader.isConfigFile(normalizedOldPath)) {
                    wasConfigChanged = true;
                    contentOfNewConfigFile = null;
                }

                if (ConfigLoader.isConfigFile(normalizedNewPath)) {
                    wasConfigChanged = true;
                    contentOfNewConfigFile = it.content;
                }

                FileSystem.deleteFile(normalizedOldPath);
                FileSystem.writeVirtualFile(normalizedNewPath, it.content, it.modificationStamp);

                SourceFilesCache.clearByPath(normalizedOldPath);
                SourceFilesCache.clearByPath(normalizedNewPath);
            }
        });

        if (wasConfigChanged) {
            BeanRepository.clear();
            BeanDependenciesRepository.clear();
            DependencyGraph.clear();
            ContextNamesRepository.clear();
            ContextRepository.clear();
            LifecycleMethodsRepository.clear();
            PathResolver.clear();
            PathResolverCache.clear();

            contentOfNewConfigFile === null
                ? ConfigLoader.clear()
                : ConfigLoader.parseAndSetConfig(contentOfNewConfigFile);
        }
    }
}
