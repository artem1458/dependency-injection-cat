import findUp from 'find-up';

export class TsConfigProvider {
    private static configPath: string | null = null;

    static get tsConfigPath(): string {
        if (this.configPath === null) {
            throw new Error('Can\'t find tsConfig file');
        }

        return this.configPath;
    }

    static init() {
        this.configPath = findUp.sync('tsconfig.json') ?? null;
    }
}
