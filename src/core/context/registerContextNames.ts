import fs from 'fs';
import ts, { ScriptTarget } from 'typescript';
import { ContextNamesRepository } from './ContextNamesRepository';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { getContextPaths } from './getContextPaths';

export function registerAllContextNames() {
    ContextNamesRepository.nameToPath.clear();
    ContextNamesRepository.pathToName.clear();
    const contextPaths = getContextPaths();

    contextPaths.forEach(contextPath => {
        CompilationContext.clearErrorsByFilePath(contextPath);
        const sourceFile = ts.createSourceFile(
            '',
            fs.readFileSync(contextPath, 'utf-8'),
            ScriptTarget.ESNext,
            true,
        );

        const catContextClassDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);

        if (catContextClassDeclarations.length === 0) {
            return;
        }

        if (catContextClassDeclarations.length > 1) {
            const excessCatContextClasses = catContextClassDeclarations.slice(1);

            CompilationContext.reportErrorWithMultipleNodes({
                message: 'Only one context should be defined in file.',
                nodes: excessCatContextClasses,
                filePath: contextPath,
            });

            return;
        }

        const classDeclaration = catContextClassDeclarations[0];

        if (!isNamedClassDeclaration(classDeclaration)) {
            CompilationContext.reportError({
                message: 'Context should be a named class declaration',
                node: classDeclaration,
                filePath: contextPath,
            });

            return;
        }

        ContextNamesRepository.nameToPath.set(classDeclaration.name.getText(), contextPath);
        ContextNamesRepository.pathToName.set(contextPath, classDeclaration.name.getText());
    });
}
