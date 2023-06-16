import { CompilationContext } from '../compilation-context/CompilationContext';

let context: CompilationContext | null = null;

export function initCompilationContext(): CompilationContext {
    if (context === null) {
        context = new CompilationContext();
    }

    return context;
}

export function getCompilationContext(): CompilationContext {
    if (context === null) {
        throw new Error('Compilation context is not initialized');
    }

    return context;
}
