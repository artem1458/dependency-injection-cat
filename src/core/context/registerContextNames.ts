import fs from 'fs';
import ts, { ScriptTarget } from 'typescript';
import { ContextNamesRepository } from './ContextNamesRepository';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { getContextPaths } from './getContextPaths';
import { TransformationContext } from '../../compilation-context/TransformationContext';

export function registerAllContextNames(transformationContext: TransformationContext) {
    ContextNamesRepository.nameToPath.clear();
    ContextNamesRepository.pathToName.clear();
    const contextPaths = getContextPaths();

    contextPaths.forEach(contextPath => {
        transformationContext.clearErrorsByFilePath(contextPath);

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
