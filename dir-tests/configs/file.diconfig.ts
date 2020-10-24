import { Bean, CatContext } from 'dependency-injection-cat';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';

//Check for uniq
@CatContext('ds')
export class FileDiconfig {
    @Bean({ qualifier: 'consoleLogger' })
    logger(): ILogger {
        return new Logger();
    }

    logger2(): ILogger {
        return new SentryLogger();
    }
}

//Добавить воможность указывать вместо квалифаера имя функции
context.getBean<ILogger>('logger2');


//Initialization of context
const context: IContext<IOptions> = container.initContext<IOptions, IBeans>(contextName, options: IOptions);
const context = container.get<IBeans>(contextName);
const logger = context.getBean<T extends keyof IBeans>('qualifier': T ): IBeans[T];
Get all beans
context.getBeans();
