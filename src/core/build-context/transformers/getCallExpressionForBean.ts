import { IBeanDescriptor } from '../../bean/BeanRepository';
import {
    getGlobalContextIdentifierFromArrayOrCreateNewAndPush,
    TContextDescriptorToIdentifier
} from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import ts, { factory } from 'typescript';
import { isBeanDependencyFromCurrentContext } from '../utils/isBeanDependencyFromCurrentContext';
import { QualifiedTypeKind } from '../../ts-helpers/type-qualifier/QualifiedType';

export const getCallExpressionForBean = (
    qualifiedBean: IBeanDescriptor,
    dependencyParentBean: IBeanDescriptor,
    contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[],
): ts.Expression => {
    if (isBeanDependencyFromCurrentContext(qualifiedBean, dependencyParentBean)) {
        let beanAccessExpression: ts.Expression = factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier('getPrivateBean')
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
    }

    const globalContextIdentifier = getGlobalContextIdentifierFromArrayOrCreateNewAndPush(
        qualifiedBean.contextDescriptor,
        contextDescriptorToIdentifierList,
    );

    let beanAccessExpression: ts.Expression = factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createPropertyAccessExpression(
                globalContextIdentifier,
                factory.createIdentifier(globalContextIdentifier.text),
            ),
            factory.createIdentifier('getPrivateBean')
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
