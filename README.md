![npm](https://img.shields.io/npm/v/dependency-injection-cat?style=flat)
# dependency-injection-cat

Dependency Injection Cat is a TypeScript-only library which allows you to implement
the Dependency Inversion pattern with Dependency Injection
<!-- toc -->
- [Installation](#installation)
    * [Config options](#config-options)
    * [Configuration with Webpack](#configuration-with-webpack)
    * [Configuration with ttypescript](#configuration-with-ttypescript)
- [Usage](#usage)
- [Bean](#bean)
    * [Rules](#bean-rules)
    * [Syntax](#bean-syntax)
    * [Configuration object](#bean-configuration-object)
- [Qualifier](#qualifier)
    * [What is it?](#what-is-it)
    * [Rules](#qualifier-rules)
    * [Syntax](#qualifier-syntax)
- [Container](#container)
    * [Rules](#container-rules)
    * [Syntax](#container-syntax)
<!-- tocstop -->

## Installation
**Yarn**
```bash
yarn add dependency-injection-cat
```
**NPM**
```bash
npm install dependency-injection-cat
```

#### Config options
```ts
interface TransformerConfig {
    diConfigPattern?: string; // Glob pattern, default value = '**/*.diconfig.ts'
    ignorePatterns?: string[]; // Array of Glob patterns, default value = ['**/node_modules/**']
}
```

#### Configuration with Webpack
Dependency Injection Cat supports transpileOnly mode for faster builds! [More Info](https://github.com/TypeStrong/ts-loader#transpileonly)
<br/>
With Webpack, You can use any TypeScript-related loader that supports custom transformers, e.g. awesome-typescript-loader or ts-loader

<h5>webpack.config.js</h5>

```js
const dependencyInjectionCatTransformer = require('dependency-injection-cat/transformer').default;
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader', // or 'awesome-typescript-loader'
        options: {
          transpileOnly: true, // If set transpileOnly: true, you're loosing TypeChecking
          
          //If you're using ttypescript
          compiler: 'ttypescript',
          //If you don't use ttypescript, you should pass transformer
          getCustomTransformers: program => ({
              before: [
                  dependencyInjectionCatTransformer(program),
              ],
          }),
        },
      },
    ],
  },
};
```

<h5>With custom options</h5>
In webpack.config.js you can pass a second parameter to the transformer:

```js
before: [
  dependencyInjectionCatTransformer(program, {
    diConfigPattern: '**/config/**/*.diconfig.ts'
  })
]
```

#### Configuration with ttypescript
Check out ttypescript's [README](https://github.com/cevek/ttypescript/blob/master/README.md) for more information

<h5>tsconfig.json</h5>

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "dependency-injection-cat/transformer"
      }
    ]
  }
}
```

<h5>With custom options</h5>

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "dependency-injection-cat/transformer",
        "diConfigPattern": "**/config/**/*.diconfig.ts"
      }
    ]
  }
}
```

## Usage

```ts
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

requester.makeRequest();
```

## Bean

<h4 id="bean-rules">Rules</h4>

<!-- toc -->
- Bean should be a class member (property or method)
- Beans should not have cyclic dependencies (it will throw compilation error)
- Beans should not have duplicate declarations
- Beans can be used only in **diconfig.ts** files (or files with another pattern declared in transformer config)
- Bean type should not be empty (it will throw compilation error)
- Bean type should not be primitive (it will throw compilation error)
- All bean dependencies should be typed, and type should not be primitive
<!-- tocstop -->

<h4 id="bean-syntax">Syntax</h4>
Beans support 2 kinds of syntax

<h5>First</h5>

```ts
import { Bean } from 'dependency-injection-cat';

class SuperClass {
    //Without any dependencies
    @Bean
    someMethod(): Interface {
       return new ImplementationOfInterface();
    }

    //With Bean dependencies
    @Bean
    someMethod(
        dependency1: InterfaceOfDependency1,
        dependency2: InterfaceOfDependency2,
    ): Interface {
       return new ImplementationOfInterface(dependency1, dependency2);
    }

    //With Bean configuration
    @Bean({ qualifier: 'someCoolImpl', scope: 'prototype' })
    someMethod(
        dependency1: InterfaceOfDependency1,
        dependency2: InterfaceOfDependency2,
    ): Interface {
       return new ImplementationOfInterface(dependency1, dependency2);
    }

    //Beans do not support arrow-functions methods, this will throw an error
    @Bean
    someMethod = (): Interface => new ImplementationOfInterface();

    //Beans should have complex types, this will throw an error
    @Bean
    someMethod(): number | string | any {
        return new ImplementationOfInterface();
    }

    //Should not have cyclyc dependencies, this will throw an error
    @Bean
    someMethod(
        dependency1: InterfaceOfDependency1, //Cyclic dependency
    ): Interface {
        return new ImplementationOfInterface(dependency1);
    }

    @Bean
    someMethod2(
        dependency1: Interface, //Cyclic dependency
    ): InterfaceOfDependency1 {
        return new ImplementationOfDependency(dependency1);
    }
}
```

<h5>Second</h5>

```ts
import { Bean } from 'dependency-injection-cat';

class SuperClass {
    //If you don't need to pass specific dependencies in Bean, it will resolve all dependencies automatically 
    someBeanProperty = Bean<Interface>(ImplementationOfInterface);

    //With Bean configuration
    //First argument in Bean should always be implementation of interface, second is configuration object
    //When using this syntax, implementation should be a class 
    //You should pass Bean type in generic
    someBeanProperty = Bean<Interface>(ImplementationOfInterface, { qualifier: 'someCoolImpl' });
}
```

<h4 id="bean-configuration-object">Bean configuration object</h4>

```ts
interface BeanConfiguration {
    //By default all beans are singleton, if you will set scope 'prototype' Bean will no longer be a singleton
    scope?: 'prototype' | 'singleton';
    //Read about Qualifiers and their rules below
    qualifier?: string;
}
```

## Qualifier
<h4 id="what-is-it">What is it?</h4>

In fact, Qualifier it's just a name of Bean
You can use it, if you have a few different implementations of interface 

<h4 id="qualifier-rules">Rules</h4>

<!-- toc -->
- Qualifier should be a string
- Qualifier should not be empty string
- Qualifier should not be dynamically calculated (no template strings, or references to constants/object properties)
<!-- tocstop -->

<h4 id="qualifier-syntax">Syntax</h4>

```ts
import { Bean, Qualifier } from 'dependency-injection-cat';

class SuperClass {
    //Correct example
    @Bean
    someMethod(
        @Qualifier('someQualifier') dependency1: InterfaceOfDependency1,
    ): Interface {
       return new ImplementationOfInterface();
    }
}
```
```ts
//Wrong examples
import { Bean, Qualifier } from 'dependency-injection-cat';

const superQualifierName = 'superQualifierNameValue';

class SuperClass {
    @Bean
    someMethod(
        @Qualifier(superQualifierName) dependency1: InterfaceOfDependency1,
    ): Interface {
       return new ImplementationOfInterface();
    }
    @Bean
    someMethod(
        @Qualifier('') dependency1: InterfaceOfDependency1,
    ): Interface {
       return new ImplementationOfInterface();
    }
}
```

### Container
Container has only one method "get"

<h4 id="container-rules">Rules</h4>

<!-- toc -->
- You should pass type as generic in get method of Container
<!-- tocstop -->

<h4 id="container-syntax">Syntax</h4>

```ts
//Any TypeScript file in project
import { container } from 'dependency-injection-cat';

//Without Qualifier
const someBean = container.get<Interface>();

//With Qualifier
const someBean = container.get<Interface>('someQualifier');
```

## Author
* [**Artem Kornev**](https://github.com/artem1458)

## License
This project is under the MIT License
