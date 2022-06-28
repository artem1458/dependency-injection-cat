import { IDIConfig } from './IDIConfig';
import { cosmiconfigSync } from 'cosmiconfig';
import TypeScriptLoader from 'cosmiconfig-typescript-loader';
import { Validator } from 'jsonschema';
import schema from './schema.json';

export class ConfigLoader {
    private static moduleName = 'dicat';
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

        const moduleName = this.moduleName;

        const loader = cosmiconfigSync(this.moduleName, {
            searchPlaces: [
                'package.json',
                `.${moduleName}rc`,
                `.${moduleName}rc.json`,
                `.${moduleName}rc.yaml`,
                `.${moduleName}rc.yml`,
                `.${moduleName}rc.js`,
                `.${moduleName}rc.ts`,
                `.${moduleName}rc.cjs`,
                `${moduleName}.config.js`,
                `${moduleName}.config.ts`,
                `${moduleName}.config.cjs`,
            ],
            loaders: {
                '.ts': TypeScriptLoader(),
            }
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
