import ts from 'typescript';
import { addContextPool } from './transformers/addContextPool';
import { replaceExtendingFromCatContext } from './transformers/replaceExtendingFromCatContext';
import { replacePropertyBeans } from './transformers/replacePropertyBeans';
import { transformMethodBeans } from './transformers/transformMethodBeans';
import { addNecessaryImports } from './transformers/addNecessaryImports';
import { ContextRepository } from '../context/ContextRepository';
import { registerContext } from '../context/registerContext';
import { registerBeans } from '../bean/registerBeans';
import { checkIsAllBeansRegisteredInContextAndFillBeanRequierness } from '../bean/checkIsAllBeansRegisteredInContextAndFillBeanRequierness';
import { registerBeanDependencies } from '../bean-dependencies/registerBeanDependencies';
import { buildDependencyGraphAndFillQualifiedBeans } from '../connect-dependencies/buildDependencyGraphAndFillQualifiedBeans';
import { reportAboutCyclicDependencies } from '../report-cyclic-dependencies/reportAboutCyclicDependencies';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { registerGlobalCatContext } from '../context/registerGlobalCatContext';
import { addGlobalContextInstance } from './transformers/addGlobalContextInstance';
import { TContextDescriptorToIdentifier } from './utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import { transformArrowFunctionBeans } from './transformers/transformArrowFunctionBeans';
import { transformExpressionAndEmbeddedBeans } from './transformers/transformExpressionAndEmbeddedBeans';
import { registerContextLifecycleMethods } from '../context-lifecycle/registerContextLifecycleMethods';
import { transformLifecycleMethods } from './transformers/transformLifecycleMethods';
import { transformLifecycleArrowFunctions } from './transformers/transformLifecycleArrowFunctions';
import { addLifecycleConfiguration } from './transformers/addLifecycleConfiguration';
import { DependencyGraph } from '../connect-dependencies/DependencyGraph';

export function registerAndTransformContext(
    context: ts.TransformationContext,
    sourceFile: ts.SourceFile
): ts.SourceFile {
    CompilationContext.clearErrorsByFilePath(sourceFile.fileName);

    const oldContextDescriptor = ContextRepository.contextPathToContextDescriptor.get(sourceFile.fileName);

    if (oldContextDescriptor?.isGlobal) {
        registerGlobalCatContext(sourceFile);
        const newGlobalContextDescriptor = ContextRepository.contextPathToContextDescriptor.get(sourceFile.fileName) ?? null;

        if (!newGlobalContextDescriptor) {
            throw new Error('Global Context is not registered');
        }

        registerBeans(newGlobalContextDescriptor);
        registerBeanDependencies(newGlobalContextDescriptor);
        buildDependencyGraphAndFillQualifiedBeans(newGlobalContextDescriptor);
        registerContextLifecycleMethods(newGlobalContextDescriptor);
        reportAboutCyclicDependencies(newGlobalContextDescriptor);

        const contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[] = [];

        const transformers: ts.TransformerFactory<any>[] = [
            addGlobalContextInstance(newGlobalContextDescriptor),
            replaceExtendingFromCatContext(newGlobalContextDescriptor),
            replacePropertyBeans(contextDescriptorToIdentifierList),
            transformMethodBeans(contextDescriptorToIdentifierList),
            transformArrowFunctionBeans(contextDescriptorToIdentifierList),
            transformExpressionAndEmbeddedBeans(),
            addNecessaryImports(contextDescriptorToIdentifierList),
        ];

        const file = ts.transform<ts.SourceFile>(
            sourceFile,
            transformers,
        ).transformed[0];

        // const fileText = ts.createPrinter().printFile(file);

        return file;
    }

    if (oldContextDescriptor && !oldContextDescriptor?.isGlobal) {
        DependencyGraph.clearByContextDescriptor(oldContextDescriptor);
    }

    registerContext(sourceFile);
    const contextDescriptor = ContextRepository.contextPathToContextDescriptor.get(sourceFile.fileName) ?? null;

    if (!contextDescriptor) {
        throw new Error('Context is not registered');
    }

    registerBeans(contextDescriptor);
    checkIsAllBeansRegisteredInContextAndFillBeanRequierness(contextDescriptor);
    registerBeanDependencies(contextDescriptor);
    buildDependencyGraphAndFillQualifiedBeans(contextDescriptor);
    registerContextLifecycleMethods(contextDescriptor);
    reportAboutCyclicDependencies(contextDescriptor);

    const contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[] = [];

    const transformers: ts.TransformerFactory<any>[] = [
        addLifecycleConfiguration(contextDescriptor),
        addContextPool(contextDescriptor),
        replaceExtendingFromCatContext(contextDescriptor),
        replacePropertyBeans(contextDescriptorToIdentifierList),
        transformMethodBeans(contextDescriptorToIdentifierList),
        transformArrowFunctionBeans(contextDescriptorToIdentifierList),
        transformExpressionAndEmbeddedBeans(),
        transformLifecycleMethods(contextDescriptorToIdentifierList),
        transformLifecycleArrowFunctions(contextDescriptorToIdentifierList),
        addNecessaryImports(contextDescriptorToIdentifierList),
    ];

    const file = ts.transform<ts.SourceFile>(
        sourceFile,
        transformers,
    ).transformed[0];

    // const fileText = ts.createPrinter().printFile(file);

    return file;
}
