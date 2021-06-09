import { CompilationContext } from '../../compilation-context/CompilationContext';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';
import { Compilation, Compiler, NormalModule } from 'webpack';
import { ContextRepository } from '../../core/context/ContextRepository';
import { RebuildStatusRepository } from './RebuildStatusRepository';
import { BeanRepository } from '../../core/bean/BeanRepository';

const reportDIErrorsHook = (compilation: Compilation) => {
    const globalContextsCount = Array.from(ContextRepository.globalContexts.values()).length;

    if (globalContextsCount > 0) {
        compilation.warnings
            .push(buildWebpackError('You have Defined Global Cat Context, Currently, DI Cat does not support hot reloading of them'));
    }

    const message = CompilationContext.getErrorMessage();

    if (message === null) {
        SourceFilesCache.clearCache();
        PathResolverCache.clearCache();
        return;
    }

    PathResolverCache.clearCache();
    SourceFilesCache.clearCache();

    compilation.errors.push(buildWebpackError(message));
};

const PLUGIN_NAME = 'DI-Cat Webpack Plugin';

export default class {
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
            const tbeanContextPaths = Array.from(ContextRepository.contextNameToTBeanNodeSourceDescriptor.values())
                .filter(it => changedFiles.has(it.nodeSourceDescriptor.path))
                .map(it => it.contextDescriptor.absolutePath);
            const dependenciesContextPaths = Array.from(BeanRepository.beanIdToBeanDescriptorMap.values())
                .filter(
                    it => it.beanSourceLocation && changedFiles.has(it.beanSourceLocation),
                )
                .map(it => it.contextDescriptor.absolutePath);
            const contextsToRebuild = new Set([
                ...tbeanContextPaths,
                ...dependenciesContextPaths,
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
