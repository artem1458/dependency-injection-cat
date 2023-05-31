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
              'dependency-injection-cat/transformers/babel'
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
              before: [diCatTransformer(program)],
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
        "transform": "dependency-injection-cat/transformers/typescript"
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
        "transform": "dependency-injection-cat/transformers/typescript"
      }
    ]
  }
}
```
