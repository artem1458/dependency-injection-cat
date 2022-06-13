import ts from 'typescript';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { ContextRepository } from './ContextRepository';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { isExtendsGlobalCatContextContext } from '../ts-helpers/predicates/isExtendsGlobalCatContext';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IncorrectContextDeclarationError } from '../../compilation-context/messages/errors/IncorrectContextDeclarationError';

export const registerGlobalCatContext = (
    compilationContext: CompilationContext,
    sourceFile: ts.SourceFile
) => {
    compilationContext.clearMessagesByFilePath(sourceFile.fileName);

    const catContextClassDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);
    const globalCatContextClassDeclarations = sourceFile.statements.filter(isExtendsGlobalCatContextContext);

    if (catContextClassDeclarations.length > 0 && globalCatContextClassDeclarations.length > 0) {
        [
            ...catContextClassDeclarations,
            ...globalCatContextClassDeclarations,
        ].forEach(it => {
            compilationContext.report(new IncorrectContextDeclarationError(
                'Only one context should be defined per file.',
                it,
                null,
            ));
        });
        return;
    }

    if (globalCatContextClassDeclarations.length > 1) {
        const excessGlobalCatContextClasses = globalCatContextClassDeclarations.slice(1);

        excessGlobalCatContextClasses.forEach(it => {
            compilationContext.report(new IncorrectContextDeclarationError(
                'Only one context should be defined per file.',
                it,
                null,
            ));
        });

        return;
    }

    if (globalCatContextClassDeclarations.length === 1) {
        const classDeclaration = globalCatContextClassDeclarations[0];

        if (!isNamedClassDeclaration(classDeclaration)) {
            compilationContext.report(new IncorrectContextDeclarationError(
                'Should be a named class declaration.',
                classDeclaration,
                null,
            ));

            return;
        }

        ContextRepository.registerGlobalContext(classDeclaration);
    }
};
