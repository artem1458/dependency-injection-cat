export class NoContextByKey extends Error {
    constructor(
        private contextName: string,
        private contextKey: string,
    ) {
        super();
    }

    name = 'NotFoundException';
    message = `Context with name ${this.contextName} and key ${this.contextKey} was not initialized`;
}
