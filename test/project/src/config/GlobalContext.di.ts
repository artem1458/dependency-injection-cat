import { Bean, GlobalCatContext } from 'dependency-injection-cat';
import { ILogger } from '../lib/logger/ILogger';
import { Logger } from '../lib/logger/Logger';

export class GlobalContext extends GlobalCatContext {
    consoleLogger = Bean<ILogger>(Logger);
}
