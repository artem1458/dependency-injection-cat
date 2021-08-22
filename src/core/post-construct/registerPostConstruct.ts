import { IContextDescriptor } from '../context/ContextRepository';
import { isPostConstructMethod } from '../ts-helpers/predicates/isPostConstructMethod';
import { registerPostConstructMethod } from './registerPostConstructMethod';

export const registerPostConstruct = (contextDescriptor: IContextDescriptor): void => {
    contextDescriptor.node.members.forEach(it => {
        if (isPostConstructMethod(it)) {
            registerPostConstructMethod(contextDescriptor, it);
        }
    });
};
