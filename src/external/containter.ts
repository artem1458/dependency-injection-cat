import { IDIContext } from './IDIContext';
import { DIContainerNotInitialized } from '../exceptions/runtime/DIContainerNotInitialized';
import { TestConfiguration } from '../test/testConfiguration';

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
    initContext<TBeans>(
        props: IInitContextProps
    ): IDIContext<TBeans>
    initContext<TBeans, TConfig>(
        props: IInitContextPropsWithConfig<TConfig>
    ): IDIContext<TBeans>
    initContext<TBeans>(): IDIContext<TBeans> {
        if (TestConfiguration.failOnNotConfiguredContainer) {
            Container.throwInitializationError();
        }

        return {} as IDIContext<TBeans>;
    }

    /**
     * TBeans should be a plain interface without extending
     */
    getContext<TBeans extends Record<TBeanName, any>>(
        props: IInitContextProps
    ): IDIContext<TBeans> {
        if (TestConfiguration.failOnNotConfiguredContainer) {
            Container.throwInitializationError();
        }

        return {} as IDIContext<TBeans>;
    }

    clearContext(props: IInitContextProps): void {
        if (TestConfiguration.failOnNotConfiguredContainer) {
            Container.throwInitializationError();
        }
    }

    private static throwInitializationError(): never {
        throw new DIContainerNotInitialized();
    }
}

export const container = new Container();
