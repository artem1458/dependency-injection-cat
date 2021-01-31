import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { getMethodBeanInfo } from '../ts-helpers/bean-info/getMethodBeanInfo';
import { BeanRepository } from './BeanRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';

export const registerMethodBean = (contextDescriptor: IContextDescriptor, classElement: ts.MethodDeclaration): void => {
    const typeInfo = getBeanTypeInfoFromMethod(classElement);
    const beanInfo = getMethodBeanInfo(classElement);

    if (typeInfo === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean',
        });
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        qualifier: beanInfo.qualifier,
        contextName: contextDescriptor.name,
        type: typeInfo.typeId,
        originalTypeName: typeInfo.originalTypeName,
        scope: beanInfo.scope,
        node: classElement,
    });
};

function getBeanTypeInfoFromMethod(classElement: ts.MethodDeclaration): IQualifiedType | null {
    const methodReturnType = classElement.type ?? null;

    if (methodReturnType !== null) {
        return typeQualifier(methodReturnType);
    } else {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean, please specify type explicitly',
        });

        return null;
    }
}
