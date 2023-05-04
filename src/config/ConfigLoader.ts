import { IDIConfig } from './IDIConfig';
import { cosmiconfigSync } from 'cosmiconfig';
import { Validator } from 'jsonschema';
import schema from './schema.json';
import upath from 'upath';
import { ProgramOptionsProvider } from '../program-options/ProgramOptionsProvider';

export class ConfigLoader {
    private static defaultConfig: IDIConfig = {};
    private static cachedConfig: IDIConfig | null = null;
    private static fileNamesToFind = [
        '.dicatrc',
        '.dicatrc.json',
    ];

    static load(): IDIConfig {
        if (this.cachedConfig !== null) {
            return this.cachedConfig;
        }

        const configFileName = 'dicat';

        const loader = cosmiconfigSync(configFileName, {
            searchPlaces: [
                ...this.fileNamesToFind,
                //TODO Maybe needs to handle js/ts configs. For now only json based configs
                // `.${configFileName}rc.js`,
                // `.${configFileName}rc.ts`,
            ],
        });

        const loaderResult = loader.search();
        const config: Partial<IDIConfig | null> = loaderResult?.config ?? null;

        if (config === null) {
            this.cachedConfig = this.defaultConfig;

            return this.cachedConfig;
        }


        this.setConfig(config);

        return this.cachedConfig!;
    }

    static setConfig(config: Partial<IDIConfig>): void {
        const validator = new Validator();

        validator.validate(config, schema, {
            throwError: true,
        });

        this.cachedConfig = {
            ...this.defaultConfig,
            ...config,
        };
    }

    static parseAndSetConfig(content: string): void {
        this.setConfig(JSON.parse(content));
    }

    static isConfigFile(path: string): boolean {
        return this.fileNamesToFind
            .map(fileName => upath.join(ProgramOptionsProvider.options.cwd, fileName))
            .some(it => it === upath.normalize(path));
    }

    static clear(): void {
        this.cachedConfig = null;
    }
}
