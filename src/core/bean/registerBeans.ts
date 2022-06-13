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
import { CompilationContext } from '../../compilation-context/CompilationContext';

export function registerBeans(compilationContext: CompilationContext, contextDescriptor: IContextDescriptor) {
    BeanRepository.clearBeanInfoByContextDescriptor(contextDescriptor);

    contextDescriptor.node.members.forEach((classElement) => {
        if (isMethodBean(classElement)) {
            registerMethodBean(compilationContext, contextDescriptor, classElement);
        }
        if (isClassPropertyBean(classElement)) {
            registerPropertyBean(compilationContext, contextDescriptor, classElement);
        }
        if (isArrowFunctionBean(compilationContext, contextDescriptor, classElement)) {
            registerArrowFunctionBean(compilationContext, contextDescriptor, classElement);
        }
        if (isExpressionBean(compilationContext, contextDescriptor, classElement)) {
            registerExpressionBean(compilationContext, contextDescriptor, classElement);
        }
        if (isEmbeddedBean(compilationContext, contextDescriptor, classElement)) {
            registerEmbeddedBean(compilationContext, contextDescriptor, classElement);
        }
    });
}
