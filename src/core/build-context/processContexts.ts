import ts, { factory } from 'typescript';
import { isExtendsClass } from '../ts-helpers/predicates/isExtendsClass';
import { ContextRepository } from '../context/ContextRepository';
import { isNamedClassDeclaration } from '../ts-helpers/predicates/isNamedClassDeclaration';
import { DependencyGraph } from '../connect-dependencies/DependencyGraph';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { registerBeans } from '../bean/registerBeans';
import {
    checkIsAllBeansRegisteredInContextAndFillBeanRequierness
} from '../bean/checkIsAllBeansRegisteredInContextAndFillBeanRequierness';
import { registerBeanDependencies } from '../bean-dependencies/registerBeanDependencies';
import {
    buildDependencyGraphAndFillQualifiedBeans
} from '../connect-dependencies/buildDependencyGraphAndFillQualifiedBeans';
import { registerContextLifecycleMethods } from '../context-lifecycle/registerContextLifecycleMethods';
import { reportAboutCyclicDependencies } from '../report-cyclic-dependencies/reportAboutCyclicDependencies';
import { enrichWithAdditionalProperties } from './transformers/enrichWithAdditionalProperties';
import { InternalCatContext } from '../../external/InternalCatContext';
import { IncorrectNameError } from '../../compilation-context/messages/errors/IncorrectNameError';
import {
    INTERNAL_CAT_CONTEXT_IMPORT,
    replaceExtendingFromCatContext
} from './transformers/replaceExtendingFromCatContext';
import upath from 'upath';
import { getImportPathToExternalDirectory } from './utils/getImportPathToExternalDirectory';
import { processMembers } from './transformers/processMembers';
import {
    IncorrectContextDeclarationError
} from '../../compilation-context/messages/errors/IncorrectContextDeclarationError';

export const processContexts = (compilationContext: CompilationContext, sourceFile: ts.SourceFile): ts.SourceFile => {
    //Skipping declaration files
    if (sourceFile.isDeclarationFile) {
        return sourceFile;
    }

    let shouldAddImports = false;

    const updatedStatements = sourceFile.statements.map(node => {
        //Registering contexts
        if (!isExtendsClass(node, 'CatContext')) {
            return node;
        }

        if (!isNamedClassDeclaration(node)) {
            compilationContext.report(new IncorrectContextDeclarationError(
                'Class that extends CatContext should be a named class declaration.',
                node,
                null,
            ));
            return node;
        }

        shouldAddImports = true;

        const contextId = ContextRepository.buildContextId(node);
        const oldContextDescriptor = ContextRepository.contextIdToContextDescriptor.get(contextId);

        if (oldContextDescriptor) {
            ContextRepository.clearByContextId(contextId);
            DependencyGraph.clearByContextDescriptor(oldContextDescriptor);
        }

        const contextDescriptor = ContextRepository.registerContext(node.name.getText(), node);
        const restrictedClassMembersByName = node.members
            .filter(it => InternalCatContext.reservedNames.has(it.name?.getText() ?? ''));

        if (restrictedClassMembersByName.length !== 0) {
            restrictedClassMembersByName.forEach(it => {
                compilationContext.report(new IncorrectNameError(
                    `"${it.name?.getText()}" name is reserved for the di-container.`,
                    it,
                    contextDescriptor.node,
                ));
            });
            return node;
        }

        //Processing beans
        registerBeans(compilationContext, contextDescriptor);
        checkIsAllBeansRegisteredInContextAndFillBeanRequierness(compilationContext, contextDescriptor);
        registerBeanDependencies(compilationContext, contextDescriptor);
        buildDependencyGraphAndFillQualifiedBeans(compilationContext, contextDescriptor);
        registerContextLifecycleMethods(compilationContext, contextDescriptor);
        reportAboutCyclicDependencies(compilationContext, contextDescriptor);

        return ts.transform<ts.ClassDeclaration>(
            node,
            [
                enrichWithAdditionalProperties(contextDescriptor),
                replaceExtendingFromCatContext(),
                processMembers(),
            ],
        ).transformed[0];
    });

    if (shouldAddImports) {
        const pathForInternalCatContext = upath.join(
            getImportPathToExternalDirectory(),
            'InternalCatContext',
        );
        const internalCatContextImport = factory.createImportDeclaration(
            undefined,
            factory.createImportClause(
                false,
                undefined,
                factory.createNamespaceImport(
                    factory.createIdentifier(INTERNAL_CAT_CONTEXT_IMPORT)
                )
            ),
            factory.createStringLiteral(pathForInternalCatContext)
        );

        updatedStatements.unshift(internalCatContextImport);
    }

    return ts.factory.updateSourceFile(
        sourceFile,
        updatedStatements,
        sourceFile.isDeclarationFile,
        sourceFile.referencedFiles,
        sourceFile.typeReferenceDirectives,
        sourceFile.hasNoDefaultLib,
        sourceFile.libReferenceDirectives,
    );
};
