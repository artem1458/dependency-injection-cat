import { UsingCatContextWithoutConfiguredDI } from '../exceptions/runtime/UsingCatContextWithoutConfiguredDI';

export abstract class CatContext<TConfig = null> {
    protected constructor() {
        throw new UsingCatContextWithoutConfiguredDI();
    }

    get config(): TConfig {
        throw new UsingCatContextWithoutConfiguredDI();
    }
}
