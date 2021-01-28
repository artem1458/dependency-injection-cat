import * as ts from 'typescript';
import { ITypeIdQualifierResult } from '../common/types';
import { getClassMemberLocationMessage } from '../../getClassMemberLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { isBeanDecorator } from '../../../core/internal/ts-helpers/predicates/isBeanDecorator';
import { getMethodBeanInfo } from '../../bean-info/getMethodBeanInfo';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';

export function methodBeanTypeIdQualifier(method: ts.MethodDeclaration): ITypeIdQualifierResult {
    if (method.type === undefined) {
        throw new Error('Bean should should have a type' + getClassMemberLocationMessage(method));
    }

    const baseType = typeIdQualifier(method.type);

    let beansDecoratorsCount = 0;
    let bean: ts.Decorator | undefined = undefined;

    method.decorators?.forEach(it => {
        if (isBeanDecorator(it)) {
            beansDecoratorsCount++;
            bean = it;
        }
    });

    if (beansDecoratorsCount === 0 || bean === undefined) {
        throw new Error('Bean method should have @Bean decorator (how is it possible?)' + getClassMemberLocationMessage(method));
    }

    if (beansDecoratorsCount > 1) {
        throw new Error('Bean method should have only 1 @Bean decorator' + getClassMemberLocationMessage(method));
    }

    const beanInfo = getMethodBeanInfo(bean);

    if (beanInfo.qualifier === undefined) {
        return baseType;
    }

    return {
        typeId: `${baseType.typeId}${START_QUALIFIER_TOKEN}${beanInfo.qualifier}${END_QUALIFIER_TOKEN}`,
        originalTypeName: baseType.originalTypeName,
    };
}
