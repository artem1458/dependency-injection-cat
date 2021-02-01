import ts, { factory } from 'typescript';
import { BeanRepository, IBeanDescriptor, TBeanNode } from '../../bean/BeanRepository';
import { BeanDependenciesRepository } from '../../bean-dependencies/BeanDependenciesRepository';
import { ClassPropertyDeclarationWithInitializer } from '../../ts-helpers/types';

export const replacePropertyBeans = (): ts.TransformerFactory<ts.SourceFile> => {
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
                        beanDescriptor.node.type,
                        getBeanBlock(beanDescriptor),
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
};

function getBeanBlock(beanDescriptor: IBeanDescriptor): ts.Block {
    const dependencies = BeanDependenciesRepository.beanDependenciesRepository
        .get(beanDescriptor.contextName)?.get(beanDescriptor) ?? [];

    const dependenciesStatements = dependencies.map(dependencyDescriptor => {
        return factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createSuper(),
                factory.createIdentifier('getBean')
            ),
            undefined,
            [factory.createStringLiteral(dependencyDescriptor.qualifiedBean?.classMemberName ?? '')]
        );
    });

    const node = beanDescriptor.node as ClassPropertyDeclarationWithInitializer;
    const className = node.initializer.arguments[0].getText();

    return factory.createBlock(
        [
            factory.createReturnStatement(factory.createNewExpression(
                factory.createIdentifier(className),
                undefined,
                dependenciesStatements
            ))
        ],
        true
    );
}
