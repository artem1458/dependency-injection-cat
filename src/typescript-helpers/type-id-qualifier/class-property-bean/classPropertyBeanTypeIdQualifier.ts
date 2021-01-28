import { ITypeIdQualifierResult } from '../common/types';
import { getClassMemberLocationMessage } from '../../getClassMemberLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';
import { getPropertyBeanInfo } from '../../bean-info/getPropertyBeanInfo';
import { isCallExpressionWithTypeArguments } from '../../call-expression/isCallExpressionWithTypeArguments';
import { ClassPropertyDeclarationWithInitializer } from '../../../core/internal/ts-helpers/types';

export function classPropertyBeanTypeIdQualifier(property: ClassPropertyDeclarationWithInitializer): ITypeIdQualifierResult {
    if (!isCallExpressionWithTypeArguments(property.initializer)) {
        throw new Error('Bean should should have a type' + getClassMemberLocationMessage(property));
    }

    const baseType = typeIdQualifier(property.initializer.typeArguments[0]);

    const beanInfo = getPropertyBeanInfo(property.initializer);

    if (beanInfo.qualifier === undefined) {
        return baseType;
    }

    return {
        typeId: `${baseType.typeId}${START_QUALIFIER_TOKEN}${beanInfo.qualifier}${END_QUALIFIER_TOKEN}`,
        originalTypeName: baseType.originalTypeName,
    };
}
