import { CompilerOptions } from 'typescript';

export class CompilerOptionsProvider {
    private static _options: CompilerOptions;

    static get options(): CompilerOptions {
        if (this._options === undefined) {
            throw new Error('Trying to access CompilerOptionsProvider before it was initialized');
        }

        return this._options;
    }

    static set options(options: CompilerOptions) {
        if (this._options === undefined) {
            this._options = options;
        }
    }
}
