import { container } from 'ts-pring';
import { ILogger } from './ILogger';

const logger = container.get<ILogger>();
const logger2 = container.get<ILogger>();

console.log(logger === logger2, 'Logger 1 is equal to 2');
