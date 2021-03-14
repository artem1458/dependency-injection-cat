import { UsingCatContextWithoutConfiguredDI } from '../exceptions/runtime/UsingCatContextWithoutConfiguredDI';

export abstract class GlobalCatContext {
    protected constructor() {
        throw new UsingCatContextWithoutConfiguredDI();
    }
}
