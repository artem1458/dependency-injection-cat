import { Compilation, Compiler, ExternalModule, NormalModule } from 'webpack';
import { RebuildStatusRepository } from './RebuildStatusRepository';
import { getCompilationContext } from '../../transformers/getCompilationContext';
import { BuildErrorFormatter } from '../../compilation-context/BuildErrorFormatter';
import { ContextRepository } from '../../core/context/ContextRepository';
import { Context } from '../../core/context/Context';
import { get } from 'lodash';

const reportDIErrorsHook = (compilation: Compilation) => {
    const compilationContext = getCompilationContext();
    const message = BuildErrorFormatter.formatErrors(
        compilationContext.errors,
    );

    if (message === null) {
        return;
    }

    compilation.errors.push(buildWebpackError(message));
};

const PLUGIN_NAME = 'DI-Cat Webpack Plugin';

export default class DICatWebpackPlugin {
    private static isErrorsHandledByWebpack = false;

    constructor() {
        DICatWebpackPlugin.isErrorsHandledByWebpack = true;
    }

    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tap(PLUGIN_NAME, reportDIErrorsHook);

        // compiler.hooks.afterCompile.tap(PLUGIN_NAME, (compilation) => {
        //     const webpack4ChangedFiles = Object.keys((compiler as any).watchFileSystem?.watcher?.mtimes ?? {});
        //
        //     const changedFiles = webpack4ChangedFiles.length > 0
        //         ? webpack4ChangedFiles
        //         : Array.from(compiler.modifiedFiles ?? []);
        //     const changedFilesSet = new Set(changedFiles);
        //
        //     const relatedPathToContexts = Array.from(ContextRepository.contextIdToContext.values())
        //         .reduce((acc, context) => {
        //             context.relatedPaths.forEach(path => {
        //                 const set = acc.get(path) ?? new Set<Context>();
        //                 set.add(context);
        //                 acc.set(path, set);
        //             });
        //
        //             return acc;
        //         }, new Map<string, Set<Context>>());
        //
        //     const contextsToRebuild = changedFiles.reduce((acc, changedFileName) => {
        //         relatedPathToContexts.get(changedFileName)?.forEach(context => {
        //             if (!changedFilesSet.has(context.fileName)) {
        //                 acc.add(context.fileName);
        //             }
        //         });
        //         return acc;
        //     }, new Set<string>());
        //
        //     const modulesToRebuild = Array.from(compilation.modules).filter((module) => {
        //         return contextsToRebuild.has(get(module, 'resource', null));
        //     });
        //
        //     modulesToRebuild.forEach(module => {
        //         compilation.rebuildModule(module.identifier, err => {
        //             if (err) {
        //                 compilation.errors.push(err);
        //             } else {
        //                 RebuildStatusRepository.registerFileRebuildEnd((module as NormalModule).resource);
        //             }
        //         });
        //     });
        // });

        compiler.hooks.done.tap(PLUGIN_NAME, (stats) => {
            RebuildStatusRepository.clear();
        });

        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            const webpack4ChangedFiles = Object.keys((compiler as any).watchFileSystem?.watcher?.mtimes ?? {});

            const changedFiles = webpack4ChangedFiles.length > 0
                ? webpack4ChangedFiles
                : Array.from(compiler.modifiedFiles ?? []);
            const changedFilesSet = new Set(changedFiles);

            const relatedPathToContexts = Array.from(ContextRepository.contextIdToContext.values())
                .reduce((acc, context) => {
                    context.relatedPaths.forEach(path => {
                        const set = acc.get(path) ?? new Set<Context>();
                        set.add(context);
                        acc.set(path, set);
                    });

                    return acc;
                }, new Map<string, Set<Context>>());

            const contextsToRebuild = changedFiles.reduce((acc, changedFileName) => {
                relatedPathToContexts.get(changedFileName)?.forEach(context => {
                    if (!changedFilesSet.has(context.fileName)) {
                        acc.add(context.fileName);
                    }
                });
                return acc;
            }, new Set<string>());

            compilation.hooks.finishModules.tapAsync(
                PLUGIN_NAME,
                (modules, callback) => {
                    if (contextsToRebuild.size === 0) {
                        callback();
                        return;
                    }

                    const contextModules = Array.from(modules)
                        .filter(it => contextsToRebuild.has((it as NormalModule).resource)) as NormalModule[];

                    if (contextsToRebuild.size !== contextModules.length) {
                        callback(buildWebpackError('Not all contexts found in webpack modules'));
                        return;
                    }

                    RebuildStatusRepository.setCallback(callback);
                    RebuildStatusRepository.registerStartRebuild(contextModules.map(it => (it as NormalModule).resource));
                    contextsToRebuild.clear();

                    contextModules.forEach(module => {
                        compilation.rebuildModule(module, err => {
                            if (err) {
                                compilation.errors.push(err);
                            } else {
                                RebuildStatusRepository.registerFileRebuildEnd((module as NormalModule).resource);
                            }
                        });
                    });
                }
            );
        });
    }
}

function buildWebpackError(message: string): any {
    return new Error(message) as any;
}
