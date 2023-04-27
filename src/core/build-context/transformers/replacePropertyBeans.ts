import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { BeanRepository, IBeanDescriptor, TBeanNode } from '../../bean/BeanRepository';
import { BeanDependenciesRepository, } from '../../bean-dependencies/BeanDependenciesRepository';
import { ClassPropertyDeclarationWithInitializer } from '../../ts-helpers/types';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';
import { getCallExpressionForBean } from './getCallExpressionForBean';

export const replacePropertyBeans = (): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode);

                if (beanDescriptor?.beanKind === 'property') {
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
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
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
