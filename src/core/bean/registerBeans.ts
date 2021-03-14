import { ContextRepository } from '../context/ContextRepository';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { registerPropertyBean } from './registerPropertyBean';
import { registerMethodBean } from './registerMethodBean';

export const registerBeans = () => {
    ContextRepository.contextMap.forEach((contextDescriptor, contextName) => {
        contextDescriptor.node.members.forEach((classElement) => {
            if (isMethodBean(classElement)) {
                registerMethodBean(contextDescriptor, classElement);
            }
            if (isClassPropertyBean(classElement)) {
                registerPropertyBean(contextDescriptor, classElement);
            }
        });
    });
    ContextRepository.globalContexts.forEach((contextDescriptor, contextId) => {
        contextDescriptor.node.members.forEach((classElement) => {
            if (isMethodBean(classElement)) {
                registerMethodBean(contextDescriptor, classElement);
            }
            if (isClassPropertyBean(classElement)) {
                registerPropertyBean(contextDescriptor, classElement);
            }
        });
    });
};
