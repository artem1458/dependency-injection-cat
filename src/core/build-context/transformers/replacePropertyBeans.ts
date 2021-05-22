import ts, { factory } from 'typescript';
import { compact } from 'lodash';
import { BeanRepository, IBeanDescriptor, TBeanNode } from '../../bean/BeanRepository';
import { BeanDependenciesRepository, } from '../../bean-dependencies/BeanDependenciesRepository';
import { ClassPropertyDeclarationWithInitializer } from '../../ts-helpers/types';
import { getGlobalContextVariableNameByContextId } from '../utils/getGlobalContextVariableNameByContextId';
import { isBeanDependencyFromCurrentContext } from '../utils/isBeanDependencyFromCurrentContext';

export const replacePropertyBeans = (globalContextIdsToAdd: string[]): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (ts.isPropertyDeclaration(node) && BeanRepository.beanNodeToBeanDescriptorMap.has(node as TBeanNode)) {
                    const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode) ?? null;
                    if (beanDescriptor === null) {
                        return;
                    }

                    return factory.createMethodDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        factory.createIdentifier(beanDescriptor.classMemberName),
                        undefined,
                        undefined,
                        [],
                        beanDescriptor.typeNode,
                        getBeanBlock(beanDescriptor, globalContextIdsToAdd),
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
};

function getBeanBlock(beanDescriptor: IBeanDescriptor, globalContextIdsToAdd: string[]): ts.Block {
    const dependencies = BeanDependenciesRepository.beanDependenciesRepository
        .get(beanDescriptor.contextDescriptor.name)?.get(beanDescriptor) ?? [];

    const dependenciesStatements = dependencies.map(dependencyDescriptor => {
        if (dependencyDescriptor.qualifiedBean === null) {
            return null;
        }

        if (isBeanDependencyFromCurrentContext(beanDescriptor, dependencyDescriptor.qualifiedBean)) {
            return factory.createCallExpression(
                factory.createPropertyAccessExpression(
                    factory.createThis(),
                    factory.createIdentifier('getBean')
                ),
                undefined,
                [factory.createStringLiteral(dependencyDescriptor.qualifiedBean.classMemberName)]
            );
        }

        globalContextIdsToAdd.push(dependencyDescriptor.qualifiedBean.contextDescriptor.id);

        return factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier(getGlobalContextVariableNameByContextId(dependencyDescriptor.qualifiedBean.contextDescriptor.id)),
                factory.createIdentifier('getBean')
            ),
            undefined,
            [factory.createStringLiteral(dependencyDescriptor.qualifiedBean.classMemberName)]
        );
    });

    const node = beanDescriptor.node as ClassPropertyDeclarationWithInitializer;
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
