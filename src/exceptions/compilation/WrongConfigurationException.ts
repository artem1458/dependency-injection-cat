export class WrongConfigurationException extends Error {
    constructor(
        public message: string,
    ) {
        super();
        this.name = 'WrongConfigurationException';
    }
}
