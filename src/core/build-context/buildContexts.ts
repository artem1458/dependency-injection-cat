import ts from 'typescript';
import fs from 'fs';
import upath from 'upath';
import glob from 'glob';
import { ContextRepository, IContextDescriptor } from '../context/ContextRepository';
import { addNecessaryImports } from './transformers/addNecessaryImports';
import { replaceExtendingFromCatContext } from './transformers/replaceExtendingFromCatContext';
import { addContextPool } from './transformers/addContextPool';
import { replacePropertyBeans } from './transformers/replacePropertyBeans';
import { transformMethodBeans } from './transformers/transformMethodBeans';
import { getBuiltContextDirectory } from './utils/getBuiltContextDirectory';
import { relativizeImports } from './transformers/relativizeImports';
import { removeDIImports } from '../ts-helpers/removeDIImports';
import { addGlobalContextInstance } from './transformers/addGlobalContextInstance';

export const buildContexts = () => {
    clearOldContexts();

    ContextRepository.contextMap.forEach((contextDescriptor, contextName) => {
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

        const sourceFile = contextDescriptor.node.getSourceFile();

        const result = ts.transform<ts.SourceFile>(
            sourceFile,
            transformers,
        );

        const transformedSourceFile = result.transformed[0];

        writeBuildedContext(contextDescriptor, transformedSourceFile);
    });

    ContextRepository.globalContexts.forEach((contextDescriptor, contextId) => {
        const globalContextIdsToAdd: string[] = [];

        const transformers: ts.TransformerFactory<any>[] = [
            relativizeImports(),
            addGlobalContextInstance(contextDescriptor),
            replaceExtendingFromCatContext(contextDescriptor),
            replacePropertyBeans(globalContextIdsToAdd),
            transformMethodBeans(globalContextIdsToAdd),
            removeDIImports(),
            addNecessaryImports(globalContextIdsToAdd),
        ];

        const sourceFile = contextDescriptor.node.getSourceFile();

        const result = ts.transform<ts.SourceFile>(
            sourceFile,
            transformers,
        );

        const transformedSourceFile = result.transformed[0];

        writeBuildedContext(contextDescriptor, transformedSourceFile);
    });
};

const printer = ts.createPrinter();

function writeBuildedContext(contextDescriptor: IContextDescriptor, sourceFile: ts.SourceFile) {
    const ext = upath.extname(contextDescriptor.absolutePath);
    const outDirectory = getBuiltContextDirectory();
    const newPath = upath.join(
        getBuiltContextDirectory(),
        `context_${contextDescriptor.id}${ext}`,
    );

    if (!fs.existsSync(outDirectory)) {
        fs.mkdirSync(outDirectory);
    }

    fs.writeFileSync(
        newPath,
        printer.printFile(sourceFile),
    );
}

function clearOldContexts() {
    glob.sync(`${getBuiltContextDirectory()}/context_*`).forEach(file => {
        fs.unlink(
            file,
            (err: NodeJS.ErrnoException | null) => {
                if (err) {
                    throw err;
                }
            }
        );
    });
}
