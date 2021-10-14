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
): ts.CallExpression | ts.SpreadElement => {
    if (isBeanDependencyFromCurrentContext(qualifiedBean, dependencyParentBean)) {
        const callExpression = factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier('getPrivateBean')
            ),
            undefined,
            [factory.createStringLiteral(qualifiedBean.classMemberName)]
        );

        if (qualifiedBean.qualifiedType.kind === QualifiedTypeKind.LIST) {
            return factory.createSpreadElement(callExpression);
        } else {
            return callExpression;
        }
    }

    const globalContextIdentifier = getGlobalContextIdentifierFromArrayOrCreateNewAndPush(
        qualifiedBean.contextDescriptor,
        contextDescriptorToIdentifierList,
    );

    const callExpression = factory.createCallExpression(
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

    if (qualifiedBean.qualifiedType.kind === QualifiedTypeKind.LIST) {
        return factory.createSpreadElement(callExpression);
    } else {
        return callExpression;
    }
};
