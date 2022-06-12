import { IContextDescriptor } from '../context/ContextRepository';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';
import { registerMethodBean } from './registerMethodBean';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { registerPropertyBean } from './registerPropertyBean';
import { BeanRepository } from './BeanRepository';
import { isArrowFunctionBean } from '../ts-helpers/predicates/isArrowFunctionBean';
import { registerArrowFunctionBean } from './registerArrowFunctionBean';
import { isExpressionBean } from '../ts-helpers/predicates/isExpressionBean';
import { registerExpressionBean } from './registerExpressionBean';
import { isEmbeddedBean } from '../ts-helpers/predicates/isEmbeddedBean';
import { registerEmbeddedBean } from './registerEmbeddedBeans';
import { CompilationContext2 } from '../../compilation-context/CompilationContext2';

export function registerBeans(compilationContext: CompilationContext2, contextDescriptor: IContextDescriptor) {
    BeanRepository.clearBeanInfoByContextDescriptor(contextDescriptor);

    contextDescriptor.node.members.forEach((classElement) => {
        if (isMethodBean(classElement)) {
            registerMethodBean(compilationContext, contextDescriptor, classElement);
        }
        if (isClassPropertyBean(classElement)) {
            registerPropertyBean(compilationContext, contextDescriptor, classElement);
        }
        if (isArrowFunctionBean(classElement)) {
            registerArrowFunctionBean(compilationContext, contextDescriptor, classElement);
        }
        if (isExpressionBean(classElement)) {
            registerExpressionBean(compilationContext, contextDescriptor, classElement);
        }
        if (isEmbeddedBean(classElement)) {
            registerEmbeddedBean(compilationContext, contextDescriptor, classElement);
        }
    });
}
