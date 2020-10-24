export interface IContext<TUseCases extends Record<keyof TUseCases, unknown>> {
    getBeans(): TUseCases;
    getBean<T extends keyof TUseCases>(beanName: T): Pick<TUseCases, T>;
}
