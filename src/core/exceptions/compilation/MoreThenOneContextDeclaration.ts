export class MoreThenOneContextDeclaration extends Error {
    constructor(
        private contextName: string,
        private filePath: string,
    ) {
        super();
    }

    name = 'ContextException';
    message = `Trying to register more then 1 context with name:
    contextName: ${this.contextName}
    filePath: ${this.filePath}
    `;
}
