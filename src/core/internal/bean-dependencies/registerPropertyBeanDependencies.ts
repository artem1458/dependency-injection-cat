import ts from 'typescript';
import { IBeanDescriptor } from '../bean/BeansRepository';
import { ClassPropertyDeclarationWithInitializer } from '../ts-helpers/types';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { SourceFilesCache } from '../ts-helpers/node-source-descriptor/SourceFilesCache';
import { findClassDeclarationInSourceFileByName } from '../ts-helpers/predicates/findClassDeclarationInSourceFileByName';
import { getParameterType } from './getParameterType';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';
import { BeanDependenciesRepository } from './BeanDependenciesRepository';

export const registerPropertyBeanDependencies = (descriptor: IBeanDescriptor<ClassPropertyDeclarationWithInitializer>) => {
    //Assuming that we're already checked that first argument in property bean is reference
    const classReference = descriptor.node.initializer.arguments[0];

    const nameToFind = classReference.getText();
    const sourceFile = classReference.getSourceFile();

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(sourceFile, nameToFind);

    if (nodeSourceDescriptor === null) {
        CompilationContext.reportError({
            node: classReference,
            message: 'Can\'t qualify property bean dependencies, please try to use method bean',
        });
        return;
    }

    const nodeSourceFile = SourceFilesCache.getSourceFileByPath(nodeSourceDescriptor.path);
    const classDeclaration = findClassDeclarationInSourceFileByName(nodeSourceFile, nodeSourceDescriptor.name);

    if (classDeclaration === null) {
        CompilationContext.reportError({
            node: classReference,
            message: 'Can\'t qualify property bean dependencies, please try to use method bean',
        });
        return;
    }

    const constructor = classDeclaration.members.find(ts.isConstructorDeclaration) ?? null;

    if (constructor === null) {
        return;
    }

    const parameterTypes: Array<[ts.ParameterDeclaration, IQualifiedType | null]> =
        constructor.parameters.map(parameter => [parameter, getParameterType(parameter)]);

    const qualifiedParameters = parameterTypes.filter(([_, parameterType]) =>
        parameterType !== null) as Array<[ts.ParameterDeclaration, IQualifiedType]>;

    qualifiedParameters.forEach(([parameter, parameterType]) => {
        BeanDependenciesRepository.registerBeanDependency(
            descriptor,
            {
                qualifier: null,
                type: parameterType.typeId,
                originalTypeName: parameterType.originalTypeName,
                contextName: descriptor.contextName,
                parameterName: parameter.name.getText(),
                node: parameter,
            }
        );
    });

    const unQualifiedParameters = parameterTypes.filter(([_, parameterType]) => parameterType === null);
    if (unQualifiedParameters.length === 0) {
        return;
    }

    const unQualifiedParametersText = unQualifiedParameters
        .map(([parameter]) => parameter.getText()).join('\n');

    CompilationContext.reportError({
        node: classReference,
        message: `This class have some unqualified dependencies, please try to use method-bean instead\n${unQualifiedParametersText}`
    });
};
