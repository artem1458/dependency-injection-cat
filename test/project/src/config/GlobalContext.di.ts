import { Bean, GlobalCatContext } from 'dependency-injection-cat';
import { ILogger } from '../lib/logger/ILogger';
import { Logger } from '../lib/logger/Logger';

class GlobalContext extends GlobalCatContext {
    consoleLogger = Bean<ILogger>(Logger);
}
