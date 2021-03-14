import ts from 'typescript';
import { chain } from 'lodash';
import { ProgramRepository } from '../program/ProgramRepository';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { ContextRepository } from './ContextRepository';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { isExtendsGlobalCatContextContext } from '../ts-helpers/predicates/isExtendsGlobalCatContext';
import { GLOBAL_CONTEXT_NAME } from './constants';

export const registerContexts = (contextPaths: Array<string>) => {
    const sourceFiles = chain(contextPaths)
        .map(file => {
            const sourceFile = ProgramRepository.program.getSourceFile(file);

            if (!sourceFile) {
                CompilationContext.reportErrorMessage(`Source file not found, ${file}`);

                return;
            }

            return sourceFile;
        })
        .compact()
        .value();

    sourceFiles.forEach(sourceFile => {
        const catContextClassDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);
        const globalCatContextClassDeclarations = sourceFile.statements.filter(isExtendsGlobalCatContextContext);

        if (catContextClassDeclarations.length > 0 && globalCatContextClassDeclarations.length > 0) {
            CompilationContext.reportErrorWithMultipleNodes({
                message: 'Only one type of CatContext should be defined in one file.',
                nodes: [
                    ...catContextClassDeclarations,
                    ...globalCatContextClassDeclarations,
                ],
            });

            return;
        }

        if (catContextClassDeclarations.length > 1 || globalCatContextClassDeclarations.length > 1) {
            const excessCatContextClasses = catContextClassDeclarations.slice(1);
            const excessGlobalCatContextClasses = globalCatContextClassDeclarations.slice(1);

            CompilationContext.reportErrorWithMultipleNodes({
                nodes: [
                    ...excessCatContextClasses,
                    ...excessGlobalCatContextClasses,
                ],
                message: 'Only one context should be defined in file.',
            });

            return;
        }

        if (catContextClassDeclarations.length === 1) {
            registerCatContext(catContextClassDeclarations[0]);
        }
        if (globalCatContextClassDeclarations.length === 1) {
            registerGlobalCatContext(globalCatContextClassDeclarations[0]);
        }
    });
};

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

    if (ContextRepository.hasContext(name)) {
        CompilationContext.reportError({
            message: 'Context should have uniq name',
            node: classDeclaration,
        });
        return;
    }

    ContextRepository.registerContext(
        name,
        classDeclaration,
    );
}

function registerGlobalCatContext(classDeclaration: ts.ClassDeclaration) {
    if (!isNamedClassDeclaration(classDeclaration)) {
        CompilationContext.reportError({
            message: 'Global Context should be a named class declaration',
            node: classDeclaration
        });

        return;
    }

    ContextRepository.registerGlobalContext(classDeclaration);
}
