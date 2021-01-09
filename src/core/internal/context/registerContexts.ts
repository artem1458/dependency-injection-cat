import { ProgramRepository } from '../program/ProgramRepository';
import { SourceFileNotFound } from '../../exceptions/compilation/SourceFileNotFound';
import { isExtendsCatContextContext } from '../ts-helpers/isExtendsCatContextContext';
import { UnnamedContext } from '../../exceptions/compilation/UnnamedContext';
import { ContextRepository } from './ContextRepository';
import { isNamedClassDeclaration } from '../ts-helpers/isNamedClassDeclaration';

export const registerContexts = (contextPaths: Array<string>) => {
    const sourceFiles = contextPaths.map(file => {
        const sourceFile = ProgramRepository.program.getSourceFile(file);

        if (!sourceFile) {
            throw new SourceFileNotFound(file);
        }

        return sourceFile;
    });

    sourceFiles.forEach(sourceFile => {
        const contexts = sourceFile.statements.filter(isExtendsCatContextContext);

        contexts.forEach(context => {
            if (!isNamedClassDeclaration(context)) {
                throw new UnnamedContext(sourceFile.fileName);
            }

            const name = context.name.getText();

            ContextRepository.registerContext(
                name,
                context,
            );
        });
    });
};
