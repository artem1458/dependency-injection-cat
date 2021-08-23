import ts from 'typescript';
import { compact } from 'lodash';
import { getNodeSourceDescriptorDeep } from '../ts-helpers/node-source-descriptor';
import { libraryName } from '../../constants/libraryName';
import { TLifecycle } from '../../external/InternalCatContext';

export const CONTEXT_LIFECYCLE_DECORATORS = [
    'PostConstruct',
    'BeforeDestruct',
];

const LIFECYCLE_DECORATOR_TO_LIFECYCLE_TYPE: Record<string, TLifecycle | undefined> = {
    [CONTEXT_LIFECYCLE_DECORATORS[0]]: 'post-construct',
    [CONTEXT_LIFECYCLE_DECORATORS[1]]: 'before-destruct',
};

export const getLifecycleTypes = (decorators: ts.Decorator[]): Set<TLifecycle> | null => {
    const lifecycleDecorators = decorators.filter(isContextLifecycleDecorator);

    if (lifecycleDecorators.length === 0) {
        return null;
    }

    const lifecycles = compact(lifecycleDecorators.map(decorator => {
        let nameToFind: string | undefined = undefined;

        const expression = decorator.expression;

        if (ts.isIdentifier(expression) || ts.isPropertyAccessExpression(expression)) {
            nameToFind = expression.getText();
        }

        if (nameToFind === undefined) {
            return null;
        }

        const nodeSourceDescriptor = getNodeSourceDescriptorDeep(decorator.getSourceFile(), nameToFind);

        if (nodeSourceDescriptor === null) {
            return null;
        }

        if (nodeSourceDescriptor.path !== libraryName) {
            return null;
        }

        return LIFECYCLE_DECORATOR_TO_LIFECYCLE_TYPE[nodeSourceDescriptor.name];
    }));

    return lifecycles.length === 0 ? null : new Set(lifecycles);
};

export const isContextLifecycleDecorator = (decorator: ts.Decorator): boolean => {
    let nameToFind: string | undefined = undefined;

    const expression = decorator.expression;

    if (ts.isIdentifier(expression) || ts.isPropertyAccessExpression(expression)) {
        nameToFind = expression.getText();
    }

    if (nameToFind === undefined) {
        return false;
    }

    const nodeSourceDescriptor = getNodeSourceDescriptorDeep(decorator.getSourceFile(), nameToFind);

    if (nodeSourceDescriptor === null) {
        return false;
    }

    return CONTEXT_LIFECYCLE_DECORATORS.includes(nodeSourceDescriptor.name) && nodeSourceDescriptor.path === libraryName;
};
