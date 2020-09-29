# dependency-injection-cat

Dependency Injection Cat is a TypeScript-only library which allows you to implement
the Dependency Inversion pattern with Dependency Injection

## Installation
Yarn
```bash
yarn add dependency-injection-cat
```
NPM
```bash
npm install dependency-injection-cat
```

## Usage
Simple case
```typescript
// requesters.diconfig.ts
import { Bean, Qualifier } from 'dependency-injection-cat';
import { IRequester } from '../IRequester';
import { Requester } from '../Requester';
import { ILogger } from '../ILogger';

export class Requesters {
    @Bean
    requester(logger: ILogger): IRequester {
        return new Requester(logger);
    }
    //or
    requester = Bean<IRequester>(Requester);
}

// loggers.diconfig.ts
import { Bean } from 'dependency-injection-cat';
import { ILogger } from '../ILogger';
import { Logger } from '../Logger';

export class Loggers {
    @Bean
    logger(): ILogger {
        return new Logger();
    }
    //or
    @Bean
    logger = Bean<ILogger>(Logger);
}

// main.ts
import { container } from 'dependency-injection-cat';
import { IRequester } from './IRequester';

const requester = container.get<IRequester>();

requester.makeRequest....
```
## Author
* [**Artem Kornev**](https://github.com/artem1458)

## License
This project is under the MIT License
