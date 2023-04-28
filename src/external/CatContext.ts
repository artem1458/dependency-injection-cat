import { UsingCatContextWithoutConfiguredDI } from '../exceptions/runtime/UsingCatContextWithoutConfiguredDI';

/**
 * T should be a plain interface without extending
 */
export abstract class CatContext<T, C = null> {
    constructor() {
        throw new UsingCatContextWithoutConfiguredDI();
    }

    get config(): C {
        throw new UsingCatContextWithoutConfiguredDI();
    }

    private getBeans(): T {
        throw new UsingCatContextWithoutConfiguredDI();
    }
}
