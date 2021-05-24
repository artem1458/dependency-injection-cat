import { CompilationContext } from '../../compilation-context/CompilationContext';
import { SourceFilesCache } from '../../core/ts-helpers/source-files-cache/SourceFilesCache';
import { PathResolverCache } from '../../core/ts-helpers/path-resolver/PathResolverCache';
import { Compilation, Compiler, WebpackError, NormalModule } from 'webpack';
import { BeanRepository } from '../../core/bean/BeanRepository';
import { ContextRepository } from '../../core/context/ContextRepository';

export default class {
    apply(compiler: Compiler) {
        compiler.hooks.afterEmit.tap('Report DI Errors', (compilation: Compilation) => {
            const message = CompilationContext.getErrorMessage();

            if (message === null) {
                SourceFilesCache.clearCache();
                PathResolverCache.clearCache();
                return;
            }

            PathResolverCache.clearCache();
            SourceFilesCache.clearCache();

            compilation.errors.push(buildWebpackError(message));
        });

        compiler.hooks.compilation.tap('DI-Cat recompile context on dependencies change', (compilation) => {
            compilation.hooks.finishModules.tap('DI-Cat rebuild global cat context warning', () => {
                const globalContextPaths = Array.from(ContextRepository.globalContexts.values()).map(it => it.absolutePath);

                if(globalContextPaths.length > 0) {
                    compilation.warnings
                        .push(buildWebpackError('You have Defined Global Cat Context, Currently, DI Cat does not support hot reloading of them'));
                }
            });

            compilation.hooks.buildModule.tap('DI-Cat recompile context on dependencies change build listener', (module) => {
                if (!(module as NormalModule).resource) {
                    return;
                }

                const currentBuiltModule = module as NormalModule;

                const beanDescriptors = Array.from(BeanRepository.beanIdToBeanDescriptorMap.values());
                const currentPropertyBeansPaths = beanDescriptors.filter(descriptor =>
                    descriptor.beanSourceLocation !== null && descriptor.beanSourceLocation === currentBuiltModule.resource
                ).map(it => it.contextDescriptor.absolutePath);

                const contextWebpackModules = Array.from(compilation.modules).filter(it =>
                    currentPropertyBeansPaths.includes((it as NormalModule).resource),
                );

                contextWebpackModules.forEach(module => {
                    compilation.rebuildModule(module, (error, result) => {
                        if (error) {
                            compilation.errors.push(error);
                        }
                    });
                });
            });
        });
    }
}

function buildWebpackError(message: string): WebpackError {
    return WebpackError ? new WebpackError(message) : new Error(message) as any;
}
