# Changelog

## 0.2.4

- [Improvement] Added typings for webpack plugin

## 0.2.3

- [Hot Reload] [Fix] Fix hot reloading for webpack 4

## 0.2.2

- [Hot Reload] [Fix] [Issue#12](https://github.com/artem1458/dependency-injection-cat/issues/12) Context now rebuilds on TBeans interface changing. If it's file only with type declarations context will not rebuild when using babel-loader
- [Improvement] [Issue#8](https://github.com/artem1458/dependency-injection-cat/issues/8) Added path of related context to the compilation errors
- [Fix] Fixed issue with production builds with webpack plugin
- [Feature] Added getOrInitContext method to the container

## 0.2.1

- Fix WebpackError for webpack < 5

## 0.2.0

- Added hot reloading support (only for non-global contexts, and only with webpack)
- Updated DI Cat webpack plugin
- compiledContextOutputDir config option now deprecated and not used

## 0.1.12

- Added autowiring **Beans** by parameter name, without **Qualifier** decorator in **Method** and **Property** Beans

## 0.1.11

- Added option to disable exposing dependency-injections-cat logo into the console.
