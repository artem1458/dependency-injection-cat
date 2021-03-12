import { UsingCatContextWithoutConfiguredDI } from '../exceptions/runtime/UsingCatContextWithoutConfiguredDI';

/**
 * TBeans should be a plain interface without extending
 */
export abstract class CatContext<TBeans, TConfig = null> {
    protected constructor() {
        throw new UsingCatContextWithoutConfiguredDI();
    }

    get config(): TConfig {
        throw new UsingCatContextWithoutConfiguredDI();
    }
}
