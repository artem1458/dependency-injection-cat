import { IBeanDescriptor } from '../../bean/BeanRepository';
import ts, { factory } from 'typescript';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';

export const getCallExpressionForBean = (qualifiedBean: IBeanDescriptor): ts.Expression => {
    let beanAccessExpression: ts.Expression = factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createThis(),
            factory.createIdentifier('dicat_getPrivateBean')
        ),
        undefined,
        [factory.createStringLiteral(qualifiedBean.classMemberName)]
    );

    if (qualifiedBean.nestedProperty !== null) {
        beanAccessExpression = factory.createPropertyAccessExpression(
            beanAccessExpression,
            factory.createIdentifier(qualifiedBean.nestedProperty),
        );
    }

    if (qualifiedBean.qualifiedType.kind === QualifiedTypeKind.LIST) {
        return factory.createSpreadElement(beanAccessExpression);
    } else {
        return beanAccessExpression;
    }
};
