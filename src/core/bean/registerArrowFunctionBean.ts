import { IContextDescriptor } from '../context/ContextRepository';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { restrictedClassMemberNames } from './constants';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';

export const registerArrowFunctionBean = (contextDescriptor: IContextDescriptor, classElement: ClassPropertyArrowFunction): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.has(classElementName)) {
        CompilationContext.reportError({
            node: classElement,
            message: `${classElementName} name is reserved for the di-container, please use another name instead`,
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    const functionReturnType = classElement.initializer.type ?? null;
    const beanInfo = getPropertyDecoratorBeanInfo(classElement);

    if (functionReturnType === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean, please specify type explicitly',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });

        return;
    }

    const qualifiedType = TypeQualifier.qualify(functionReturnType);

    if (qualifiedType === null) {
        CompilationContext.reportError({
            node: classElement,
            message: 'Can\'t qualify type of Bean',
            filePath: contextDescriptor.absolutePath,
            relatedContextPath: contextDescriptor.absolutePath,
        });
        return;
    }

    BeanRepository.registerBean({
        classMemberName: classElement.name.getText(),
        nestedProperty: null,
        contextDescriptor,
        scope: beanInfo.scope,
        node: classElement,
        qualifiedType: qualifiedType,
        beanKind: 'arrowFunction',
        beanSourceLocation: null,
        isPublic: false,
    });
};
