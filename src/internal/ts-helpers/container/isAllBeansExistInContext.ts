import { IContainerAccessNode } from './isContainerAccess';
import { getContextNameFromContainerCall } from './getContextNameFromContainerCall';

export const isAllBeansExistInContext = (node: IContainerAccessNode): boolean => {
    const contextName = getContextNameFromContainerCall(node);

    if (contextName === null){
        return false;
    }

    const typeArgs = node.typeArguments ?? null;

    if (typeArgs === null) {
        return true;
    }

    return true;

};
