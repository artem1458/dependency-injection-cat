import ts from 'typescript';
import { IBeanDescriptor } from '../bean/BeanRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { SourceFilesCache } from '../ts-helpers/source-files-cache/SourceFilesCache';
import { findClassDeclarationInSourceFileByName } from '../ts-helpers/predicates/findClassDeclarationInSourceFileByName';
import { getParameterType } from './getParameterType';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';
import { QualifiedType } from '../ts-helpers/type-qualifier/QualifiedType';
import { ExtendedSet } from '../utils/ExtendedSet';
import { CompilationContext2 } from '../../compilation-context/CompilationContext2';

export const registerPropertyBeanDependencies = (
    compilationContext: CompilationContext2,
    descriptor: IBeanDescriptor<ClassPropertyDeclarationWithInitializer>
) => {
    //Assuming that we're already checked that first argument in property bean is reference
    const classReference = descriptor.node.initializer.arguments[0];

    const nameToFind = classReference.getText();
    const sourceFile = classReference.getSourceFile();

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(sourceFile, nameToFind);

    if (nodeSourceDescriptor === null) {
        CompilationContext.reportError({
            node: classReference,
            message: 'Can\'t qualify property Bean dependencies, please try to use method Bean',
            filePath: descriptor.contextDescriptor.absolutePath,
            relatedContextPath: descriptor.contextDescriptor.absolutePath,
        });
        return;
    }

    const nodeSourceFile = SourceFilesCache.getSourceFileByPath(nodeSourceDescriptor.path);
    const classDeclaration = findClassDeclarationInSourceFileByName(nodeSourceFile, nodeSourceDescriptor.name);
    descriptor.beanSourceLocation = nodeSourceDescriptor.path;

    if (classDeclaration === null) {
        CompilationContext.reportError({
            node: classReference,
            message: 'Can\'t qualify property Bean dependencies, please try to use method bean',
            filePath: descriptor.contextDescriptor.absolutePath,
            relatedContextPath: descriptor.contextDescriptor.absolutePath,
        });
        return;
    }

    const constructor = classDeclaration.members.find(ts.isConstructorDeclaration) ?? null;

    if (constructor === null) {
        return;
    }

    const parameterTypes: Array<[ts.ParameterDeclaration, QualifiedType | null]> =
        constructor.parameters.map(parameter => [parameter, getParameterType(parameter)]);

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

    const unQualifiedParameters = parameterTypes.filter(([_, parameterType]) => parameterType === null);
    if (unQualifiedParameters.length === 0) {
        return;
    }

    const unQualifiedParametersText = unQualifiedParameters
        .map(([parameter]) => `${parameter.getText()} <--`).join('\n');

    CompilationContext.reportError({
        node: classReference,
        message: `Class "${classReference.getText()}" have some unqualified dependencies, please try to use "method Bean" instead:\n${unQualifiedParametersText}`,
        filePath: descriptor.contextDescriptor.absolutePath,
        relatedContextPath: descriptor.contextDescriptor.absolutePath,
    });
};
