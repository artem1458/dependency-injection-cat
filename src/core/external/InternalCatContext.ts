import { NotInitializedConfig } from '../exceptions/runtime/NotInitializedConfig';

export abstract class InternalCatContext {
    private _config: any = 'UNINITIALIZED_CONFIG';

    get config(): any {
        if (this._config === 'UNINITIALIZED_CONFIG') {
            throw new NotInitializedConfig();
        }

        return this._config;
    }

    set config(config: any) {
        this._config = config;
    }
}
