import { IContext } from './IContext';
import { DIContainerNotInitialized } from '../exceptions/runtime/DIContainerNotInitialized';

interface IInitContextProps {
    name: string;
    key?: any;
}

interface IInitContextPropsWithConfig<TConfig> extends IInitContextProps {
    config: TConfig;
}

type TBeanName = string

class Container {
    /**
     * TBeans should be a plain interface without extending
     */
    initContext<TBeans extends Record<TBeanName, any>>(
        props: IInitContextProps
    ): IContext<TBeans>
    initContext<TBeans extends Record<TBeanName, any>, TConfig>(
        props: IInitContextPropsWithConfig<TConfig>
    ): IContext<TBeans>
    initContext<TBeans extends Record<TBeanName, any>>(): IContext<TBeans> {
        Container.throwInitializationError();
    }

    /**
     * TBeans should be a plain interface without extending
     */
    getContext<TBeans extends Record<TBeanName, any>>(
        props: IInitContextProps
    ): IContext<TBeans> {
        Container.throwInitializationError();
    }

    clearContext(props: IInitContextProps): void {
        Container.throwInitializationError();
    }

    private static throwInitializationError(): never {
        throw new DIContainerNotInitialized();
    }
}

export const container = new Container();
