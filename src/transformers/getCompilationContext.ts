import { CompilationContext } from '../compilation-context/CompilationContext';

const context = new CompilationContext();

export function getCompilationContext(): CompilationContext {
    return context;
}
