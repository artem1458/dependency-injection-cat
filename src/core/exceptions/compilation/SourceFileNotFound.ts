export class SourceFileNotFound extends Error {
    constructor(
        private file: string
    ) {
        super();
    }

    name = 'NotFoundException';

    message = `Source file not found, path: ${this.file}`;
}
