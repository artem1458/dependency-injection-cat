import * as ts from 'typescript';
import { ITypeIdQualifierResult } from '../common/types';
import { getClassMemberLocationMessage } from '../../getClassMemberLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { isBeanDecorator } from '../../decorator-helpers/isBeanDecorator';
import { getMethodBeanInfo } from '../../bean-info/getMethodBeanInfo';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';

export function classPropertyBeanTypeIdQualifier(property: ts.PropertyDeclaration): ITypeIdQualifierResult {
    if (property.type === undefined) {
        throw new Error('Bean should should have a type' + getClassMemberLocationMessage(property));
    }

    const baseType = typeIdQualifier(property.type);

    let beansDecoratorsCount = 0;
    let bean: ts.Decorator | undefined = undefined;

    property.decorators?.forEach(it => {
        if (isBeanDecorator(it)) {
            beansDecoratorsCount++;
            bean = it;
        }
    });

    if (beansDecoratorsCount === 0 || bean === undefined) {
        throw new Error('Bean method should have @Bean decorator (how is it possible?)' + getClassMemberLocationMessage(property));
    }

    if (beansDecoratorsCount > 1) {
        throw new Error('Bean method should have only 1 @Bean decorator' + getClassMemberLocationMessage(property));
    }

    const beanInfo = getMethodBeanInfo(bean);

    if (beanInfo.qualifier === undefined) {
        return baseType;
    }

    return {
        typeId: `${baseType.typeId}${START_QUALIFIER_TOKEN}${beanInfo.qualifier}${END_QUALIFIER_TOKEN}`,
        originalTypeName: baseType.originalTypeName,
    }
}
