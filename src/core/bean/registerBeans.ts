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

export function registerBeans(contextDescriptor: IContextDescriptor) {
    BeanRepository.clearBeanInfoByContextDescriptor(contextDescriptor);

    contextDescriptor.node.members.forEach((classElement) => {
        if (isMethodBean(classElement)) {
            registerMethodBean(contextDescriptor, classElement);
        }
        if (isClassPropertyBean(classElement)) {
            registerPropertyBean(contextDescriptor, classElement);
        }
        if (isArrowFunctionBean(classElement)) {
            registerArrowFunctionBean(contextDescriptor, classElement);
        }
        if (isExpressionBean(classElement)) {
            registerExpressionBean(contextDescriptor, classElement);
        }
        if (isEmbeddedBean(classElement)) {
            registerEmbeddedBean(contextDescriptor, classElement);
        }
    });
}
