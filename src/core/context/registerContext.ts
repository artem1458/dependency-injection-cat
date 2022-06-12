import ts from 'typescript';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { GLOBAL_CONTEXT_NAME } from './constants';
import { ContextRepository } from './ContextRepository';
import { CompilationContext2 } from '../../compilation-context/CompilationContext2';

export function registerContext(compilationContext: CompilationContext2, sourceFile: ts.SourceFile) {
    const catContextClassDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);

    if (catContextClassDeclarations.length > 1) {
        const excessCatContextClasses = catContextClassDeclarations.slice(1);

        CompilationContext.reportErrorWithMultipleNodes({
            message: 'Only one context should be defined in file.',
            nodes: excessCatContextClasses,
            filePath: sourceFile.fileName,
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
            node: classDeclaration,
            filePath: classDeclaration.getSourceFile().fileName,
        });

        return;
    }

    const name = classDeclaration.name.getText();

    if (name === GLOBAL_CONTEXT_NAME) {
        CompilationContext.reportError({
            message: `"${GLOBAL_CONTEXT_NAME}" name of context is preserved for DI container`,
            node: classDeclaration,
            filePath: classDeclaration.getSourceFile().fileName,
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
            filePath: classDeclaration.getSourceFile().fileName,
        });
        return;
    }

    ContextRepository.registerContext(
        name,
        classDeclaration,
    );
}
