export class CompilationError extends Error {
    constructor(
        public message: string,
    ) {
        super();
        this.stack = undefined;
        this.name = 'CompilationContextError';
    }
}
