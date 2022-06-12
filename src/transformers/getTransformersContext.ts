import { TransformationContext } from '../compilation-context/TransformationContext';
import { CompilationContext } from '../compilation-context/CompilationContext';

export type TContexts = [compilationContext: CompilationContext, transofrmationContext: TransformationContext];

const contexts: TContexts = [
    new CompilationContext(),
    new TransformationContext(),
];

export function getTransformersContext(): TContexts {
    return contexts;
}
