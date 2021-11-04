## Installation

#### Yarn

```bash
yarn add dependency-injection-cat
```

#### NPM

```bash
npm install dependency-injection-cat
```

#### Requirements for tsconfig

```json5
//tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "Base url should be specified!"
  }
}
```

#### Webpack + Babel

```typescript
//webpack.config.js
const DiCatWebpackPlugin = require('dependency-injection-cat/plugins/webpack').default;

module.exports = {
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: 'babel-loader',
        options: {
          plugins: [
            [
              'dependency-injection-cat/transformers/babel',
              {
                //Configuration options, see below
              }
            ]
          ]
        }
      }
    ]
  },
  plugins: [
    new DiCatWebpackPlugin(),
  ]
}
```

#### Webpack + TS-Loader

```typescript
//webpack.config.js
const DiCatWebpackPlugin = require('dependency-injection-cat/plugins/webpack').default;
const diCatTransformer = require('dependency-injection-cat/transformers/typescript').default;

module.exports = {
  //...
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
    new DiCatWebpackPlugin(),
  ]
}
```

#### Webpack + TS-Loader + ttypescript

```typescript
//webpack.config.js
const DiCatWebpackPlugin = require('dependency-injection-cat/plugins/webpack').default;

module.exports = {
  //...
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
    new DiCatWebpackPlugin(),
  ]
}
```

```json5
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

#### TTypescript

```json5
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
interface IOptions {
  diConfigPattern: string | undefined; // Glob pattern, default value. Default: '**/*.di.ts'
  ignorePatterns: Array<string> | undefined; // Array of Glob patterns, default value. Default: ['**/node_modules/**']
  disableLogoPrint: boolean | undefined; // Disable exposing dependency-injections-cat logo into console. Default: false
}
```
