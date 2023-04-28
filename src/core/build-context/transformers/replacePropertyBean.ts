import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { IBeanDescriptor, IBeanDescriptorWithId } from '../../bean/BeanRepository';
import { BeanDependenciesRepository, } from '../../bean-dependencies/BeanDependenciesRepository';
import { ClassPropertyDeclarationWithInitializer } from '../../ts-helpers/types';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';
import { getCallExpressionForBean } from './getCallExpressionForBean';

export const replacePropertyBean = (beanDescriptor: IBeanDescriptorWithId): ts.MethodDeclaration => {
    return factory.createMethodDeclaration(
        undefined,
        undefined,
        factory.createIdentifier(beanDescriptor.classMemberName),
        undefined,
        undefined,
        [],
        beanDescriptor.qualifiedType.typeNode,
        getBeanBlock(beanDescriptor),
    );
};

function getBeanBlock(parentBeanDescriptor: IBeanDescriptor): ts.Block {
    const dependencies = BeanDependenciesRepository.data
        .get(parentBeanDescriptor.contextDescriptor.name)?.get(parentBeanDescriptor) ?? [];

    const dependenciesStatements = dependencies.map(dependencyDescriptor => {
        if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.PLAIN) {
            const qualifiedBeanDescriptor = dependencyDescriptor.qualifiedBeans.firstOrNull();

            if (qualifiedBeanDescriptor === null) {
                return;
            }

            return getCallExpressionForBean(qualifiedBeanDescriptor);
        }

        if (dependencyDescriptor.qualifiedType.kind === QualifiedTypeKind.LIST) {
            const expressions = dependencyDescriptor.qualifiedBeans.list()
                .map(beanDescriptor => getCallExpressionForBean(beanDescriptor));

            return factory.createArrayLiteralExpression(
                expressions,
                true
            );
        }
    });

    const node = parentBeanDescriptor.node as ClassPropertyDeclarationWithInitializer;
    const className = node.initializer.arguments[0];

    return factory.createBlock(
        [
            factory.createReturnStatement(factory.createNewExpression(
                className,
                undefined,
                compact(dependenciesStatements),
            ))
        ],
        true
    );
}
