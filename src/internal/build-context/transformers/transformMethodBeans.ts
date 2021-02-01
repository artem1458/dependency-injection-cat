import ts, { factory } from 'typescript';
import { BeanRepository, IBeanDescriptorWithId, TBeanNode } from '../../bean/BeanRepository';
import { BeanDependenciesRepository } from '../../bean-dependencies/BeanDependenciesRepository';

export const transformMethodBeans = (): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                if (ts.isMethodDeclaration(node) && BeanRepository.beanNodeToBeanDescriptorMap.has(node as TBeanNode)) {
                    const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode) ?? null;
                    if (beanDescriptor === null) {
                        return;
                    }

                    const newBody = getNewBody(beanDescriptor);

                    return factory.updateMethodDeclaration(
                        node,
                        undefined,
                        undefined,
                        undefined,
                        node.name,
                        undefined,
                        undefined,
                        [],
                        node.type,
                        newBody,
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
};

function getNewBody (beanDescriptor: IBeanDescriptorWithId): ts.Block {
    const node = beanDescriptor.node as ts.MethodDeclaration;
    const nodeBody = node.body ?? factory.createBlock([]);

    const dependencies = BeanDependenciesRepository.beanDependenciesRepository
        .get(beanDescriptor.contextName)?.get(beanDescriptor) ?? [];

    const dependenciesStatements = dependencies.map(dependencyDescriptor => {
        return factory.createVariableStatement(
            undefined,
            factory.createVariableDeclarationList(
                [factory.createVariableDeclaration(
                    factory.createIdentifier(dependencyDescriptor.parameterName),
                    undefined,
                    dependencyDescriptor.node.type,
                    factory.createCallExpression(
                        factory.createPropertyAccessExpression(
                            factory.createSuper(),
                            factory.createIdentifier('getBean')
                        ),
                        undefined,
                        [factory.createStringLiteral(dependencyDescriptor.qualifiedBean?.classMemberName ?? '')]
                    )
                )],
                ts.NodeFlags.Const
            )
        );
    });

    return factory.updateBlock(
        nodeBody,
        [
            ...dependenciesStatements,
            ...nodeBody.statements,
        ]
    );
}
