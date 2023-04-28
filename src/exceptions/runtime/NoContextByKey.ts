export class NoContextByKey extends Error {
    constructor(
        //TODO remove context name
        private contextName: string,
        private contextKey: string,
    ) {
        super();

        this.name = 'NotFoundException';
        this.message = `Context with name ${this.contextName} and key ${this.contextKey} was not initialized`;
    }
}
