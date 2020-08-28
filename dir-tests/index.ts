import { container } from 'ts-pring';
import { IRequester } from './IRequester';
import { ILogger } from './ILogger';

const logger = container.get<ILogger>('Loggger');
const logger2 = container.get<ILogger>('Loggger');

console.log(logger === logger2, 'Logger 1 is equal to 2');
