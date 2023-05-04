import { ICommandHandler } from './ICommandHandler';
import { IProcessFilesResponse } from '../types/process-files/IProcessFilesResponse';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { PathResolver } from '../../core/ts-helpers/path-resolver/PathResolver';
import { ContextRepository } from '../../core/context/ContextRepository';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { BeanRepository } from '../../core/bean/BeanRepository';
import { BeanDependenciesRepository } from '../../core/bean-dependencies/BeanDependenciesRepository';
import { DependencyGraph } from '../../core/connect-dependencies/DependencyGraph';
import { LifecycleMethodsRepository } from '../../core/context-lifecycle/LifecycleMethodsRepository';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';
import { IDisposable } from '../types/IDisposable';
import { IProcessFilesCommand } from '../types/process-files/IProcessFilesCommand';
import { AbstractCompilationMessage } from '../../compilation-context/messages/AbstractCompilationMessage';
import { StatisticsCollector } from '../statistics/StatisticsCollector';
import { getTransformerFactory } from '../../core/transformers/getTransformerFactory';
import ts from 'typescript';

export class ProcessFilesHandler implements ICommandHandler<IProcessFilesCommand, Promise<IProcessFilesResponse>>, IDisposable {
    constructor(
        private statisticsCollector: StatisticsCollector
    ) {}

    async invoke(command: IProcessFilesCommand): Promise<IProcessFilesResponse> {
        try {
            const compilationContext = new CompilationContext();
            const transformerFactory = getTransformerFactory(compilationContext);
            PathResolver.init();

            const sourceFiles = command.filesToProcess
                .map(it => SourceFilesCache.getSourceFileByPath(it));

            ts.transform(
                sourceFiles,
                [transformerFactory],
            );

            const affectedFiles = new Set<string>();

            return {
                compilationMessages: this.collectCompilationMessages(compilationContext, affectedFiles),
                statistics: this.statisticsCollector.invoke(affectedFiles),
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
        ContextRepository.clear();
        LifecycleMethodsRepository.clear();
        PathResolver.clear();
        PathResolverCache.clear();
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
}
