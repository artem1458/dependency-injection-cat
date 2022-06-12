import ts from 'typescript';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { GLOBAL_CONTEXT_NAME } from './constants';
import { ContextRepository } from './ContextRepository';
import { CompilationContext } from '../../build-context/CompilationContext';
import { IncorrectNameError } from '../../exceptions/compilation/errors/IncorrectNameError';
import { IncorrectContextDeclarationError } from '../../exceptions/compilation/errors/IncorrectContextDeclarationError';

export function registerContext(compilationContext: CompilationContext, sourceFile: ts.SourceFile) {
    const catContextClassDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);

    if (catContextClassDeclarations.length > 1) {
        const excessCatContextClasses = catContextClassDeclarations.slice(1);

        excessCatContextClasses.forEach(it => {
            compilationContext.report(new IncorrectContextDeclarationError(
                'Only one context should be defined per file.',
                it,
                null,
            ));
        });
        return;
    }

    if (catContextClassDeclarations.length === 1) {
        registerCatContext(compilationContext, catContextClassDeclarations[0]);
    }
}

function registerCatContext(compilationContext: CompilationContext, classDeclaration: ts.ClassDeclaration) {
    if (!isNamedClassDeclaration(classDeclaration)) {
        compilationContext.report(new IncorrectContextDeclarationError(
            'Should be a named class declaration.',
            classDeclaration,
            null,
        ));
        return;
    }

    const name = classDeclaration.name.getText();

    if (name === GLOBAL_CONTEXT_NAME) {
        compilationContext.report(new IncorrectNameError(
            `"${GLOBAL_CONTEXT_NAME}" name of context is reserved for di-container`,
            classDeclaration.name,
            classDeclaration,
        ));
        return;
    }

    const existContext = ContextRepository.getContextByName(name);

    if (existContext !== null && classDeclaration.getSourceFile().fileName !== existContext.absolutePath) {
        compilationContext.report(new IncorrectContextDeclarationError(
            'Registered few contexts with the same name.',
            classDeclaration,
            existContext.node,
        ));
    }

    ContextRepository.registerContext(
        name,
        classDeclaration,
    );
}
