import { ICommandHandler } from './ICommandHandler';
import { IProcessFilesResponse, IProcessFilesStatistics } from '../types/process-files/IProcessFilesResponse';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { PathResolver } from '../../core/ts-helpers/path-resolver/PathResolver';
import { FileSystem } from '../../file-system/FileSystem';
import minimatch from 'minimatch';
import { registerGlobalCatContext } from '../../core/context/registerGlobalCatContext';
import { ContextRepository } from '../../core/context/ContextRepository';
import { registerBeans } from '../../core/bean/registerBeans';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { registerAndTransformContext } from '../../core/build-context/registerAndTransformContext';
import { BeanRepository, IBeanDescriptor } from '../../core/bean/BeanRepository';
import {
    BeanDependenciesRepository,
    IBeanDependencyDescriptor
} from '../../core/bean-dependencies/BeanDependenciesRepository';
import { DependencyGraph } from '../../core/connect-dependencies/DependencyGraph';
import { ContextNamesRepository } from '../../core/context/ContextNamesRepository';
import {
    ILifecycleDependencyDescriptor,
    LifecycleMethodsRepository
} from '../../core/context-lifecycle/LifecycleMethodsRepository';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';
import { ConfigLoader } from '../../config/ConfigLoader';
import { IDisposable } from '../types/IDisposable';
import { AbstractStatistics } from '../types/process-files/statistics/AbstractStatistics';
import { BeanDeclarationLinkStatistics } from '../types/process-files/statistics/link/BeanDeclarationLinkStatistics';
import { IProcessFilesCommand } from '../types/process-files/IProcessFilesCommand';
import { AbstractCompilationMessage } from '../../compilation-context/messages/AbstractCompilationMessage';
import { QualifiedBeanDeclarationLinkStatistics } from '../types/process-files/statistics/link/QualifiedBeanDeclarationLinkStatistics';
import { BeanUsageLinkStatistics } from '../types/process-files/statistics/link/BeanUsageLinkStatistics';

export class ProcessFilesHandler implements ICommandHandler<IProcessFilesCommand, Promise<IProcessFilesResponse>>, IDisposable {

    async invoke(command: IProcessFilesCommand): Promise<IProcessFilesResponse> {
        try {
            const compilationContext = new CompilationContext();
            PathResolver.init();

            const contextPaths = this.getContextPaths();

            this.initGlobalContexts(contextPaths, compilationContext);
            contextPaths.forEach(path => {
                registerAndTransformContext(compilationContext, SourceFilesCache.getSourceFileByPath(path));
            });

            const affectedFiles = new Set<string>();

            return {
                compilationMessages: this.collectCompilationMessages(compilationContext, affectedFiles),
                statistics: this.collectStatistics(affectedFiles),
                projectModificationStamp: command.projectModificationStamp,
                affectedFiles: Array.from(affectedFiles)
            };
        } finally {
            this.dispose();
        }
    }

    dispose(): void {
        BeanRepository.clear();
        BeanDependenciesRepository.clear();
        DependencyGraph.clear();
        ContextNamesRepository.clear();
        ContextRepository.clear();
        LifecycleMethodsRepository.clear();
        PathResolver.clear();
        PathResolverCache.clear();
    }

    private initGlobalContexts(contextPaths: string[], compilationContext: CompilationContext): void {
        contextPaths
            .map(it => SourceFilesCache.getSourceFileByPath(it))
            .forEach(it => registerGlobalCatContext(compilationContext, it));

        ContextRepository.globalContexts.forEach(it => registerBeans(compilationContext, it));
    }

    private getContextPaths(): string[] {
        const filePaths = FileSystem.getAllFilePaths();
        const { pattern } = ConfigLoader.load();

        return minimatch.match(filePaths, pattern);
    }

    private collectCompilationMessages(
        compilationContext: CompilationContext,
        affectedFiles: Set<string>
    ): AbstractCompilationMessage[] {
        const result: AbstractCompilationMessage[] = [];

        compilationContext.messages.forEach(message => {
            result.push(message);

            affectedFiles.add(message.filePath);

            if (message.contextDetails !== null) {
                affectedFiles.add(message.contextDetails.path);
            }
        });

        return result;
    }

    private collectStatistics(affectedFiles: Set<string>): IProcessFilesStatistics[] {
        const result: AbstractStatistics[] = [];
        const beanDescriptorToDependents = new Map<IBeanDescriptor, Set<IBeanDependencyDescriptor | ILifecycleDependencyDescriptor>>();

        Array.from(BeanRepository.contextIdToBeanDescriptorsMap.values()).forEach(beanDescriptorsByContext => {
            beanDescriptorsByContext.forEach(beanDescriptor => {
                const statistics = BeanDeclarationLinkStatistics.build(beanDescriptor);

                statistics.forEach(it => {
                    result.push(it);
                    affectedFiles.add(it.fromPosition.path);
                    affectedFiles.add(it.toPosition.path);
                });
            });
        });

        Array.from(LifecycleMethodsRepository.contextDescriptorToLifecycleDescriptors.values())
            .forEach(lifecycleDescriptors => {
                lifecycleDescriptors.forEach(lifecycleDescriptor => {
                    lifecycleDescriptor.dependencies.forEach(dependencyDescriptor => {
                        dependencyDescriptor.qualifiedBeans.forEach(beanDescriptor => {
                            const dependents = beanDescriptorToDependents.get(beanDescriptor) ?? new Set();

                            dependents.add(dependencyDescriptor);

                            beanDescriptorToDependents.set(beanDescriptor, dependents);
                        });

                        QualifiedBeanDeclarationLinkStatistics.build(dependencyDescriptor)
                            .forEach(it => {
                                result.push(it);
                                affectedFiles.add(it.fromPosition.path);
                                affectedFiles.add(it.toPosition.path);
                            });
                    });
                });
            });


        BeanDependenciesRepository.data.forEach(beanDescriptorToDependencies => {
            beanDescriptorToDependencies.forEach((dependencies, descriptor) => {

                dependencies.forEach(dependencyDescriptor => {

                    dependencyDescriptor.qualifiedBeans.forEach(qualifiedBeanDescriptor => {
                        const dependents = beanDescriptorToDependents.get(qualifiedBeanDescriptor) ?? new Set();

                        dependents.add(dependencyDescriptor);

                        beanDescriptorToDependents.set(qualifiedBeanDescriptor, dependents);
                    });

                    QualifiedBeanDeclarationLinkStatistics.build(dependencyDescriptor)
                        .forEach(it => {
                            result.push(it);
                            affectedFiles.add(it.fromPosition.path);
                            affectedFiles.add(it.toPosition.path);
                        });
                });
            });
        });

        beanDescriptorToDependents.forEach((dependents, beanDescriptor) => {
            BeanUsageLinkStatistics.build(beanDescriptor, Array.from(dependents))
                .forEach(it => {
                    result.push(it);
                    affectedFiles.add(it.fromPosition.path);
                    affectedFiles.add(it.toPosition.path);
                });
        });

        return result.map(it => ({
            type: it.type,
            payload: JSON.stringify(it),
        }));
    }
}
