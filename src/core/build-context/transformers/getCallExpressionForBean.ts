import { IBeanDescriptor } from '../../bean/BeanRepository';
import {
    getGlobalContextIdentifierFromArrayOrCreateNewAndPush,
    TContextDescriptorToIdentifier
} from '../utils/getGlobalContextIdentifierFromArrayOrCreateNewAndPush';
import ts, { factory } from 'typescript';
import { isBeanDependencyFromCurrentContext } from '../utils/isBeanDependencyFromCurrentContext';

export const getCallExpressionForBean = (
    qualifiedBean: IBeanDescriptor,
    dependencyParentBean: IBeanDescriptor,
    contextDescriptorToIdentifierList: TContextDescriptorToIdentifier[],
): ts.CallExpression => {
    if (isBeanDependencyFromCurrentContext(qualifiedBean, dependencyParentBean)) {
        return factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createThis(),
                factory.createIdentifier('getPrivateBean')
            ),
            undefined,
            [factory.createStringLiteral(qualifiedBean.classMemberName)]
        );
    }

    const globalContextIdentifier = getGlobalContextIdentifierFromArrayOrCreateNewAndPush(
        qualifiedBean.contextDescriptor,
        contextDescriptorToIdentifierList,
    );

    return factory.createCallExpression(
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
};
