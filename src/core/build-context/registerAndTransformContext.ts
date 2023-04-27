import ts from 'typescript';
import { addContextPool } from './transformers/addContextPool';
import { replaceExtendingFromCatContext } from './transformers/replaceExtendingFromCatContext';
import { replacePropertyBeans } from './transformers/replacePropertyBeans';
import { transformMethodBeans } from './transformers/transformMethodBeans';
import { addNecessaryImports } from './transformers/addNecessaryImports';
import { ContextRepository } from '../context/ContextRepository';
import { registerContext } from '../context/registerContext';
import { registerBeans } from '../bean/registerBeans';
import {
    checkIsAllBeansRegisteredInContextAndFillBeanRequierness
} from '../bean/checkIsAllBeansRegisteredInContextAndFillBeanRequierness';
import { registerBeanDependencies } from '../bean-dependencies/registerBeanDependencies';
import {
    buildDependencyGraphAndFillQualifiedBeans
} from '../connect-dependencies/buildDependencyGraphAndFillQualifiedBeans';
import { reportAboutCyclicDependencies } from '../report-cyclic-dependencies/reportAboutCyclicDependencies';
import { transformArrowFunctionBeans } from './transformers/transformArrowFunctionBeans';
import { transformExpressionAndEmbeddedBeans } from './transformers/transformExpressionAndEmbeddedBeans';
import { registerContextLifecycleMethods } from '../context-lifecycle/registerContextLifecycleMethods';
import { transformLifecycleMethods } from './transformers/transformLifecycleMethods';
import { transformLifecycleArrowFunctions } from './transformers/transformLifecycleArrowFunctions';
import { addLifecycleConfiguration } from './transformers/addLifecycleConfiguration';
import { DependencyGraph } from '../connect-dependencies/DependencyGraph';
import { CompilationContext } from '../../compilation-context/CompilationContext';

export function registerAndTransformContext(
    compilationContext: CompilationContext,
    sourceFile: ts.SourceFile
): ts.SourceFile {
    compilationContext.clearMessagesByFilePath(sourceFile.fileName);

    const oldContextDescriptor = ContextRepository.contextPathToContextDescriptor.get(sourceFile.fileName);

    if (oldContextDescriptor) {
        DependencyGraph.clearByContextDescriptor(oldContextDescriptor);
    }

    registerContext(compilationContext, sourceFile);
    const contextDescriptor = ContextRepository.contextPathToContextDescriptor.get(sourceFile.fileName) ?? null;

    if (!contextDescriptor) {
        throw new Error('Context is not registered');
    }

    registerBeans(compilationContext, contextDescriptor);
    checkIsAllBeansRegisteredInContextAndFillBeanRequierness(compilationContext, contextDescriptor);
    registerBeanDependencies(compilationContext, contextDescriptor);
    buildDependencyGraphAndFillQualifiedBeans(compilationContext, contextDescriptor);
    registerContextLifecycleMethods(compilationContext, contextDescriptor);
    reportAboutCyclicDependencies(compilationContext, contextDescriptor);

    const transformers: ts.TransformerFactory<any>[] = [
        addLifecycleConfiguration(contextDescriptor),
        addContextPool(contextDescriptor),
        replaceExtendingFromCatContext(contextDescriptor),
        replacePropertyBeans(),
        transformMethodBeans(),
        transformArrowFunctionBeans(),
        transformExpressionAndEmbeddedBeans(),
        transformLifecycleMethods(),
        transformLifecycleArrowFunctions(),
        addNecessaryImports(),
    ];

    return ts.transform<ts.SourceFile>(
        sourceFile,
        transformers,
    ).transformed[0];
}
