import ts, { factory } from 'typescript';
import { IBeanDescriptorWithId } from '../../bean/BeanRepository';
import { ClassPropertyDeclarationWithExpressionInitializer } from '../../ts-helpers/types';
import { getModifiersOnly } from '../../utils/getModifiersOnly';

export const transformExpressionOrEmbeddedBean = (beanDescriptor: IBeanDescriptorWithId): ts.PropertyDeclaration => {
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
};
