import { Bean, GlobalCatContext } from 'dependency-injection-cat';
import { ILogger } from '../lib/logger/ILogger';
import { Logger } from '../lib/logger/Logger';

export class ApplicationContext2 extends GlobalCatContext {
    consoleLogger = Bean<ILogger>(Logger);
}
