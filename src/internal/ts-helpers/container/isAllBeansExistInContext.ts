import { IContainerAccessNode } from './isContainerAccess';
import { getContextNameFromContainerCall } from './getContextNameFromContainerCall';

export const isAllBeansExistInContext = (node: IContainerAccessNode): boolean => {
    const contextName = getContextNameFromContainerCall(node);

    if (contextName === null){
        return false;
    }

    return true;

};
