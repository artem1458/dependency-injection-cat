import { contextKeyToString } from './contextKeyToString';

export class NoContextByKey extends Error {
    constructor(
        private contextName: string,
        private contextKey: string,
    ) {
        super();

        this.name = 'NoContextByKey';
        this.message = `Context "${this.contextName}" and key ${contextKeyToString(contextKey)} was not initialized`;
    }
}
