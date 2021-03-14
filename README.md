# Dependency Injection Cat

DI Cat is a truly clean DI-container, which allows you not to pollute your business logic with decorators from DI/IOC libraries!

-----

![npm](https://img.shields.io/npm/v/dependency-injection-cat?style=flat)

-----

## Example

```tsx
//ApplicationContext.di.ts
export class ApplicationContext extends CatContext<IBeans> {
  useCase = Bean<IUseCase>(UseCase)
  mobxRepository = Bean<IRepository>(MobxRepository)
}

//UseCase.ts
export class UseCase implements IUseCase {
  constructor(
          private repository: IRepository,
  ) {}

  makeBusinessLogic() {...}
}

//Your application.tsx
export const UIComponent: React.FC = () => {
  const appContext = container.getContext<IBeans>({ name: 'ApplicationContext' });
  const { useCase } = appContext.getBeans();

  return (
          <button onClick={useCase.makeBusinessLogic}> Click me! </button>
  )
}
```

## Installation

#### Yarn

```bash
yarn add dependency-injection-cat
```

#### NPM

```bash
npm install dependency-injection-cat
```

#### Requirements for TSconfig

```json
{
  "compilerOptions": {
    "baseUrl": "Base url should be specified!"
  }
}
```



#### Webpack + Babel

```typescript
//webpack.config.js
const ReportDiErrorsPlugin = require('dependency-injection-cat/plugins/webpack/ReportDiErrors').default;

module.exports = {
  ...
          module: {
  rules: [
    {
      test: /\.(t|j)sx?$/,
      loader: 'babel-loader',
      options: {
        plugins: [
          [
            require('dependency-injection-cat/transformers/babel'),
            {
              //Here is configuration options, see below
            }
          ]
        ]
      }
    }
  ]
},
plugins: [
  //Without this plugin, a compilation with DI errors will be successful
  new ReportDiErrorsPlugin(),
]
}

//tsconfig.json
{
  "compilerOptions": {
  //Should be specified
  "baseUrl": "your base url"
}
}
```


#### Webpack + TS-Loader

```typescript
//webpack.config.js
const ReportDiErrorsPlugin = require('dependency-injection-cat/plugins/webpack/ReportDiErrors').default;
const diCatTransformer = require('dependency-injection-cat/transformers/typescript').default;

module.exports = {
  ...
          module: {
  rules: [
    {
      test: /\.(t|j)sx?$/,
      use: {
        loader: 'ts-loader',
        options: {
          getCustomTransformers: (program) => ({
            before: [diCatTransformer(program, {
              //Here is configuration options, see below
            })],
          }),
        }
      }
    }
  ]
},
plugins: [
  //Without this plugin, a compilation with DI errors will be successful
  new ReportDiErrorsPlugin(),
]
}

//tsconfig.json
{
  "compilerOptions": {
  //Should be specified
  "baseUrl": "your base url"
}
}
```


#### Webpack + TS-Loader + ttypescript

```typescript
//webpack.config.js
const ReportDiErrorsPlugin = require('dependency-injection-cat/plugins/webpack/ReportDiErrors').default;

module.exports = {
  ...
          module: {
  rules: [
    {
      test: /\.(t|j)sx?$/,
      use: {
        loader: 'ts-loader',
        options: {
          compiler: 'ttypescript'
        }
      }
    }
  ]
},
plugins: [
  //Without this plugin, a compilation with DI errors will be successful
  new ReportDiErrorsPlugin(),
]
}

//tsconfig.json
{
  "compilerOptions": {
  //Should be specified
  "baseUrl": "your base url",
          "plugins": [
    {
      "transform": "dependency-injection-cat/transformers/typescript",
      //Here is configuration options, see below
    }
  ]
}
}
```



## Configuration options

```typescript
{
  diConfigPattern ?: string; // Glob pattern, default value. Default: '**/*.di.ts'
  ignorePatterns ?: string[]; // Array of Glob patterns, default value. Default: ['**/node_modules/**']
  compiledContextOutputDir ?: string; // Output directory of transformed contextMap, can be specified for debug purposes. Default: node_modules/dependency-injection-cat/external/built-context
}
```



## CatContext

CatContext it's a place, where you should define your **Beans**

```typescript
class CatContext<TBeans, TConfig = null>
```

##### Rules

- Name of context should be unique

- Name of context "Global" is preserved for DI container, see **GlobalCatContext**

### TBeans

TBeans is an interface, of Beans that will be given out of context. Should be the same as in **container** access calls.

##### Rules

- Should be a plain interface without extending, should not have indexed signatures

- Should be placed in your source files, not from node_modules

- **Bean** name should not be **getBean** or **getBeans**, it's reserved names for di-container

  ```typescript
  export interface IBeans {
      useCase: IUseCase;
      //Another beans...
  } 
  ```

### TConfig

If you need to pass additional parameters to your classes, for example ID, or something else, you should specify a type for TConfig (default is null)

```typescript
export interface IConfig {
    id: string;
}

class ApplicationContext extends CatContext<IBeans, IConfig> {
    @Bean
    useCase(): IUseCase {
        const { id } = this.config;
        
        return new UseCase(id);
    }
}
```

## GlobalCatContext

Sometimes you want to describe common dependencies that will be used all across your application, for these purposes you should use GlobalCatContext.

#### Rules

- You can not get beans from the Global Context using container access

#### Syntax and usage

```typescript
//GlobalApplicationContext.di.ts
export class GlobalApplicationContext extends GlobalCatContext {

    @Bean
    logger(): ILogger {
        return new Logger();
    }
}

//ApplicationContext.di.ts
export class AppContext extends CatContext<IBeans> {

    @Bean
    useCase(
    	//If Bean for ILogger will be defined in current context, bean from current context will be injected
    	logger: ILogger
    ): IUseCase {
        return new UseCase(logger)
    }
}
```



## Container

Using container you can control your contexts. You can't access container inside files where declared contexts.

#### Rules

- Name of context in container access calls, should not be "Global", it's reserved for the **GlobalCatContext**

### TBeans

TBeans is an interface, of Beans that will be given out of context. Should be the same as in **CatContext**.

### initContext

InitContext creates instance of **context** by key (if specified). Also you can pass config to your context using initContext.

```typescript
container.initContext<TBeans, TConfig>({
    key?: any, //Can be any value, you can use it for creating pool of contextMap.
    name: string, //It's the name of the class in which you specified the Beans. Should be a string literal.
    config?: TConfig, //Config that will be transferred to the context
});
```

#### initContext usage

```typescript
//InitContext without config and keys
import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const applicationContext = container.initContext<IBeans>({ name: 'ApplicationContext' });
```

```typescript
//InitContext with config and keys
import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';
import { IConfig } from './IConfig';

const applicationContextBySomeKey = container.initContext<IBeans, IConfig>({
    name: 'ApplicationContext',
	key: 'userId',
    config: { userId: 'userId' },
});
```

### getContext

getContext returns instance of **context** by key (if specified). Can be used only after initialization of context, or error will be thrown.

```typescript
container.getContext<TBeans>({
    key?: any,
    name: string, //It's the name of the class in which you specified the Beans. Should be a string literal.
});
```

#### getContext usage

```typescript
//GetContext without keys
import { container } from 'dependency-injection-cat';

const context = container.getContext<TBeans>({ name: 'ApplicationContext' });
```

```typescript
//GetContext with keys
import { container } from 'dependency-injection-cat';

const context = container.getContext<TBeans>({
	name: 'ApplicationContext',
    key: 'userId',
});
```

### clearContext

clearContext should be used to clear instances of **Beans**. Can be used, for example when un-mounting components.

```typescript
container.clearContext({
    name: string, //It's the name of the class in which you specified the Beans. Should be a string literal.
    key?: any,
})
```

#### clearContext usage

```typescript
//ClearContext without keys
import { container } from 'dependency-injection-cat';

container.clearContext({ name: 'ApplicationContext' });
```

```typescript
//ClearContext without keys
import { container } from 'dependency-injection-cat';

container.clearContext({
	name: 'ApplicationContext',
	key: 'userId',
});
```

## Bean

A Bean is an object that is instantiated, assembled, and managed by IOC container (**Definition from Spring Framework documentation**)
Beans can have dependencies, and they also should be defined as a beans or passed manually.

### Bean configuration

```typescript
interface IBeanConfiguration {
    scope?: 'prototype' | 'singleton';
    /* Should be a string literal. Default value is 'singleton'. When singleton, will be created only 1 instance of the Bean, when 'prototype', for each getting of Bean will be created a new instance */
}
```

### Bean features

- Detect cyclic dependencies at compile time
- Detect missing **Beans** at compile time

### Property Bean

Property Beans resolving class dependencies automatically from the constructor of a class that passed to **Bean**.

#### Rules

- Each class constructor parameter should be defined as a **Bean** in the **Context**
- Each class constructor parameter should have a type, type should not be primitive. To pass primitive values to the constructor, check out **Method Beans**

#### Syntax

```typescript
export class ApplicationContext extends CatContext<IBeans> {
    //First argument passed in Bean should be a class, di-container will try to resolve class dependencies
    useCase = Bean(UseCaseClass);
    
    //To specify type of Bean you can use Generic parameter, or set type of property
    useCase = Bean<IUseCase>(UseCase);
    useCase: IUseCase = Bean(UseCase);
    useCase: IUseCase = Bean<IUseCase>(UseCase);
    
    //If type is not specified, class will be used as a type
    useCase = Bean(UseCaseClass)
    //Equivalent to
    useCase = Bean<UseCaseClass>(UseCaseClass)
    useCase: UseCaseClass = Bean(UseCaseClass)
    useCase: UseCaseClass = Bean<UseCaseClass>(UseCaseClass)
    
    //Bean configuration should be passed as a second argument. Should be an object literal.
    useCase: IUseCase = Bean(UseCase, { scope: 'prototype' });
}
```

#### Usage

```typescript
//UseCaseDependency
export class UseCaseDependency implements IUseCaseDependency {
   //...businessLogic
}

//UseCase.ts
export class UseCase implements IUseCase {
    constructor(
    	//Any name can be used
    	private useCaseDependency: IUseCaseDependency,
    ) {}
    
    //...businessLogic
}


//ApplicationContext.di.ts
import { CatContext, Bean } from 'dependency-injection-cat';

export class ApplicationContext extends CatContext<IBeans> {
    useCaseDependency = Bean<IUseCaseDependency>(UseCaseDependency);

    useCase = Bean<IUseCase>(UseCase);
}
```

### Method Bean

Method Beans are more flexible, for example it allows you to pass configuration values to your class constructor.

#### Rules

- Method Bean should always have return type, and it should not be primitive (string, number...). To register Bean with primitive type you should use type alias.

#### Syntax and Usage

```typescript
export class ApplicationContext extends CatContext<IBeans> {
   	//Bean don't have any dependencies
    @Bean
    useCase(): IUseCase {
        return new UseCase();
    }
    
    //Bean have dependencies
    dependency: IUseCaseDependency = Bean(UseCaseDependency);
    
    @Bean
    useCase(
    	useCaseDependency: IUseCaseDependency,
    ): IUseCase {
        return new UseCase(useCaseDependency);
    }
    
    //Configure Bean
    @Bean({ scope: 'prototype' })
    useCase(): IUseCase {
        return new UseCase();
    }
}
```

## Qualifier

Qualifier needed, when you have 2 or more **Beans** in the **Context** with same type. Also you can use qualifier, when injecting **Beans** from **GlobalCatContext**

#### Rules

- Qualifiers can be used only in **Method Bean**
- Argument passed to Qualifier should be a string literal and should not be an empty string
- Qualifier should be a name of Bean (class property name, or method name) defined in current **Context**

#### Syntax

```typescript
//When Bean placed in current context
export class ApplicationContext extends CatContext<IBeans> {
    httpRequester: IRequester = Bean(HttpRequester);
    graphQLRequester: IRequester = Bean(GraphQLRequester);
    
    @Bean
    useCase(
    	@Qualifier('graphQLRequester') requester: IRequester,
    ): IUseCase {
        return new UseCase(requester);
    }
}
```

```typescript
//When Bean placed in Global context

//GlobalApplicationContext.di.ts
export class GlobalApplicationContext extends GlobalCatContext {
  graphQLRequester: IRequester = Bean(GraphQLRequester);
  httpRequester: IRequester = Bean(HttpRequester);
}

//ApplicationContext.di.ts
export class ApplicationContext extends CatContext<IBeans> {
  @Bean
  useCase(
          @Qualifier('graphQLRequester') requester: IRequester,
  ): IUseCase {
    return new UseCase(requester);
  }
}
```

