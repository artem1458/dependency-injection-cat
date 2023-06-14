import { Compilation, Compiler, NormalModule } from 'webpack';
import { RebuildStatusRepository } from './RebuildStatusRepository';
import { getCompilationContext } from '../../transformers/getCompilationContext';
import { BuildErrorFormatter } from '../../compilation-context/BuildErrorFormatter';
import { ContextRepository } from '../../core/context/ContextRepository';

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

        compiler.hooks.done.tap(PLUGIN_NAME, () => {
            RebuildStatusRepository.clear();
        });

        compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
            const webpack4ChangedFiles = Object.keys((compiler as any).watchFileSystem?.watcher?.mtimes ?? {});

            const changedFiles = webpack4ChangedFiles.length > 0
                ? new Set(webpack4ChangedFiles)
                : new Set(Array.from(compiler.modifiedFiles ?? []));

            const contexts = Array.from(ContextRepository.contextIdToContext.values());

            const changedContextPaths = contexts.map(it => it.fileName).filter(it => changedFiles.has(it));
            const contextTypePaths = Array.from(ContextRepository.contextIdToContext.values())
                .map(it => it.typePaths).flat()
                .filter(it => changedFiles.has(it));

            //TODO
            // const dependenciesContextPaths = Array.from(BeanRepository.beanIdToBeanDescriptor.values())
            //     .filter(
            //         it => it.beanImplementationSource && changedFiles.has(it.beanImplementationSource.path),
            //     )
            //     .map(it => it.contextDescriptor.fileName);
            const contextsToRebuild = new Set([
                ...contextTypePaths,
                ...changedContextPaths,
            ]);

            compilation.hooks.finishModules.tapAsync(
                PLUGIN_NAME,
                (modules, callback) => {
                    const contextModules = Array.from(modules)
                        .filter(it => contextsToRebuild.has((it as NormalModule).resource)) as NormalModule[];

                    if (contextsToRebuild.size !== contextModules.length) {
                        callback(buildWebpackError('Not all contexts found in webpack modules'));
                        return;
                    }

                    if (contextModules.length === 0) {
                        callback();
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
