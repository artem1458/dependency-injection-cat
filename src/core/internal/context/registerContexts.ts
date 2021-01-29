import ts from 'typescript';
import { ProgramRepository } from '../program/ProgramRepository';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { ContextRepository } from './ContextRepository';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { CompilationContext } from '../../compilation-context/CompilationContext';

export const registerContexts = (contextPaths: Array<string>) => {
    const sourceFiles = contextPaths.map(file => {
        const sourceFile = ProgramRepository.program.getSourceFile(file);

        if (!sourceFile) {
            CompilationContext.reportErrorMessage(`Source file not found, ${file}`);

            return;
        }

        return sourceFile;
    }).filter((it): it is ts.SourceFile => it !== undefined);

    sourceFiles.forEach(sourceFile => {
        const classDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);

        classDeclarations.forEach(classDeclaration => {
            if (!isNamedClassDeclaration(classDeclaration)) {
                CompilationContext.reportError({
                    message: 'Context should be a named class declaration',
                    node: classDeclaration
                });

                return;
            }

            const name = classDeclaration.name.getText();

            ContextRepository.registerContext(
                name,
                classDeclaration,
            );
        });
    });
};
