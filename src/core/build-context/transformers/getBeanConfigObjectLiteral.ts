import ts, { factory } from 'typescript';
import { Context } from '../../context/Context';

export function getBeanConfigObjectLiteral(context: Context): ts.ObjectLiteralExpression {
    const notNestedContextBeans = Array.from(context.beans).filter(it => it.nestedProperty === null);

    const objectLiteralMembers: ts.PropertyAssignment[] = notNestedContextBeans.map(bean => (
        factory.createPropertyAssignment(
            factory.createComputedPropertyName(factory.createStringLiteral(bean.classMemberName)),
            factory.createObjectLiteralExpression(
                [
                    bean.scope === 'singleton'
                        ? null
                        : factory.createPropertyAssignment(
                            factory.createIdentifier('scope'),
                            factory.createStringLiteral(bean.scope)
                        ),
                    bean.public && factory.createPropertyAssignment(
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
