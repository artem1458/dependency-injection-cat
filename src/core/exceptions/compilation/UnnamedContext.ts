export class UnnamedContext extends Error {
    constructor(
        private file: string,
    ) {
        super();
    }

    name = 'UnnamedContextException';
    message = `Contest should be a named class declaration
    filePath ${this.file}        
    `
}
