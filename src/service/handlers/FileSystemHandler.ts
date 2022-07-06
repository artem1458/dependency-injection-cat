import upath from 'upath';
import { IBatchFileSystemCommand } from '../types/file_system/FileSystemCommands';
import { FSCommandType } from '../types/file_system/FSCommandType';
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
        command.commands.forEach(it => {
            if (it.type === FSCommandType.ADD) {
                it.files.forEach(([path, content]) => {
                    const normalizedPath = upath.normalize(path);

                    if (ConfigLoader.isConfigFile(normalizedPath)) {
                        ConfigLoader.parseAndSetConfig(content);
                        BeanRepository.clear();
                        BeanDependenciesRepository.clear();
                        DependencyGraph.clear();
                        ContextNamesRepository.clear();
                        ContextRepository.clear();
                        LifecycleMethodsRepository.clear();
                        PathResolver.clear();
                        PathResolverCache.clear();
                    }

                    FileSystem.writeFile(normalizedPath, content);
                    SourceFilesCache.clearByPath(normalizedPath);
                });
            }

            if (it.type === FSCommandType.DELETE) {
                it.paths.forEach(path => {
                    const normalizedPath = upath.normalize(path);

                    if (ConfigLoader.isConfigFile(normalizedPath)) {
                        ConfigLoader.clear();
                    }

                    FileSystem.deleteFile(normalizedPath);
                    SourceFilesCache.clearByPath(normalizedPath);
                });
            }
        });
    }
}
