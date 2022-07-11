import { IProgramOptions } from './IProgramOptions';
import { program } from 'commander';

export class ProgramOptionsProvider {
    private static defaultOptions: IProgramOptions = {
        cwd: process.cwd(),
    };

    private static customOptions: Partial<IProgramOptions> = {};

    static get options(): IProgramOptions {
        return {
            ...this.defaultOptions,
            ...this.customOptions,
        };
    }

    private static setOptions(options: Partial<IProgramOptions>): void {
        this.customOptions = {
            ...this.customOptions,
            ...options,
        };
    }

    static init(): void {
        program
            .option('--cwd <absolute_dir_path>', 'current working directory, default: node.process.cwd()');

        program.parse();

        const options: Partial<IProgramOptions> = program.opts();

        this.setOptions(options);
    }
}
