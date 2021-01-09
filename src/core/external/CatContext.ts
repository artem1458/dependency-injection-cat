import { UsingCatContextWithoutConfiguredDI } from '../exceptions/runtime/UsingCatContextWithoutConfiguredDI';

export class CatContext<TConfig = null> {
    constructor() {
        throw new UsingCatContextWithoutConfiguredDI();
    }

    get config(): TConfig {
        throw new UsingCatContextWithoutConfiguredDI();
    }
}

class XZ extends CatContext {

}
