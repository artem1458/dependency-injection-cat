import ts from 'typescript';
import { CompilationContext } from '../compilation-context/CompilationContext';

let previousProgram: ts.Program | null = null;
let context: CompilationContext | null = null;

export function initCompilationContext(program: ts.Program): CompilationContext {
    if (previousProgram !== program || context === null) {
        context = new CompilationContext(program);
    }

    previousProgram = program;

    return context;
}

export function getCompilationContext(): CompilationContext {
    if (context === null) {
        throw new Error('Compilation context is not initialized');
    }

    return context;
}
