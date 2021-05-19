import ts from 'typescript';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { GLOBAL_CONTEXT_NAME } from './constants';
import { ContextRepository } from './ContextRepository';

export function registerContext(sourceFile: ts.SourceFile) {
    const catContextClassDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);

    if (catContextClassDeclarations.length > 0) {
        CompilationContext.reportErrorWithMultipleNodes({
            message: 'Only one type of CatContext should be defined in one file.',
            nodes: [
                ...catContextClassDeclarations,
            ],
        });

        return;
    }

    if (catContextClassDeclarations.length > 1) {
        const excessCatContextClasses = catContextClassDeclarations.slice(1);

        CompilationContext.reportErrorWithMultipleNodes({
            nodes: [
                ...excessCatContextClasses,
            ],
            message: 'Only one context should be defined in file.',
        });

        return;
    }

    if (catContextClassDeclarations.length === 1) {
        registerCatContext(catContextClassDeclarations[0]);
    }
}

function registerCatContext(classDeclaration: ts.ClassDeclaration) {
    if (!isNamedClassDeclaration(classDeclaration)) {
        CompilationContext.reportError({
            message: 'Context should be a named class declaration',
            node: classDeclaration
        });

        return;
    }

    const name = classDeclaration.name.getText();

    if (name === GLOBAL_CONTEXT_NAME) {
        CompilationContext.reportError({
            message: `"${GLOBAL_CONTEXT_NAME}" name of context is preserved for DI container`,
            node: classDeclaration
        });
        return;
    }

    const oldContext = ContextRepository.getContextByName(name);

    if (oldContext !== null && classDeclaration.getSourceFile().fileName !== oldContext.absolutePath) {
        CompilationContext.reportErrorWithMultipleNodes({
            message: 'Registered more than 1 contexts with same name',
            nodes: [
                classDeclaration,
                oldContext.node,
            ],
        });
        return;
    }

    ContextRepository.registerContext(
        name,
        classDeclaration,
    );
}
