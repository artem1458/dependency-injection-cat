import { IContextDescriptor } from '../context/ContextRepository';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { restrictedClassMemberNames } from './constants';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { CompilationContext } from '../../compilation-context/CompilationContext';
import { IncorrectNameError } from '../../compilation-context/messages/errors/IncorrectNameError';
import { TypeQualifyError } from '../../compilation-context/messages/errors/TypeQualifyError';
import { MissingTypeDefinitionError } from '../../compilation-context/messages/errors/MissingTypeDefinitionError';

export const registerArrowFunctionBean = (
    compilationContext: CompilationContext,
    contextDescriptor: IContextDescriptor,
    classElement: ClassPropertyArrowFunction,
): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.has(classElementName)) {
        compilationContext.report(new IncorrectNameError(
            `"${classElementName}" name is reserved for the di-container.`,
            classElement.name,
            contextDescriptor.node,
        ));
        return;
    }

    const functionReturnType = classElement.initializer.type ?? null;
    const beanInfo = getPropertyDecoratorBeanInfo(compilationContext, contextDescriptor, classElement);

    if (functionReturnType === null) {
        compilationContext.report(new MissingTypeDefinitionError(
            null,
            classElement,
            contextDescriptor.node,
        ));
        return;
    }

    const qualifiedType = TypeQualifier.qualify(compilationContext, contextDescriptor, functionReturnType);

    if (qualifiedType === null) {
        compilationContext.report(new TypeQualifyError(
            null,
            classElement,
            contextDescriptor.node,
        ));
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
        beanImplementationSource: null,
        publicInfo: null,
    });
};
