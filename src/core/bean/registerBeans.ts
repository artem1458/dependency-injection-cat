import { IContextDescriptor } from '../context/ContextRepository';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';
import { registerMethodBean } from './registerMethodBean';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { registerPropertyBean } from './registerPropertyBean';
import { BeanRepository } from './BeanRepository';
import { isArrowFunctionBean } from '../ts-helpers/predicates/isArrowFunctionBean';
import { registerArrowFunctionBean } from './registerArrowFunctionBean';

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
    });
}
