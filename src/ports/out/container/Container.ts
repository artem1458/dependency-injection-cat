import { IContext } from '../context/IContext';

export class Container {
    static initContext<
        TUseCases extends Record<keyof TUseCases, unknown>,
        TOptions extends Record<keyof TOptions, unknown>,
    >(contextName: string, options?: TOptions): IContext<TUseCases> {
        throw new Error('Trying to use container.initContext without configured di-container');
    }

    static getContext<TUseCases extends Record<keyof TUseCases, unknown>>(contextName: string): IContext<TUseCases> {
        throw new Error('Trying to use container.getContext without configured di-container');
    }
}
