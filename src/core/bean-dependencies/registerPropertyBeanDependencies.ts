import ts from 'typescript';
import { IBeanDescriptor } from '../bean/BeanRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { SourceFilesCache } from '../ts-helpers/source-files-cache/SourceFilesCache';
import {
    findClassDeclarationInSourceFileByName
} from '../ts-helpers/predicates/findClassDeclarationInSourceFileByName';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { ExtendedSet } from '../utils/ExtendedSet';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';
import { DependencyResolvingError } from '../../compilation-context/messages/errors/DependencyResolvingError';

export const registerPropertyBeanDependencies = (
    compilationContext: CompilationContext,
    descriptor: IBeanDescriptor<ClassPropertyDeclarationWithInitializer>
) => {
    //Assuming that we're already checked that first argument in property bean is reference
    const beanProperty = descriptor.node;
    const classReference = descriptor.node.initializer.arguments[0];

    const classReferenceName = classReference.getText();
    const sourceFile = classReference.getSourceFile();

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(sourceFile, classReferenceName);

    if (nodeSourceDescriptor === null) {
        compilationContext.report(new DependencyResolvingError(
            'Try to use method bean instead.',
            beanProperty,
            descriptor.contextDescriptor.node,
        ));
        return;
    }

    const nodeSourceFile = SourceFilesCache.getSourceFileByPath(nodeSourceDescriptor.path);
    const classDeclaration = findClassDeclarationInSourceFileByName(nodeSourceFile, nodeSourceDescriptor.name);
    descriptor.beanImplementationSource = nodeSourceDescriptor;

    if (classDeclaration === null) {
        compilationContext.report(new DependencyResolvingError(
            'Try to use method bean instead.',
            beanProperty,
            descriptor.contextDescriptor.node,
        ));
        return;
    }

    const constructor = classDeclaration.members.find(ts.isConstructorDeclaration) ?? null;

    if (constructor === null) {
        return;
    }

    const parameterTypes: Array<[ts.ParameterDeclaration, QualifiedType | null]> =
        constructor.parameters.map(parameter => [
            parameter,
            getParameterType(compilationContext, descriptor.contextDescriptor, parameter)
        ]);

    const qualifiedParameters = parameterTypes.filter(([_, parameterType]) =>
        parameterType !== null) as Array<[ts.ParameterDeclaration, QualifiedType]>;

    qualifiedParameters.forEach(([parameter, qualifiedType]) => {
        BeanDependenciesRepository.registerBeanDependency(
            descriptor,
            {
                qualifier: null,
                contextName: descriptor.contextDescriptor.name,
                qualifiedType: qualifiedType,
                parameterName: parameter.name.getText(),
                node: parameter,
                qualifiedBeans: new ExtendedSet(),
            }
        );
    });

    const unqualifiedParameters = parameterTypes.filter(([_, parameterType]) => parameterType === null);

    unqualifiedParameters.forEach(([parameter]) => {
        compilationContext.report(new TypeQualifyError(
            `Parameter name: "${parameter.name.getText()}".`,
            beanProperty,
            descriptor.contextDescriptor.node,
        ));
    });
};
