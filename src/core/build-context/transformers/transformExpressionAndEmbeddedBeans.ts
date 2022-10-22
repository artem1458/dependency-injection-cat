import ts, { factory } from 'typescript';
import { BeanRepository, TBeanNode } from '../../bean/BeanRepository';
import { ClassPropertyDeclarationWithExpressionInitializer } from '../../ts-helpers/types';
import { getModifiersOnly } from '../../utils/getModifiersOnly';

export const transformExpressionAndEmbeddedBeans = (): ts.TransformerFactory<ts.SourceFile> => {
    return context => {
        return sourceFile => {
            const visitor: ts.Visitor = (node: ts.Node) => {
                const beanDescriptor = BeanRepository.beanNodeToBeanDescriptorMap.get(node as TBeanNode) ?? null;

                if (beanDescriptor?.beanKind === 'expression' || beanDescriptor?.beanKind === 'embedded') {
                    const typedNode = beanDescriptor.node as ClassPropertyDeclarationWithExpressionInitializer;
                    const newExpression = factory.createArrowFunction(
                        undefined,
                        undefined,
                        [],
                        typedNode.type,
                        undefined,
                        typedNode.initializer,
                    );

                    return factory.updatePropertyDeclaration(
                        typedNode,
                        getModifiersOnly(typedNode),
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
