import ts, { factory } from 'typescript';
import { BeanRepository, TBeanNode } from '../../bean/BeanRepository';
import { ClassPropertyDeclarationWithExpressionInitializer } from '../../ts-helpers/types';

export const transformPlainPropertyBeans = (): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode) ?? null;

                if (beanDescriptor?.beanKind === 'plainProperty') {
                    const typedNode = beanDescriptor.node as ClassPropertyDeclarationWithExpressionInitializer;
                    const newExpression = factory.createArrowFunction(
                        typedNode.modifiers,
                        undefined,
                        [],
                        typedNode.type,
                        undefined,
                        typedNode.initializer,
                    );

                    return factory.updatePropertyDeclaration(
                        typedNode,
                        undefined,
                        typedNode.modifiers,
                        typedNode.name,
                        typedNode.questionToken,
                        typedNode.type,
                        newExpression,
                    );
                }

                return ts.visitEachChild(node, visitor, context);
            };

            return ts.visitNode(sourceFile, visitor);
        };
    };
};
