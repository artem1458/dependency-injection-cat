import { IContextDescriptor } from '../context/ContextRepository';
import * as ts from 'typescript';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { typeQualifier } from '../ts-helpers/type-qualifier/typeQualifier';
import { getMethodBeanInfo } from '../ts-helpers/bean-info/getMethodBeanInfo';
import { BeansRepository } from './BeansRepository';
import { IQualifiedType } from '../ts-helpers/type-qualifier/types';

export function registerMethodBean(contextDescriptor: IContextDescriptor, classElement: ts.MethodDeclaration): void {
    const typeInfo = getBeanTypeInfoFromMethod(classElement);
    const beanInfo = getMethodBeanInfo(classElement);

    if (typeInfo === null) {
        return;
    }

    BeansRepository.registerMethodBean({
        classMemberName: classElement.name.getText(),
        qualifierName: beanInfo.qualifier,
        contextName: contextDescriptor.name,
        typeId: typeInfo.typeId,
        originalTypeName: typeInfo.originalTypeName,
        scope: beanInfo.scope,
        node: classElement,
    });
}

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