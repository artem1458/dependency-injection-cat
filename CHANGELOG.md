# Changelog

## 2.0.0
- [Feature] Build core for intellij plugins support
- [Breaking changes] Removed GlobalCatContexts
- [Breaking changes] Changed container API to use context class instead of context name

## 1.1.0

- [Feature] EmbeddedBean feature implemented

## 1.0.1

- [Improvement] Allow container access inside files with context

## 1.0.0

- [Fix] [Issue#15](https://github.com/artem1458/dependency-injection-cat/issues/26)
- [Feature] Bean injection, when one Bean implements multiple types/interfaces e.g. `crudRepository: IReadRepository & IWriteRepository = Bean(CRUDRepository);`
- [Feature] Bean list injection e.g. `@Bean drawer(figures: IFigure[]): IDrawer => new Drawer(figures)`

## 0.2.12

- [Fix] Make **typescript** as a Peer Dependency

## 0.2.11

- [Feature] Added Context Lifecycle methods **@PostConstruct** and **@BeforeDestruct** decorators

## 0.2.10

- [Improvement] Added injection Beans from node_modules and qualifying class dependencies from node_modules

## 0.2.8 - 0.2.9

- [Feature] Added **Arrow Function Beans** and **Expression Beans**

## 0.2.7

- [Fix] Replace relative path to InternalCatContext and ContextPool

## 0.2.5 - 0.2.6

- [Fix] Fixed ReportErrorsTypescriptPlugin

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
