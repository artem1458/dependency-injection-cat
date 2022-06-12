import { IContextDescriptor } from '../context/ContextRepository';
import { getPropertyDecoratorBeanInfo } from '../ts-helpers/bean-info/getPropertyDecoratorBeanInfo';
import { BeanRepository } from './BeanRepository';
import { restrictedClassMemberNames } from './constants';
import { ClassPropertyArrowFunction } from '../ts-helpers/types';
import { TypeQualifier } from '../ts-helpers/type-qualifier/TypeQualifier';
import { CompilationContext2 } from '../../compilation-context/CompilationContext2';
import { IncorrectNameError } from '../../exceptions/compilation/errors/IncorrectNameError';
import { TypeQualifyError } from '../../exceptions/compilation/errors/TypeQualifyError';
import { MissingTypeDefinitionError } from '../../exceptions/compilation/errors/MissingTypeDefinitionError';

export const registerArrowFunctionBean = (
    compilationContext: CompilationContext2,
    contextDescriptor: IContextDescriptor,
    classElement: ClassPropertyArrowFunction,
): void => {
    const classElementName = classElement.name.getText();

    if (restrictedClassMemberNames.has(classElementName)) {
        compilationContext.report(new IncorrectNameError(
            `${classElementName} name is reserved for the di-container.`,
            classElement.name,
            contextDescriptor.node,
        ));
        return;
    }

    const functionReturnType = classElement.initializer.type ?? null;
    const beanInfo = getPropertyDecoratorBeanInfo(classElement);

    if (functionReturnType === null) {
        compilationContext.report(new MissingTypeDefinitionError(
            null,
            classElement,
            contextDescriptor.node,
        ));
        return;
    }

    const qualifiedType = TypeQualifier.qualify(functionReturnType);

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
        beanSourceLocation: null,
        isPublic: false,
    });
};
