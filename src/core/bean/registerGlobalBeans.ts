import { IContextDescriptor } from '../context/ContextRepository';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { registerPropertyBean } from './registerPropertyBean';
import { registerMethodBean } from './registerMethodBean';
import { BeanRepository } from './BeanRepository';
import { isArrowFunctionBean } from '../ts-helpers/predicates/isArrowFunctionBean';
import { registerArrowFunctionBean } from './registerArrowFunctionBean';
import { isPlainPropertyBean } from '../ts-helpers/predicates/isPlainPropertyBean';
import { registerPlainPropertyBean } from './registerPlainPropertyBean';

export const registerGlobalBeans = (contextDescriptor: IContextDescriptor) => {
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
        if (isPlainPropertyBean(classElement)) {
            registerPlainPropertyBean(contextDescriptor, classElement);
        }
    });
};
