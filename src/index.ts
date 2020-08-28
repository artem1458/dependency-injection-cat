import { libraryName } from './constants/libraryName';

export * from './decorators';

export class container {
    static get<T>(beanName?: string): T {
        //TODO add link to configure guide
        throw new Error(`It seems, like ${libraryName} was not configured correctly`);
    }
}
