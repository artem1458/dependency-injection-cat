import { IContextDescriptor } from '../context/ContextRepository';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';
import { registerMethodBean } from './registerMethodBean';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { registerPropertyBean } from './registerPropertyBean';
import { BeanRepository } from './BeanRepository';

export function registerBeans(contextDescriptor: IContextDescriptor) {
    BeanRepository.clearBeanInfoByContextDescriptor(contextDescriptor);

    contextDescriptor.node.members.forEach((classElement) => {
        if (isMethodBean(classElement)) {
            registerMethodBean(contextDescriptor, classElement);
        }
        if (isClassPropertyBean(classElement)) {
            registerPropertyBean(contextDescriptor, classElement);
        }
    });
}
