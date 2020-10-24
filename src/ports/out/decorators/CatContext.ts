export class CatContext<IConfig> {
    constructor(contextName?: string) {
        throw new Error('You can not extends CatContext not in di-config file.');
    }
}
