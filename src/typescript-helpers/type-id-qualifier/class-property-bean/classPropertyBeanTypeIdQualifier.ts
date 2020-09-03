import { IClassPropertyDeclarationWithInitializer, ITypeIdQualifierResult } from '../common/types';
import { getClassMemberLocationMessage } from '../../getClassMemberLocationMessage';
import { typeIdQualifier } from '../common/typeIdQualifier';
import { END_QUALIFIER_TOKEN, START_QUALIFIER_TOKEN } from '../common/parseTokens';
import { getPropertyBeanInfo } from '../../bean-info/getPropertyBeanInfo';

export function classPropertyBeanTypeIdQualifier(property: IClassPropertyDeclarationWithInitializer): ITypeIdQualifierResult {
    if (property.initializer.typeArguments === undefined) {
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
    }
}
