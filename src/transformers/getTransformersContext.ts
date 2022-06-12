import { TransformationContext } from '../build-context/TransformationContext';
import { CompilationContext } from '../build-context/CompilationContext';

export type TContexts = [compilationContext: CompilationContext, transofrmationContext: TransformationContext];

const contexts: TContexts = [
    new CompilationContext(),
    new TransformationContext(),
];

export function getTransformersContext(): TContexts {
    return contexts;
}
