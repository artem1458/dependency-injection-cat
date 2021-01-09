export class AccessToBeanDependenciesBeforeBeansInitialization extends Error {
    constructor(
        private beanName: string,
        private originalTypeName: string,
    ) {
        super();
    }

    name = 'InitializationException';
    message = `Trying to access to Bean dependencies before beans initialization is finished
    beanName ${this.beanName}
    beanType ${this.originalTypeName}
    `
}
