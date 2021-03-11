# Dependency Injection Cat

------

DI Cat is a truly clean di-container, which allows you not to pollute your business logic with decorators from DI/IOC libraries!

## Example

```typescript
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
    compiledContextOutputDir ?: string; // Output directory of transformed contexts, can be specified for debug purposes. Default: node_modules/dependency-injection-cat/external/built-context
}
```



## CatContext

```typescript
class CatContext<TBeans, TConfig = null>
```

#### TBeans

TBeans is an interface, of Beans that will be given out of context. Should be the same as in **container** access calls.

##### Rules

- Should be a plain interface without extending, should not have indexed signatures

- Should be placed in your source files, not from node_modules

  ```typescript
  export interface IBeans {
      useCase: IUseCase;
      //Another beans...
  } 
  ```

#### TConfig

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



## Container

Using container you can control your contexts

#### initContext

```typescript
import { container } from 'dependency-injection-cat';
import { IBeans } from './IBeans';

const applicationContext = container.initContext<IBeans>({
    key?: any, //Can be any value, you can use it for creating pool of context.
    name: string, //It's the name of the class in which you specified the Beans. Should be a string literal
});
```

