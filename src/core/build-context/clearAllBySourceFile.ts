import ts from 'typescript';
import { DependencyGraph } from '../dependencies/DependencyGraph';
import { ContextRepository } from '../context/ContextRepository';

export const clearAllBySourceFile = (sourceFile: ts.SourceFile): void => {
    const fileName = sourceFile.fileName;
    const contexts = ContextRepository.fileNameToContexts.get(fileName) ?? [];

    ContextRepository.clearByFileName(fileName);
    contexts.forEach(context => {
        DependencyGraph.clearByContext(context);
    });
};
