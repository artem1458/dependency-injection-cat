import { ContextRepository } from '../context/ContextRepository';
import { isMethodBean } from '../ts-helpers/predicates/isMethodBean';
import { isClassPropertyBean } from '../ts-helpers/predicates/isClassPropertyBean';
import { registerPropertyBean } from './registerPropertyBean';
import { registerMethodBean } from './registerMethodBean';

export const registerGlobalBeans = () => {
    ContextRepository.globalContexts.forEach((contextDescriptor) => {
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
