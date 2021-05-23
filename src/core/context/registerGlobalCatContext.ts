import ts, { ScriptTarget } from 'typescript';
import fs from 'fs';
import { ProgramRepository } from '../program/ProgramRepository';
import { isExtendsCatContextContext } from '../ts-helpers/predicates/isExtendsCatContextContext';
import { ContextRepository } from './ContextRepository';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { isExtendsGlobalCatContextContext } from '../ts-helpers/predicates/isExtendsGlobalCatContext';

export const registerGlobalCatContext = (sourceFile: ts.SourceFile) => {
    CompilationContext.clearErrorsByFilePath(sourceFile.fileName);

    const catContextClassDeclarations = sourceFile.statements.filter(isExtendsCatContextContext);
    const globalCatContextClassDeclarations = sourceFile.statements.filter(isExtendsGlobalCatContextContext);

    if (catContextClassDeclarations.length > 0 && globalCatContextClassDeclarations.length > 0) {
        CompilationContext.reportErrorWithMultipleNodes({
            message: 'Only one type of CatContext should be defined in one file.',
            nodes: [
                ...catContextClassDeclarations,
                ...globalCatContextClassDeclarations,
            ],
            filePath: sourceFile.fileName,
        });

        return;
    }

    if (globalCatContextClassDeclarations.length > 1) {
        const excessCatContextClasses = catContextClassDeclarations.slice(1);
        const excessGlobalCatContextClasses = globalCatContextClassDeclarations.slice(1);

        CompilationContext.reportErrorWithMultipleNodes({
            nodes: [
                ...excessCatContextClasses,
                ...excessGlobalCatContextClasses,
            ],
            message: 'Only one context should be defined in file.',
            filePath: sourceFile.fileName,
        });

        return;
    }

    if (globalCatContextClassDeclarations.length === 1) {
        const classDeclaration = globalCatContextClassDeclarations[0];

        if (!isNamedClassDeclaration(classDeclaration)) {
            CompilationContext.reportError({
                message: 'Global Context should be a named class declaration',
                node: classDeclaration,
                filePath: classDeclaration.getSourceFile().fileName,
            });

            return;
        }

        ContextRepository.registerGlobalContext(classDeclaration);
    }
};
