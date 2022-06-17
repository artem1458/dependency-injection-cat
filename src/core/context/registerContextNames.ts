import fs from 'fs';
import ts, { ScriptTarget } from 'typescript';
import { ContextNamesRepository } from './ContextNamesRepository';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { getContextPaths } from './getContextPaths';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { filterClassesNotExtendingDICatClass } from '../ts-helpers/filterClassesNotExtendingDICatClass';

export function registerAllContextNames(compilationContext: CompilationContext) {
    ContextNamesRepository.nameToPath.clear();
    ContextNamesRepository.pathToName.clear();
    const contextPaths = getContextPaths();

    contextPaths.forEach(contextPath => {
        compilationContext.clearMessagesByFilePath(contextPath);

        const sourceFile = ts.createSourceFile(
            '',
            fs.readFileSync(contextPath, 'utf-8'),
            ScriptTarget.ESNext,
            true,
        );

        const catContextClassDeclarations = filterClassesNotExtendingDICatClass(sourceFile.statements, 'CatContext');

        if (catContextClassDeclarations.length === 0) {
            return;
        }

        if (catContextClassDeclarations.length > 1) {
            return;
        }

        const classDeclaration = catContextClassDeclarations[0];

        if (!isNamedClassDeclaration(classDeclaration)) {
            return;
        }

        ContextNamesRepository.nameToPath.set(classDeclaration.name.getText(), contextPath);
        ContextNamesRepository.pathToName.set(contextPath, classDeclaration.name.getText());
    });
}
