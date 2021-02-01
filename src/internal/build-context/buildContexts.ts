import ts from 'typescript';
import fs from 'fs';
import path from 'upath';
import glob from 'glob';
import { ContextRepository, IContextDescriptor } from '../context/ContextRepository';
import { addNecessaryImports } from './transformers/addNecessaryImports';
import { replaceExtendingFromCatContext } from './transformers/replaceExtendingFromCatContext';
import { addContextPool } from './transformers/addContextPool';
import { replacePropertyBeans } from './transformers/replacePropertyBeans';
import { transformMethodBeans } from './transformers/transformMethodBeans';
import { getBuildedContextDirectory } from './utils/getBuildedContextDirectory';
import { relativizeImports } from './transformers/relativizeImports';

export const buildContexts = () => {
    clearOldContexts();

    ContextRepository.repository.forEach((contextDescriptor, contextName) => {
        const transformers: ts.TransformerFactory<any>[] = [
            relativizeImports(),
            addNecessaryImports(),
            addContextPool(contextDescriptor),
            replaceExtendingFromCatContext(contextDescriptor),
            replacePropertyBeans(),
            transformMethodBeans()
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
    const ext = path.extname(contextDescriptor.absolutePath);
    const newPath = path.join(
        getBuildedContextDirectory(),
        `context_${contextDescriptor.id}${ext}`,
    );

    fs.writeFile(
        newPath,
        printer.printFile(sourceFile),
        (err: NodeJS.ErrnoException | null) => {
            if (err) {
                throw err;
            }
        }
    );
}

function clearOldContexts() {
    glob(`${getBuildedContextDirectory()}/context_*`, function (err, files) {
        if (err) {
            throw err;
        }

        files.forEach(file => {
            fs.unlink(
                file,
                (err: NodeJS.ErrnoException | null) => {
                    if (err) {
                        throw err;
                    }
                }
            );
        });
    });
}
