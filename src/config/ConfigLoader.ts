import { IDIConfig } from './IDIConfig';
import { cosmiconfigSync } from 'cosmiconfig';
import { Validator } from 'jsonschema';
import schema from './schema.json';

export class ConfigLoader {
    private static defaultConfig: IDIConfig = {
        pattern: '**/*.di.ts',
        ignorePatterns: ['**/node_modules/**'],
        printLogo: true,
    };
    private static cachedConfig: IDIConfig | null = null;

    static load(): IDIConfig {
        if (this.cachedConfig !== null) {
            return this.cachedConfig;
        }

        const configFileName = 'dicat';

        const loader = cosmiconfigSync(configFileName, {
            searchPlaces: [
                `.${configFileName}rc`,
                `.${configFileName}.json`,
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

        const validator = new Validator();

        validator.validate(config, schema, {
            throwError: true,
        });

        this.cachedConfig = {
            ...this.defaultConfig,
            ...config,
        };

        return this.cachedConfig;
    }

    static clear(): void {
        this.cachedConfig = null;
    }
}
