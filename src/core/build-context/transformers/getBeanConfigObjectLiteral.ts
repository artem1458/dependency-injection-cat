import ts, { factory } from 'typescript';
import { uniqBy } from 'lodash';
import { IContextDescriptor } from '../../context/ContextRepository';
import { BeanRepository } from '../../bean/BeanRepository';

export function getBeanConfigObjectLiteral(contextDescriptor: IContextDescriptor): ts.ObjectLiteralExpression {
    const contextBeans = BeanRepository.contextIdToBeanDescriptorsMap.get(contextDescriptor.id) ?? [];
    const notNestedContextBeans = contextBeans.filter(it => it.nestedProperty === null);
    const objectLiteralMembers: ts.PropertyAssignment[] = notNestedContextBeans.map(bean => (
        factory.createPropertyAssignment(
            factory.createComputedPropertyName(factory.createStringLiteral(bean.classMemberName)),
            factory.createObjectLiteralExpression(
                [
                    factory.createPropertyAssignment(
                        factory.createIdentifier('scope'),
                        factory.createStringLiteral(bean.scope)
                    ),
                    bean.isPublic && factory.createPropertyAssignment(
                        factory.createIdentifier('isPublic'),
                        factory.createTrue(),
                    ),
                ].filter((it): it is ts.PropertyAssignment => Boolean(it)),
                false
            )
        )
    ));

    return factory.createObjectLiteralExpression(
        objectLiteralMembers,
        true
    );
}
