import ts from 'typescript';
import { relativizeImports } from './transformers/relativizeImports';
import { addContextPool } from './transformers/addContextPool';
import { replaceExtendingFromCatContext } from './transformers/replaceExtendingFromCatContext';
import { replacePropertyBeans } from './transformers/replacePropertyBeans';
import { transformMethodBeans } from './transformers/transformMethodBeans';
import { removeDIImports } from '../ts-helpers/removeDIImports';
import { addNecessaryImports } from './transformers/addNecessaryImports';
import { ContextRepository } from '../context/ContextRepository';
import { registerContext } from '../context/registerContext';

export function registerAndTransformContext(
    context: ts.TransformationContext,
    sourceFile: ts.SourceFile
): ts.SourceFile {
    registerContext(sourceFile);

    const contextDescriptor = ContextRepository.contextPathToContextDescriptor.get(sourceFile.fileName) ?? null;

    if (!contextDescriptor) {
        throw new Error('Context descriptor is not registered');
    }

    const globalContextIdsToAdd: string[] = [];

    const transformers: ts.TransformerFactory<any>[] = [
        relativizeImports(),
        addContextPool(contextDescriptor),
        replaceExtendingFromCatContext(contextDescriptor),
        replacePropertyBeans(globalContextIdsToAdd),
        transformMethodBeans(globalContextIdsToAdd),
        removeDIImports(),
        addNecessaryImports(globalContextIdsToAdd),
    ];

    const file = ts.transform<ts.SourceFile>(
        sourceFile,
        transformers,
    ).transformed[0];

    const printer = ts.createPrinter();

    const text = printer.printFile(file);

    return file;
}
