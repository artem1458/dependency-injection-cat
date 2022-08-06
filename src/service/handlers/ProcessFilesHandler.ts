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
import { BeanRepository } from '../../core/bean/BeanRepository';
import { BeanDependenciesRepository } from '../../core/bean-dependencies/BeanDependenciesRepository';
import { DependencyGraph } from '../../core/connect-dependencies/DependencyGraph';
import { ContextNamesRepository } from '../../core/context/ContextNamesRepository';
import { LifecycleMethodsRepository } from '../../core/context-lifecycle/LifecycleMethodsRepository';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';
import { ConfigLoader } from '../../config/ConfigLoader';
import { IDisposable } from '../types/IDisposable';
import { AbstractStatistics } from '../types/process-files/statistics/AbstractStatistics';
import { BeanDeclarationLinkStatistics } from '../types/process-files/statistics/BeanDeclarationLinkStatistics';
import { IProcessFilesCommand } from '../types/process-files/IProcessFilesCommand';

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

            return {
                compilationMessages: Array.from(compilationContext.messages),
                statistics: this.collectStatistics(),
                projectModificationStamp: command.projectModificationStamp,
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

    private collectStatistics(): IProcessFilesStatistics[] {
        const result: AbstractStatistics[] = [];

        Array.from(BeanRepository.contextIdToBeanDescriptorsMap.values()).forEach(beanDescriptorsByContext => {
            beanDescriptorsByContext.forEach(beanDescriptor => {

                result.push(...BeanDeclarationLinkStatistics.build(beanDescriptor));
            });
        });

        return result.map(it => ({
            type: it.type,
            payload: JSON.stringify(it),
        }));
    }
}
